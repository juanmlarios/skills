#!/usr/bin/env python3
"""OpenAI-compatible HTTP proxy that forwards chat-completion requests to the
local `claude --print` CLI.

Why: gitnexus's wiki generator speaks the OpenAI chat-completions protocol with
a `--provider custom --base-url <url>` escape hatch. Pointing it at this proxy
lets the wiki use the user's existing Claude Code authentication — no API key.

What it implements:
  GET  /health                  — readiness check for the run-wiki script
  GET  /v1/models               — stub list (gitnexus sometimes probes this)
  POST /v1/chat/completions     — translate to `claude --print`, return result

Translation:
  - The first `role: "system"` message becomes `--system-prompt`.
  - All remaining messages (user / assistant / additional system) are
    concatenated into a single user prompt with role tags. `claude --print`
    is single-turn, so multi-turn history collapses to one user message.
  - `model` flows through to `claude --model`.
  - `max_tokens`, `temperature`, etc. are ignored — claude has its own defaults.

Concurrency: ThreadingHTTPServer handles parallel requests (gitnexus runs
~3 concurrent calls by default).
"""

from __future__ import annotations

import argparse
import json
import logging
import shutil
import socketserver
import subprocess
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

LOG = logging.getLogger("claude-proxy")

CLAUDE_TIMEOUT_S = 180


def _claude_path() -> str:
    p = shutil.which("claude")
    if not p:
        raise RuntimeError("`claude` not found on PATH; install Claude Code first.")
    return p


def _flatten_messages(messages: list[dict]) -> tuple[str, str]:
    """Return (system_prompt, user_prompt).

    First system message → system_prompt.
    Everything else (including additional systems) → tagged user prompt.
    """
    system_prompt = ""
    body_parts: list[str] = []
    seen_system = False
    for m in messages:
        role = (m.get("role") or "user").lower()
        content = _content_to_text(m.get("content"))
        if not content:
            continue
        if role == "system" and not seen_system:
            system_prompt = content
            seen_system = True
            continue
        tag = role.upper()
        body_parts.append(f"[{tag}]\n{content}")
    user_prompt = "\n\n".join(body_parts) if body_parts else "(no content)"
    return system_prompt, user_prompt


def _content_to_text(content: Any) -> str:
    """OpenAI content can be a string or a list of {type, text} parts."""
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for p in content:
            if isinstance(p, dict) and p.get("type") == "text":
                parts.append(p.get("text", ""))
            elif isinstance(p, str):
                parts.append(p)
        return "\n".join(parts)
    return str(content)


def _run_claude(*, model: str, system: str, user: str) -> str:
    cmd = [
        _claude_path(),
        "--print",
        "--model", model,
        "--tools", "",
        "--disable-slash-commands",
        "--no-session-persistence",
        "--output-format", "text",
    ]
    if system:
        cmd.extend(["--system-prompt", system])
    cmd.append(user)
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=CLAUDE_TIMEOUT_S)
    if res.returncode != 0:
        raise RuntimeError(
            f"claude --print failed (exit {res.returncode}): {res.stderr.strip() or '<no stderr>'}"
        )
    return res.stdout.strip()


def _approx_tokens(s: str) -> int:
    return max(1, len(s) // 4)


class Handler(BaseHTTPRequestHandler):
    server_version = "claude-proxy/0.1"

    def log_message(self, format: str, *args) -> None:  # noqa: A002 — http.server signature
        LOG.info("%s - %s", self.address_string(), format % args)

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ---- routes -------------------------------------------------------------

    def do_GET(self) -> None:
        if self.path == "/health":
            self._send_json(200, {"status": "ok"})
            return
        if self.path == "/v1/models":
            self._send_json(200, {
                "object": "list",
                "data": [
                    {"id": "sonnet", "object": "model", "owned_by": "anthropic"},
                    {"id": "opus", "object": "model", "owned_by": "anthropic"},
                    {"id": "haiku", "object": "model", "owned_by": "anthropic"},
                ],
            })
            return
        self._send_json(404, {"error": {"message": f"unknown path {self.path}"}})

    def do_POST(self) -> None:
        if self.path != "/v1/chat/completions":
            self._send_json(404, {"error": {"message": f"unknown path {self.path}"}})
            return
        length = int(self.headers.get("Content-Length", "0"))
        try:
            body = self.rfile.read(length).decode("utf-8") if length else ""
            req = json.loads(body) if body else {}
        except (ValueError, UnicodeDecodeError) as e:
            self._send_json(400, {"error": {"message": f"invalid request body: {e}"}})
            return

        model = req.get("model") or "sonnet"
        messages = req.get("messages") or []
        stream = bool(req.get("stream", False))
        if not messages:
            self._send_json(400, {"error": {"message": "messages[] is required"}})
            return

        system, user = _flatten_messages(messages)
        completion_id = f"chatcmpl-{uuid.uuid4().hex[:24]}"
        created = int(time.time())
        LOG.warning(
            "incoming request: model=%s stream=%s system_chars=%d user_chars=%d",
            model, stream, len(system), len(user),
        )

        if stream:
            # Start the SSE stream IMMEDIATELY (before claude returns) so the
            # client's body-read timer is satisfied. Keep-alive heartbeats run
            # in a background thread until claude finishes.
            self._stream_with_heartbeat(
                completion_id=completion_id,
                created=created,
                model=model,
                system=system,
                user=user,
            )
            return

        # Non-streaming path: synchronous call, single JSON response.
        try:
            content = _run_claude(model=model, system=system, user=user)
        except subprocess.TimeoutExpired:
            self._send_json(504, {"error": {"message": "claude --print timed out"}})
            return
        except Exception as e:
            LOG.error("claude call failed: %s", e)
            self._send_json(500, {"error": {"message": str(e)}})
            return

        prompt_tokens = _approx_tokens(system) + _approx_tokens(user)
        completion_tokens = _approx_tokens(content)

        self._send_json(200, {
            "id": completion_id,
            "object": "chat.completion",
            "created": created,
            "model": model,
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }],
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
            },
        })

    # ---- streaming helper ---------------------------------------------------

    def _stream_with_heartbeat(
        self,
        *,
        completion_id: str,
        created: int,
        model: str,
        system: str,
        user: str,
    ) -> None:
        """Open the SSE stream immediately, run claude in a background thread,
        and emit periodic keep-alives while waiting so the client's body-read
        timeout doesn't fire."""
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-transform")
        self.send_header("Connection", "close")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()
        # Avoid keep-alive — some clients (notably Node's undici body parser)
        # do not advance their finished-response state until the connection
        # actually closes after [DONE].
        self.close_connection = True

        write_lock = threading.Lock()

        def emit(payload: dict) -> None:
            data = b"data: " + json.dumps(payload).encode("utf-8") + b"\n\n"
            with write_lock:
                self.wfile.write(data)
                self.wfile.flush()

        def emit_raw(line: bytes) -> None:
            with write_lock:
                self.wfile.write(line)
                self.wfile.flush()

        base = {
            "id": completion_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model,
        }

        # Chunk 1 (immediate): role announcement. Starts the stream within ms,
        # which satisfies undici's body-read timer.
        emit({**base, "choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": None}]})

        # Run claude in a background thread; meanwhile send SSE comment lines
        # ("data:\n\n" or ":\n\n") as keep-alives every few seconds.
        result: dict[str, Any] = {"content": None, "error": None}

        t_start = time.monotonic()

        def runner() -> None:
            try:
                result["content"] = _run_claude(model=model, system=system, user=user)
            except subprocess.TimeoutExpired:
                result["error"] = "claude --print timed out"
            except Exception as e:
                result["error"] = str(e)
            finally:
                LOG.warning(
                    "claude call done after %.1fs (%s)",
                    time.monotonic() - t_start,
                    "ok" if result["error"] is None else f"error: {result['error']}",
                )

        t = threading.Thread(target=runner, daemon=True)
        t.start()
        # Heartbeat every 5s. We send empty-delta data: chunks rather than
        # SSE comments because some HTTP clients (notably Node's undici)
        # don't reset their body-read timers on comment lines — they need
        # actual `data:` payloads.
        while t.is_alive():
            t.join(timeout=5.0)
            if t.is_alive():
                try:
                    emit({**base, "choices": [{
                        "index": 0,
                        "delta": {"content": ""},
                        "finish_reason": None,
                    }]})
                except (BrokenPipeError, ConnectionResetError):
                    LOG.warning("client disconnected while waiting on claude")
                    return

        if result["error"] is not None:
            emit({**base, "choices": [{
                "index": 0,
                "delta": {"content": f"\n\n[proxy error: {result['error']}]\n"},
                "finish_reason": "stop",
            }]})
            emit_raw(b"data: [DONE]\n\n")
            return

        content = result["content"] or ""
        emit({**base, "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": None}]})
        emit({**base, "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]})
        emit_raw(b"data: [DONE]\n\n")


class _Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, required=True, help="Port to bind to (localhost only).")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="[claude-proxy] %(levelname)s %(message)s",
    )

    try:
        server = _Server(("127.0.0.1", args.port), Handler)
    except OSError as e:
        print(f"[claude-proxy] cannot bind to localhost:{args.port}: {e}", file=sys.stderr)
        return 2

    LOG.info("listening on http://127.0.0.1:%d", args.port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
