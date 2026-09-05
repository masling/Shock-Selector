"""Extract original embedded catalog images for local UI preview (no retouching)."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from pypdf import PdfReader

parser = argparse.ArgumentParser()
parser.add_argument("catalog", type=Path)
args = parser.parse_args()
source = args.catalog.resolve(strict=True)
reader = PdfReader(source)
output = Path("data/staging/ui-media")
output.mkdir(parents=True, exist_ok=True, mode=0o700)
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
manifest = {}
# Physical PDF page, printed page, embedded image identity, intended use.
assets = [
    ("JYXR_P", 29, 27, "Im1.jp2", "series-photo"),
    ("JYXR_P_DRAWING", 29, 27, "Im0.png", "series-structural-diagram"),
    ("JYXR_H", 31, 29, "Im0.jp2", "series-photo"),
]
for key, pdf_page, printed_page, image_name, usage in assets:
    page = reader.pages[pdf_page - 1]
    if f"JYXR({key.split('_')[1]})" not in page.extract_text():
        raise ValueError(f"Unexpected source page: {pdf_page}")
    embedded = next(image for image in page.images if image.name == image_name)
    buffer = io.BytesIO()
    # Decode the embedded JP2/PNG pixels into browser-supported PNG, without resizing/cropping.
    embedded.image.save(buffer, format="PNG")
    data = buffer.getvalue()
    digest = hashlib.sha256(data).hexdigest()
    filename = digest + ".png"
    target = output / filename
    if not target.exists():
        target.write_bytes(data)
        target.chmod(0o600)
    manifest[key] = {
        "file": filename, "source": f"{source.name}, printed page {printed_page}",
        "sourceSha256": source_hash, "pdfPage": pdf_page, "printedPage": printed_page,
        "embeddedImage": image_name, "usage": usage, "width": embedded.image.width,
        "height": embedded.image.height, "sha256": digest,
        "approval": "pending", "previewOnly": True,
    }
manifest_path = output / "pipe-catalog-manifest.json"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
manifest_path.chmod(0o600)
print(json.dumps(manifest, ensure_ascii=False, indent=2))
