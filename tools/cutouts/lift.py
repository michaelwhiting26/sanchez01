import sys, os, glob
import Vision, Quartz
from Foundation import NSURL, NSIndexSet

out = sys.argv[1]
ctx = Quartz.CIContext.context()
cs = Quartz.CGColorSpaceCreateWithName(Quartz.kCGColorSpaceSRGB)

def save(pb, path):
    ci = Quartz.CIImage.imageWithCVPixelBuffer_(pb)
    ok, err = ctx.writePNGRepresentationOfImage_toURL_format_colorSpace_options_error_(
        ci, NSURL.fileURLWithPath_(path), Quartz.kCIFormatRGBA8, cs, {}, None)
    if not ok: print("  save fail", path, err)

for p in sys.argv[2:]:
    stem = os.path.splitext(os.path.basename(p))[0]
    src = Quartz.CIImage.imageWithContentsOfURL_(NSURL.fileURLWithPath_(p))
    if src is not None:
        o = (src.properties() or {}).get('Orientation')
        if o and int(o) != 1: src = src.imageByApplyingCGOrientation_(int(o))
    if src is None: print("FAIL load", stem); continue
    h = Vision.VNImageRequestHandler.alloc().initWithCIImage_options_(src, {})
    req = Vision.VNGenerateForegroundInstanceMaskRequest.alloc().init()
    ok, err = h.performRequests_error_([req], None)
    res = req.results()
    if not ok or not res or len(res) == 0:
        print(f"{stem}: 0 instances", err); continue
    obs = res[0]
    inst = obs.allInstances()
    n = inst.count()
    e = src.extent()
    print(f"{stem}: {n} instances {int(e.size.width)}x{int(e.size.height)}", flush=True)
    pb, err = obs.generateMaskedImageOfInstances_fromRequestHandler_croppedToInstancesExtent_error_(inst, h, True, None)
    if pb is not None: save(pb, os.path.join(out, f"{stem}__all.png"))
    if n > 1:
        i = inst.firstIndex()
        while i != Quartz.NSNotFound if hasattr(Quartz,'NSNotFound') else i < 1000:
            pb, err = obs.generateMaskedImageOfInstances_fromRequestHandler_croppedToInstancesExtent_error_(NSIndexSet.indexSetWithIndex_(i), h, True, None)
            if pb is not None: save(pb, os.path.join(out, f"{stem}__i{i}.png"))
            nx = inst.indexGreaterThanIndex_(i)
            if nx > 100000: break
            i = nx
