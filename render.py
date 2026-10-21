"""Rend un post JSON en slides JPG 1080x1350.
Usage : python3 render.py post.json dossier_sortie
Sortie : dossier_sortie/<id>_1.jpg ... + apercu.jpg (planche réduite pour vérifier)
"""
import json, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image

post_path, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
post = json.load(open(post_path, encoding="utf-8"))
os.makedirs(out, exist_ok=True)
html = open(os.path.join(here, "template.html"), encoding="utf-8").read()
html = html.replace("<script>", "<script>window.POST=" + json.dumps(post, ensure_ascii=False) + ";", 1)
tmp = os.path.join(out, "_page.html")
open(tmp, "w", encoding="utf-8").write(html)

files = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1350})
    pg.goto("file://" + os.path.abspath(tmp))
    pg.wait_for_timeout(300)
    for i in range(1, len(post["slides"]) + 1):
        png = os.path.join(out, f"_{i}.png")
        pg.locator(f"#s{i}").screenshot(path=png)
        jpg = os.path.join(out, f"{post['id']}_{i}.jpg")
        Image.open(png).convert("RGB").save(jpg, quality=92)
        os.remove(png)
        files.append(jpg)
    b.close()
os.remove(tmp)

# planche d'aperçu basse résolution (vérif visuelle à moindre coût)
w, h = 216, 270
sheet = Image.new("RGB", (w * len(files) + 8 * (len(files) - 1), h), "black")
for k, f in enumerate(files):
    sheet.paste(Image.open(f).resize((w, h)), (k * (w + 8), 0))
sheet.save(os.path.join(out, "apercu.jpg"), quality=80)
print("\n".join(files))
