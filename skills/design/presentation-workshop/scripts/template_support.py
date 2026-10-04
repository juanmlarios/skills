"""Text formatting support extracted from the approved template builder."""
from copy import deepcopy
from lxml import etree as ET

NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "ct": "http://schemas.openxmlformats.org/package/2006/content-types",
}

def q(prefix, name):
    return f"{{{NS[prefix]}}}{name}"

def replace_text(shape, value):
    """Keep paragraph/run formatting, including bullet settings and font size."""
    body = shape.find("p:txBody", NS)
    original = next(p for p in body.findall("a:p", NS) if p.find("a:r", NS) is not None)
    template = deepcopy(original)
    for p in body.findall("a:p", NS):
        body.remove(p)
    for line in value.split("\n"):
        p = deepcopy(template)
        run = deepcopy(p.find("a:r", NS))
        for child in list(p):
            if child.tag not in [q("a", "pPr")]:
                p.remove(child)
        run.find("a:t", NS).text = line
        p.append(run)
        end = deepcopy(run.find("a:rPr", NS))
        end.tag = q("a", "endParaRPr")
        p.append(end)
        # Defaults are needed when PowerPoint inserts a fresh placeholder.
        prop = p.find("a:pPr", NS)
        if prop is None:
            prop = ET.Element(q("a", "pPr"))
            p.insert(0, prop)
        default = prop.find("a:defRPr", NS)
        if default is not None:
            prop.remove(default)
        default = deepcopy(run.find("a:rPr", NS))
        default.tag = q("a", "defRPr")
        prop.append(default)
        body.append(p)
    # Carry the field's own formatting into all nine text levels.
    style = body.find("a:lstStyle", NS)
    style.clear()
    prop = body.find("a:p/a:pPr", NS)
    default_paragraph = deepcopy(prop)
    default_paragraph.tag = q("a", "defPPr")
    style.append(default_paragraph)
    for level in range(1, 10):
        item = deepcopy(prop)
        item.tag = q("a", f"lvl{level}pPr")
        if item.find("a:buChar", NS) is not None:
            item.set("marL", str(342900 + (level - 1) * 457200))
            item.set("indent", "-342900")
        style.append(item)
    bodyprop = body.find("a:bodyPr", NS)
    bodyprop.set("wrap", "square")
    for autofit in list(bodyprop):
        if ET.QName(autofit).localname in ["normAutofit", "spAutoFit", "noAutofit"]:
            bodyprop.remove(autofit)
    ET.SubElement(bodyprop, q("a", "normAutofit"))
