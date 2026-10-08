import os, sys, numpy as np
from PIL import Image, ImageOps, ImageFilter
from ultralytics import SAM
R, out = sys.argv[1], sys.argv[2]
J = {  # the phone screenshots, black bars cropped off and enlarged 4x first (upscale.py)
 '4766': [('black',(.00,.52,.27,.92),[]),('white',(.25,.49,.50,.87),[]),('gold',(.49,.46,.74,.86),[(.60,.90),(.62,.30)]),('green',(.71,.49,.99,.93),[])],
 '4763': [('cross',(.09,.03,.52,.60),[(.55,.50),(.45,.62)])],
 '4764': [('L',(.03,.14,.50,.92),[]),('R',(.49,.12,.94,.92),[])],
}
m = SAM('sam2.1_l.pt')
for nm, jobs in J.items():
    f=[x for x in os.listdir(R) if x.startswith(nm+'.')][0]
    im=ImageOps.exif_transpose(Image.open(os.path.join(R,f))).convert('RGB'); W,H=im.size
    for tag,b,neg in jobs:
        box=[b[0]*W,b[1]*H,b[2]*W,b[3]*H]
        kw=dict(bboxes=[box])
        if neg:
            cx,cy=(box[0]+box[2])/2,(box[1]+box[3])/2
            kw['points']=[[[cx,cy]]+[[x*W,y*H] for x,y in neg]]; kw['labels']=[[1]+[0]*len(neg)]
        try: r=m(im, verbose=False, **kw)[0]
        except Exception as e:
            print(nm,tag,'ERR combined',e); r=m(im, verbose=False, bboxes=[box])[0]
        mk=r.masks.data[0].cpu().numpy().astype(np.uint8)*255
        a=Image.fromarray(mk).resize((W,H)).filter(ImageFilter.GaussianBlur(1.2))
        o=im.convert('RGBA'); o.putalpha(a); o=o.crop(a.point(lambda v:255 if v>20 else 0).getbbox())
        o.save(os.path.join(out,f'{nm}__{tag}.png')); print(nm,tag,o.size,flush=True)
