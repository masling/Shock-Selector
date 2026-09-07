"""Publish only explicitly selected catalogue pixels, with source provenance."""
import hashlib
import json
from pathlib import Path
from PIL import Image
import pypdfium2 as pdfium

root=Path(__file__).resolve().parents[1]
library=root/'outputs/chinese-catalog-library'
choices=json.loads((root/'scripts/catalog-sources/website-catalog-media.json').read_text())
out=root/'public/products/catalog'
out.mkdir(parents=True,exist_ok=True)
manifest={}
for key,choice in choices.items():
    source=library/choice['sourceFile']
    image=Image.open(source).convert('RGBA')
    source_doc=json.loads((library/choice['catalog']/'manifest.json').read_text())
    if choice['sourceFile'].startswith('original-images/'):
        # PDF image Decode arrays, masks and transforms are part of the artwork.
        # Use PDFium rendering instead of displaying the encoded stream directly.
        pdf=pdfium.PdfDocument(source_doc['source'])
        page=pdf[choice['pdfPage']-1]
        matches=[]
        for obj in page.get_objects():
            if obj.type==3:
                meta=obj.get_metadata()
                if (meta.width,meta.height)==image.size:
                    matches.append(obj)
        if not matches:
            raise ValueError(f'No original-sized PDF image found for {key}')
        if len(matches)>1:
            bounds={tuple(round(v,2) for v in obj.get_bounds()) for obj in matches}
            if len(bounds)!=1:
                raise ValueError(f'Ambiguous original-sized PDF images for {key}')
            left,bottom,right,top=matches[0].get_bounds()
            bitmap=page.render(scale=2,crop=(left,bottom,page.get_width()-right,page.get_height()-top))
        else:
            bitmap=matches[0].get_bitmap(render=True)
        image=bitmap.to_pil().convert('RGBA').copy()
        bitmap.close()
        page.close()
        pdf.close()
    background=Image.new('RGBA',image.size,'white')
    background.alpha_composite(image)
    image=background.convert('RGB')
    image.thumbnail((1400,1000))
    filename=key.lower().replace('_','-')+'.webp'
    image.save(out/filename,format='WEBP',quality=90)
    manifest[key]={**choice,'sourceSha256':source_doc['sha256'],'sourceTitle':source_doc['filename'],
       'url':'/products/catalog/'+filename,'width':image.width,'height':image.height,
       'imageSha256':hashlib.sha256((out/filename).read_bytes()).hexdigest()}
(root/'lib/catalog/catalog-media-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'assets':len(manifest),'bytes':sum(p.stat().st_size for p in out.glob('*.webp'))}))
