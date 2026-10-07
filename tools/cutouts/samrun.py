import os, sys, numpy as np
from PIL import Image, ImageOps, ImageFilter
from ultralytics import SAM
R, out = sys.argv[1], sys.argv[2]
J = {  # name: [(tag, box, neg points)]
 'IMG_3865': [('L',(.085,.24,.515,.97),[(.35,.97),(.42,.93)]),('R',(.505,.24,.935,1.0),[(.52,.9),(.58,.95)])],
 'IMG_4157': [('L',(.09,.13,.52,.88),[(.42,.90)]),('R',(.50,.17,.93,.91),[(.55,.87),(.45,.93)])],
 'IMG_4764': [('L',(.03,.36,.50,.70),[]),('R',(.49,.35,.94,.70),[])],
 'IMG_4175': [('freddie',(.12,.49,.43,.99),[]),('roach',(.42,.49,.74,.98),[])],
 'IMG_4177': [('freddie',(.03,.08,.50,.87),[])],
 'IMG_4181': [('freddie',(.50,.18,.98,.92),[])],
 'IMG_4178': [('roach',(.53,.49,.81,.93),[]),('back',(.26,.48,.56,.98),[(.30,.50),(.2,.6)])],
 'IMG_4184': [('freddie',(.01,.12,.50,.43),[]),('roach',(.03,.42,.50,.73),[])],
 'IMG_5092': [('top',(.20,.19,.82,.52),[]),('bottom',(.02,.49,.99,.92),[])],
 'IMG_4896': [('front',(.10,.11,.52,.93),[]),('back',(.49,.03,.99,.92),[(.6,.92),(.55,.88)])],
 'IMG_3864': [('pair',(.19,.05,.76,.97),[(.45,.86),(.42,.95),(.5,.80)])],
 'IMG_4161': [('pair',(.22,.10,.73,.98),[(.33,.93),(.52,.92)])],
 'IMG_4158': [('side',(.10,.36,.97,.90),[(.45,.93),(.3,.95),(.6,.93),(.05,.45)])],
 'IMG_3867': [('face',(0,.08,.96,.98),[(.12,.92)])],
 'IMG_2741': [('mitts',(.23,.60,.46,.87),[])],
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
