import os, sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
S=sys.argv[1]
c=lambda n:f"{S}/cut/{n}"; k=lambda n:f"{S}/comp/{n}"; s=lambda n:f"{S}/sam/{n}"
Z='7deae082-94a1-49e3-8214-9345915f2eff'
L=[ # (out name, src, rotate deg ccw, multi-part)
 ('focus-mitts-freddie-roach-pair-front', c('IMG_4156__all.png'),0,1),
 ('focus-mitts-freddie-front', s('IMG_4177__freddie.png'),0,0),
 ('focus-mitts-freddie-front-alt', k('IMG_4156__c1.png'),0,0),
 ('focus-mitts-roach-front', k('IMG_4156__c2.png'),0,0),
 ('focus-mitts-freddie-roach-pair-angle-1', c('IMG_4159__all.png'),0,1),
 ('focus-mitts-freddie-roach-pair-angle-2', c('IMG_4189__all.png'),0,1),
 ('focus-mitts-freddie-roach-pair-angle-3', c('IMG_4190__all.png'),0,1),
 ('focus-mitts-freddie-roach-side-single', s('IMG_4158__side.png'),0,0),
 ('focus-mitts-freddie-roach-side-pair', s('IMG_4161__pair.png'),0,0),
 ('focus-mitts-freddie-roach-hand-opening', c('IMG_4160__all.png'),0,0),
 ('focus-mitts-shamrock-face-matte-left', s('IMG_4157__L.png'),0,0),
 ('focus-mitts-shamrock-face-matte-right', s('IMG_4157__R.png'),0,0),
 ('focus-mitts-shamrock-face-gloss', s('IMG_3867__face.png'),0,0),
 ('focus-mitts-shamrock-face-gloss-alt', s('IMG_3865__L.png'),0,0),
 ('focus-mitts-bowman-pair-angle', c('IMG_3866__all.png'),0,1),
 ('focus-mitts-bowman-side-pair', s('IMG_3864__pair.png'),0,0),
 ('focus-mitts-brown-zv-pair', c(Z+'__all.png'),0,1),
 ('focus-mitts-brown-zv-front', c('a9b645f4-5645-44fa-9a88-0766a3dc4925__all.png'),0,0),
 ('focus-mitts-brown-zv-face', k(Z+'__c1.png'),0,0),
 ('focus-mitts-brown-zv-side-pair', c('f64a8b00-989b-48a0-b0dd-0200ebf64e63__all.png'),0,0),
 ('focus-mitts-christian-ennor-pair-front', c('IMG_4894__all.png'),0,1),
 ('focus-mitts-christian-front', s('IMG_4896__front.png'),0,0),
 ('focus-mitts-ennor-front', k('IMG_4894__c2.png'),0,0),
 ('focus-mitts-christian-ennor-pair-angle', c('IMG_4895__all.png'),0,1),
 ('focus-mitts-red-white-blue-pair', c('IMG_3597__all.png'),0,1),
 ('focus-mitts-team-savva-pair', c('IMG_4764__all.png'),0,1),
 ('focus-mitts-team-savva-left', s('IMG_4764__L.png'),0,0),
 ('focus-mitts-team-savva-right', s('IMG_4764__R.png'),0,0),
 ('focus-mitts-savva-england-cross', c('IMG_4763__all.png'),0,1),
 ('focus-mitts-ttl-pair', c('IMG_2742__all.png'),0,0),
 ('body-protector-ttl-with-mitts', c('IMG_2741__all.png'),0,1),
 ('groin-guard-sh-set', c('IMG_5092__all.png'),0,1),
 ('groin-guard-sh-small', s('IMG_5092__top.png'),0,0),
 ('groin-guard-sh-large', s('IMG_5092__bottom.png'),0,0),
]
for name,src,rot,multi in L:
    a=np.array(Image.open(src).convert('RGBA'))
    al=a[...,3]
    if '/sam/' in src:
        inner=ndi.binary_erosion(ndi.binary_fill_holes(al>40),iterations=3); al=np.where(inner,255,al)
    if name=='focus-mitts-ttl-pair':
        al=al.copy(); al[:, int(al.shape[1]*0.80):]=0
    fg=al>40
    lab,n=ndi.label(fg)
    if n>1:
        ar=ndi.sum(fg,lab,range(1,n+1)); keep=[i+1 for i,v in enumerate(ar) if v>=(0.03 if multi else 0.5)*ar.max()]
        al=np.where(np.isin(lab,keep),al,0)
    al=ndi.grey_erosion(al,size=(3,3))            # 1px defringe
    a[...,3]=al
    ys,xs=np.where(al>8); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]
    im=Image.fromarray(a)
    if rot: im=im.rotate(rot,expand=True)
    w,h=im.size; side=int(max(w,h)*1.14)
    cv=Image.new('RGBA',(side,side),(0,0,0,0)); cv.alpha_composite(im,((side-w)//2,(side-h)//2))
    cv.save(f"{S}/final/{name}.png",optimize=True)
    wb=Image.new('RGBA',(side,side),(255,255,255,255)); wb.alpha_composite(cv); wb.convert('RGB').save(f"{S}/final/white/{name}.jpg",quality=92)
    print(f"{name}  product {w}x{h}")
