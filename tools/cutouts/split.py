import sys, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
for f in sorted(glob.glob(os.path.join(src,'*__all.png'))):
    stem = os.path.basename(f).replace('__all.png','')
    im = Image.open(f).convert('RGBA'); a = np.array(im)
    fg = a[...,3] > 128
    it = max(3, int(0.012*max(fg.shape)))
    er = ndi.binary_erosion(fg, iterations=it)
    lab, n = ndi.label(er)
    if n == 0: continue
    areas = ndi.sum(er, lab, range(1,n+1)); tot = areas.sum()
    keep = [i+1 for i,ar in enumerate(areas) if ar > 0.04*tot]
    if len(keep) < 2: print(stem, 1); continue
    seeds = np.isin(lab, keep)
    idx = ndi.distance_transform_edt(~seeds, return_distances=False, return_indices=True)
    full = lab[idx[0], idx[1]] * fg
    print(stem, len(keep))
    for k in keep:
        m = full == k
        ys, xs = np.where(m)
        b = a.copy(); b[...,3] = np.where(m, a[...,3], 0)
        Image.fromarray(b[ys.min():ys.max()+1, xs.min():xs.max()+1]).save(os.path.join(out, f"{stem}__c{k}.png"))
