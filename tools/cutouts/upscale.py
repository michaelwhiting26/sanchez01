"""4x enlargement with Real-ESRGAN (github.com/xinntao/Real-ESRGAN), loaded through spandrel. usage: upscale.py <weights.pth> <out dir> <image>..."""
import sys, os, numpy as np, torch
from PIL import Image
from spandrel import ModelLoader
dev = "mps" if torch.backends.mps.is_available() else "cpu"
model = ModelLoader().load_from_file(sys.argv[1]).to(dev).eval()
for p in sys.argv[3:]:
    im = Image.open(p).convert("RGB")
    x = torch.from_numpy(np.asarray(im)).permute(2, 0, 1).float().div(255).unsqueeze(0).to(dev)
    with torch.no_grad(): y = model(x)
    out = (y.squeeze(0).permute(1, 2, 0).clamp(0, 1).cpu().numpy() * 255).round().astype("uint8")
    Image.fromarray(out).save(os.path.join(sys.argv[2], os.path.basename(p))); print(os.path.basename(p), im.size, "->", out.shape[1::-1], flush=True)
