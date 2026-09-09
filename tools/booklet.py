#!/usr/bin/env python3
"""Isometrica + Ecophilia booklets. 16:9 pages. Per product: a spec page (the 1:1 in the middle, writing either side)
and an art page (full bleed). Renders HTML → PDF with Playwright's Chromium.
usage: booklet.py iso|eco|both"""
import os,sys,json,re,collections
from PIL import Image
sys.path.insert(0,os.path.dirname(__file__)); from blueprint import parse; import findings, place
HOME=os.path.expanduser('~'); SKO=f'{HOME}/sko-brandbook-site'; MER=f'{HOME}/meridian-brandbook'; PEP=f'{HOME}/Desktop/jackmorellodotcom/public/peptides'
OUT=f'{HOME}/Desktop/BOOKS'; CACHE=f'{OUT}/_img'; os.makedirs(CACHE,exist_ok=True)
def web(src,key,maxpx=2200,q=88):
    dst=f'{CACHE}/{key}.jpg'
    if not os.path.exists(dst) or os.path.getmtime(dst)<os.path.getmtime(src):
        im=Image.open(src).convert('RGB'); im.thumbnail((maxpx,maxpx),Image.LANCZOS); im.save(dst,quality=q)
    return 'file://'+dst
def edge_colour(path,side='both'):
    im=Image.open(path).convert('RGB'); w,h=im.size
    cols={'left':range(0,6),'right':range(w-6,w)}
    def avg(xs):
        px=[im.getpixel((x,y)) for x in xs for y in range(0,h,max(1,h//80))]; n=len(px)
        return '#%02x%02x%02x'%tuple(sum(p[i] for p in px)//n for i in range(3))
    return (avg(cols['left']),avg(cols['right'])) if side=='both' else avg(cols[side])
def corner_colour(path,k=40):
    im=Image.open(path).convert('RGB'); w,h=im.size
    boxes=[(0,0,k,k),(w-k,0,w,k),(0,h-k,k,h),(w-k,h-k,w,h)]
    cs=[im.crop(b).resize((1,1)).getpixel((0,0)) for b in boxes]
    # the ground is the colour the corners agree on: take the median channel
    med=lambda i: sorted(c[i] for c in cs)[len(cs)//2]
    return '#%02x%02x%02x'%(med(0),med(1),med(2))
def sub(s): return re.sub(r'(\d+)',r'<sub>\1</sub>',s)
def formula(atoms):
    c=collections.Counter(a[0].capitalize() for a in atoms); parts=[]
    for el in ['C','H']:
        if c[el]: parts.append(el+(str(c[el]) if c[el]>1 else '')); del c[el]
    for el in sorted(c): parts.append(el+(str(c[el]) if c[el]>1 else ''))
    return ''.join(parts)
# ---------- SKO / Isometrica ----------
SDF={'kpv':['kpv'],'ghk-cu':['ghk'],'glutathione':['glutathione'],'nad':['nad'],'bpc-157':['bpc157'],'tb-500':['tb500'],'semax':['semax'],'selank':['selank'],'dsip':['dsip'],'kisspeptin':['kisspeptin10'],'mots-c':['motsc'],'ara-290':['ara290'],'aod-9604':['aod9604'],'sermorelin':['sermorelin'],'tesamorelin':['tesamorelin'],'thymosin-alpha-1':['thymosina1'],'ipamorelin':['ipamorelin'],'pt-141':['pt141'],'mt-2':['mt2'],'mt-1':['mt1'],'ss-31':['ss31'],'sko-trz':['tirzepatide'],'cagrilintide':['cagrilintide'],'5-amino-1mq':['amino1mq'],'igf1-lr3':['igf1lr3'],'cjc-1295':['cjc1295','ipamorelin'],
     'glow':['ghk','bpc157','tb500'],'wolverine':['bpc157','tb500'],'tesa-ipa':['tesamorelin','ipamorelin'],'adamax':['semax'],'klow':['ghk','bpc157','tb500','kpv']}
for s,p in [('ghk-cu-spray','ghk-cu'),('mt-2-spray','mt-2'),('nad-spray','nad'),('selank-spray','selank'),('semax-spray','semax')]: SDF[s]=SDF[p]
MOLNAME={'kpv':'KPV tripeptide','ghk':'GHK-Cu','glutathione':'Glutathione','nad':'NAD+','bpc157':'BPC-157','tb500':'TB-500','semax':'Semax','selank':'Selank','dsip':'DSIP','kisspeptin10':'Kisspeptin-10','motsc':'MOTS-c','ara290':'ARA-290','aod9604':'AOD-9604','sermorelin':'Sermorelin','tesamorelin':'Tesamorelin','thymosina1':'Thymosin α1','ipamorelin':'Ipamorelin','pt141':'PT-141','mt2':'Melanotan II','mt1':'Melanotan I','ss31':'SS-31','tirzepatide':'Tirzepatide','cagrilintide':'Cagrilintide','amino1mq':'5-Amino-1MQ','igf1lr3':'IGF-1 LR3','cjc1295':'CJC-1295'}
NOTE={'adamax':'Adamax is a Semax derivative. The structure shown is the Semax parent skeleton.','sko-3-rt':'Retatrutide has no public atomic coordinates. The structure is its backbone as an α-helix, built from the published 39-residue sequence.','bac-water':'Water. Three atoms. The simplest structure in the book.'}
def sko_pages():
    P=json.load(open(f'{SKO}/products.json')); N=len(P); pages=[]
    for i,p in enumerate(P):
        s=p['slug']
        wd=f'{SKO}/img/products/{s}-wide.png'            # the 16:9 Isometrica frame, the whole page
        if not os.path.exists(wd): continue
        if s=='bac-water': fact='Water &middot; 3 atoms &middot; 2 bonds'
        elif s=='sko-3-rt': fact='Retatrutide &middot; 39 residues'
        else:
            mols=SDF[s]; heavy=0;bonds=0;fs=[]
            for m in mols:
                a,b=parse(f'{PEP}/{m}.sdf'); heavy+=sum(1 for x in a if x[0]!='H'); bonds+=len(b); fs.append(formula(a))
            fact=f"{sub(fs[0]) if len(fs)==1 else sub(' + '.join(fs))} &middot; {heavy:,} atoms &middot; {bonds:,} bonds"
        cat,desc=findings.sko(s)
        q=place.analyse(wd,shapes=[(0.44,0.30),(0.40,0.34),(0.48,0.26)])   # composed for THIS photograph
        pages.append(f'''<section class="plate {q['ink']}"><img src="{web(wd,s+'-wd',2600)}">
  <div class="over" style="left:{q['left']*100:.2f}%;top:{q['top']*100:.2f}%;width:{q['w']*100:.2f}%">
    <div class="eye">Isometrica &middot; N&ordm; {i+1:02d} / {N}</div>
    <h1>{p['name']}</h1>
    <div class="line">{'Nasal spray' if p['spray'] else 'Lyophilised vial'} &middot; {p['dose']} &middot; {'99% purity' if s!='bac-water' else '0.9% benzyl alcohol'}</div>
    <div class="line dim">{fact}</div>
    <div class="cat">{cat}</div>
    <p class="desc">{desc}</p>
  </div>
  <div class="pn">{i+3:02d}</div></section>''')
    cover=f'''<section class="art cover"><img src="{web(f"{SKO}/img/edition3/hero-structure.jpg","cover")}"><div class="ct"><div class="eye">SKO Compounds · Edition three</div><h1>Isometrica</h1><div class="s">The molecule in chrome.</div></div></section>'''
    sentence=f'''<section class="text"><div class="eye">The sentence</div><h1>Blue is the pigment.<br>Chrome is the machine.<br>The vial is what it holds.<br>The air is alpine.</h1>
<div class="cols"><p>Each product's real molecule, taken from its published coordinates, built in liquid chrome and standing in the snow.</p>
<p>One page per compound, one picture per page. No other brand can make this frame, because no other brand's product is the structure.</p>
<p>The blue stays in the pictures. On the page the ground is white and the type is navy.</p></div>
<div class="foot"><span>SKO Compounds</span><span>Isometrica · Edition three</span><span>02</span></div></section>'''
    css='''
@page{size:384mm 214.3mm;margin:0}
*{box-sizing:border-box;margin:0}html,body{background:#fff;color:#173384;font-family:Inter,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
section{width:384mm;height:214.3mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
.eye{font:500 8pt 'JetBrains Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#6f86b8}
h1{font:700 26pt Syncopate,sans-serif;text-transform:uppercase;line-height:1.05;margin:6mm 0 4mm}
.spec{padding:14mm;display:grid;grid-template-columns:1fr 188mm 1fr;gap:12mm;align-items:stretch}
.sq{width:188mm;height:188mm;background:#fff}.sq img{width:100%;height:100%;object-fit:contain;display:block}
.col{display:flex;flex-direction:column}.lab{font:400 9.5pt/1.5 Inter,sans-serif;color:#173384;max-width:34em}
.h{font:500 8pt 'JetBrains Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#6f86b8;margin:8mm 0 3mm;padding-bottom:2mm;border-bottom:1px solid #c9d6ee}
table{border-collapse:collapse;width:100%}td{font:400 9pt/1.35 'JetBrains Mono',monospace;padding:2.2mm 0;border-bottom:1px solid #e6ecf7;vertical-align:top}td:first-child{color:#6f86b8;width:34%;letter-spacing:.06em;text-transform:uppercase;font-size:7.5pt;padding-top:2.8mm}
.note{font:400 8.5pt/1.5 Inter,sans-serif;color:#6f86b8;margin-top:6mm}.w{font:400 10pt/1.5 Inter,sans-serif;margin-top:auto;padding-top:8mm}
.foot{position:absolute;left:14mm;right:14mm;bottom:8mm;display:flex;justify-content:space-between;font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#6f86b8}
.art{background:#020B77}.art img{width:100%;height:100%;object-fit:cover;display:block}.art .cap{position:absolute;left:14mm;bottom:10mm;color:#fff;font:400 8pt 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase}.art .cap b{font:inherit}.art .pn{position:absolute;right:14mm;bottom:10mm;color:#fff;font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em}
.cover .ct{position:absolute;left:14mm;bottom:16mm;color:#fff}.cover .eye{color:#88A9E3}.cover h1{font-size:64pt;margin:4mm 0 3mm}.cover .s{font:400 12pt Inter,sans-serif;color:#88A9E3}
.text{padding:14mm;background:#fff}.text h1{font-size:30pt;margin:8mm 0 12mm;max-width:80%}.cols{columns:3;column-gap:12mm;font:400 10.5pt/1.55 Inter,sans-serif}.cols p{margin-bottom:5mm;break-inside:avoid}

.plate{position:relative;background:#0b1f4d}
.plate>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.plate .over{position:absolute}
.plate .eye{letter-spacing:.2em}
.plate h1{font-size:34pt;line-height:1;margin:4mm 0 5mm}
.plate .line{font:500 8.5pt 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;margin-bottom:2mm}
.plate .cat{font:500 8pt 'JetBrains Mono',monospace;letter-spacing:.2em;text-transform:uppercase;margin:6mm 0 3mm}
.plate .desc{font:400 11.5pt/1.5 Inter,sans-serif;max-width:118mm}
.plate .pn{position:absolute;right:16mm;bottom:12mm;font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em}
.plate.light .over,.plate.light .pn{color:#fff;text-shadow:0 1px 22px rgba(0,10,40,.4)}
.plate.light .eye,.plate.light .line.dim{color:rgba(255,255,255,.7)}
.plate.light .cat{color:#9dc4ff}
.plate.light .pn{color:rgba(255,255,255,.65)}
.plate.dark .over,.plate.dark .pn{color:#0d2350}
.plate.dark .eye,.plate.dark .line.dim{color:rgba(13,35,80,.6)}
.plate.dark .cat{color:#1e46b8}
.plate.dark .pn{color:rgba(13,35,80,.55)}
'''
    return css,[cover,sentence]+pages,'Isometrica',(384,214.3)
# ---------- Meridian / Ecophilia ----------
def mer_pages():
    P=json.load(open(f'{MER}/products.json')); N=len(P); pages=[]
    for i,p in enumerate(P):
        s=p['slug']; pl=f'{MER}/img/products/{s}-plant.png'
        if not os.path.exists(pl): continue
        form='10 mL vial' if s=='bacteriostatic-water' else 'Lyophilised vial'
        cat,desc=findings.mer(s,p['category'])
        gr=corner_colour(pl)
        # the plant photographs fill the frame, so the writing gets its own page facing the plate
        pages.append(f'''<section class="say" style="background:{gr}">
  <div class="saybox">
    <div class="eye">Ecophilia &middot; N&ordm; {i+1:02d} / {N}</div>
    <h1>{p['name']}</h1>
    <div class="rule"></div>
    <p class="desc">{desc}</p>
    <table><tr><td>Form</td><td>{form}</td></tr><tr><td>Dose</td><td>{p['dose']}</td></tr><tr><td>Purity</td><td>{p['purity']}</td></tr><tr><td>Category</td><td>{cat}</td></tr><tr><td>Object</td><td>{p['plant'][0].upper()+p['plant'][1:]}</td></tr><tr><td>Use</td><td>Research use only</td></tr></table>
  </div>
  <div class="pn">{2*i+3:02d}</div></section>''')
        pages.append(f'''<section class="plate green" style="background:{gr}"><img class="fit" src="{web(pl,'m-'+s+'-pl',2600)}"><div class="pn">{2*i+4:02d}</div></section>''')
    cover=f'''<section class="art cover" style="background:{edge_colour(f"{MER}/img/products/tesamorelin-plant.png","left")}"><img class="fit" src="{web(f"{MER}/img/products/tesamorelin-plant.png","m-cover")}"><div class="ct"><div class="eye">meridian · The product book</div><h1>Ecophilia</h1><div class="s">one offering, one branch.</div></div></section>'''
    sentence='''<section class="text"><div class="eye">The book</div><h1>Every offering, on the piece of nature that belongs to it alone.</h1>
<div class="cols"><p>One flat green page, one offering, one piece of nature, and nothing else on it.</p>
<p>One product per page, one picture per page, and never the same natural object twice: lichen, bark, a cut branch, a leaf, a stone.</p>
<p>This is the only place the green lives, and the only place the product stands on a coloured ground.</p></div>
<div class="foot"><span>meridian</span><span>Ecophilia · The product book</span><span>02</span></div></section>'''
    css='''
@page{size:384mm 257.6mm;margin:0}
*{box-sizing:border-box;margin:0}html,body{background:#fff;color:#1c1b1a;font-family:Inter,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
section{width:384mm;height:257.6mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
.eye{font:500 8pt 'JetBrains Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#8a8580}
h1{font:400 40pt 'Instrument Serif',Georgia,serif;line-height:1;margin:6mm 0 4mm;letter-spacing:-.01em}
.spec{padding:14mm;display:grid;grid-template-columns:1fr 188mm 1fr;gap:12mm}
.sq{width:188mm;height:188mm}.sq img{width:100%;height:100%;object-fit:contain;display:block}
.col{display:flex;flex-direction:column}.lab{font:400 9.5pt/1.5 Inter,sans-serif;color:#5d5955;max-width:34em}
.h{font:500 8pt 'JetBrains Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#8a8580;margin:8mm 0 3mm;padding-bottom:2mm;border-bottom:1px solid #e3ded8}
table{border-collapse:collapse;width:100%}td{font:400 9pt/1.35 'JetBrains Mono',monospace;padding:2.2mm 0;border-bottom:1px solid #efebe6;vertical-align:top}td:first-child{color:#8a8580;width:34%;letter-spacing:.06em;text-transform:uppercase;font-size:7.5pt;padding-top:2.8mm}
.w{font:400 10pt/1.5 Inter,sans-serif;color:#5d5955;margin-top:auto;padding-top:8mm}
.foot{position:absolute;left:14mm;right:14mm;bottom:8mm;display:flex;justify-content:space-between;font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#8a8580}
.art img.fit{width:100%;height:100%;object-fit:contain;display:block}.art .cap{position:absolute;right:14mm;top:10mm;color:#fff;font:400 8pt Inter,sans-serif}.art .pn{position:absolute;right:14mm;bottom:10mm;color:#fff;font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em}
.cover .ct{position:absolute;left:14mm;bottom:16mm;color:#fff}.cover .eye{color:rgba(255,255,255,.75)}.cover h1{font-size:72pt;margin:4mm 0 3mm;font-style:italic}.cover .s{font:400 12pt Inter,sans-serif;color:rgba(255,255,255,.85)}
.text{padding:14mm}.text h1{font-size:44pt;margin:8mm 0 12mm;max-width:70%}.cols{columns:3;column-gap:12mm;font:400 10.5pt/1.55 Inter,sans-serif;color:#5d5955}.cols p{margin-bottom:5mm;break-inside:avoid}

.plate{position:relative}
.plate>img.fit{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.plate .pn{position:absolute;right:16mm;bottom:12mm;color:rgba(20,32,15,.55);font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em}
.say{position:relative;display:flex;align-items:center;justify-content:flex-start;padding:0 34mm}
.say .saybox{max-width:150mm;color:#14200f}
.say .eye{color:rgba(20,32,15,.6);letter-spacing:.2em}
.say h1{font-size:40pt;line-height:1;margin:5mm 0 0;color:#14200f}
.say .rule{width:26mm;height:.5mm;background:rgba(20,32,15,.4);margin:8mm 0}
.say .desc{font:400 13pt/1.6 Inter,sans-serif;color:#14200f;margin-bottom:12mm}
.say table{border-collapse:collapse;width:118mm}
.say td{padding:2.6mm 0;border-bottom:.3mm solid rgba(20,32,15,.22);font:400 9.5pt Inter,sans-serif;color:#14200f;vertical-align:top}
.say td:first-child{width:34mm;font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:rgba(20,32,15,.6);padding-top:3.4mm}
.say .pn{position:absolute;right:16mm;bottom:12mm;color:rgba(20,32,15,.55);font:500 7.5pt 'JetBrains Mono',monospace;letter-spacing:.16em}
'''
    return css,[cover,sentence]+pages,'Ecophilia',(384,257.6)
FONTS='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">'
def render(css,pages,name,size):
    html=f'<!doctype html><html><head><meta charset="utf-8"><title>{name}</title>{FONTS}<style>{css}</style></head><body>{"".join(pages)}</body></html>'
    hp=f'{OUT}/{name}.html'; open(hp,'w').write(html)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b=pw.chromium.launch(); pg=b.new_page(); pg.goto('file://'+hp); pg.wait_for_load_state('networkidle'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(1500)
        pg.pdf(path=f'{OUT}/{name}.pdf',width=f'{size[0]}mm',height=f'{size[1]}mm',print_background=True,prefer_css_page_size=True); b.close()
    print(name,'pages',len(pages),'->',f'{OUT}/{name}.pdf',os.path.getsize(f'{OUT}/{name}.pdf')//1_000_000,'MB')
if __name__=='__main__':
    which=sys.argv[1] if len(sys.argv)>1 else 'both'
    if which in('iso','both'): render(*sko_pages())
    if which in('eco','both'): render(*mer_pages())
