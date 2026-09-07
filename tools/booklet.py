#!/usr/bin/env python3
"""Isometrica + Ecophilia booklets. 16:9 pages. Per product: a spec page (the 1:1 in the middle, writing either side)
and an art page (full bleed). Renders HTML → PDF with Playwright's Chromium.
usage: booklet.py iso|eco|both"""
import os,sys,json,re,collections
from PIL import Image
sys.path.insert(0,os.path.dirname(__file__)); from blueprint import parse
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
        s=p['slug']; sq=f'{SKO}/img/products/{s}-square.png'; wd=f'{SKO}/img/products/{s}-wide.png'
        if not os.path.exists(sq): continue
        rows_p=[('Form','Nasal spray' if p['spray'] else 'Lyophilised vial'),('Dose',p['dose']),('Printed label',p['label']),('Purity','99% by HPLC' if s!='bac-water' else '0.9% benzyl alcohol'),('Closure','White atomiser' if p['spray'] else 'Navy flip-off over silver crimp'),('Use','Research use only')]
        # structure facts
        if s=='bac-water': rows_a=[('Molecule','Water'),('Formula',sub('H2O')),('Atoms','3'),('Bonds','2')]
        elif s=='sko-3-rt': rows_a=[('Molecule','Retatrutide'),('Residues','39'),('Rendered as','Backbone α-helix'),('Coordinates','Built from sequence')]
        else:
            mols=SDF[s]; heavy=0;bonds=0;fs=[]
            for m in mols:
                a,b=parse(f'{PEP}/{m}.sdf'); heavy+=sum(1 for x in a if x[0]!='H'); bonds+=len(b); fs.append(formula(a))
            rows_a=[('Molecule' if len(mols)==1 else 'Molecules',' + '.join(MOLNAME[m] for m in mols)),('Formula',sub(fs[0]) if len(fs)==1 else sub(' · '.join(fs))),('Heavy atoms',f'{heavy:,}'),('Bonds',f'{bonds:,}'),('Coordinates','Published SDF, PCA plane')]
        rows_a+=[('Material','Liquid mirror chrome'),('Build','Polished spheres, polished rods'),('Ground','Snow, blue hour'),('Light','Low winter sun, right')]
        note=NOTE.get(s,'')
        pages.append(f'''<section class="spec">
  <div class="col l"><div class="eye">Isometrica · Nº {i+1:02d} / {N}</div><h1>{p['name']}</h1><div class="lab">Slide two of every carousel. The product and its own structure, in one frame.</div>
    <div class="h">The product</div><table>{''.join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k,v in rows_p)}</table></div>
  <div class="sq"><img src="{web(sq,s+'-sq')}"></div>
  <div class="col r"><div class="h">The structure</div><table>{''.join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k,v in rows_a)}</table>{f'<p class="note">{note}</p>' if note else ''}
    <p class="w">Every atom a polished sphere, every bond a polished rod. Nothing added, nothing decorative. The shape is the compound's own.</p></div>
  <div class="foot"><span>SKO Compounds</span><span>Isometrica · Edition three</span><span>{2*i+3:02d}</span></div></section>''')
        if os.path.exists(wd):
            pages.append(f'<section class="art"><img src="{web(wd,s+"-wd")}"><div class="cap"><b>{p["name"]}</b> · {p["dose"]} · {rows_a[0][1]}</div><div class="pn">{2*i+4:02d}</div></section>')
    cover=f'''<section class="art cover"><img src="{web(f"{SKO}/img/edition3/hero-structure.jpg","cover")}"><div class="ct"><div class="eye">SKO Compounds · Edition three</div><h1>Isometrica</h1><div class="s">The molecule in chrome.</div></div></section>'''
    sentence=f'''<section class="text"><div class="eye">The sentence</div><h1>Blue is the pigment.<br>Chrome is the machine.<br>The vial is what it holds.<br>The air is alpine.</h1>
<div class="cols"><p>Isometrica is the book. Each product's real molecule, taken from its published coordinates, built in liquid chrome and standing in the snow: every atom a polished sphere, every bond a polished rod. Engineered, not decorative, and true to the compound.</p>
<p>One page per compound, the way Ecophilia gives every product its plant. Chrome first, snow second, in one frame. It sits second in every carousel, after the primary, and it is the thing no other brand can make, because no other brand's product is the structure.</p>
<p>The blue stays in the pictures. On the page the ground is white, the type is navy, the rules are frost. Pigment and sky appear only in pops.</p></div>
<div class="foot"><span>SKO Compounds</span><span>Isometrica · Edition three</span><span>02</span></div></section>'''
    css='''
@page{size:384mm 216mm;margin:0}
*{box-sizing:border-box;margin:0}html,body{background:#fff;color:#173384;font-family:Inter,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
section{width:384mm;height:216mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
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
'''
    return css,[cover,sentence]+pages,'Isometrica'
# ---------- Meridian / Ecophilia ----------
def mer_pages():
    P=json.load(open(f'{MER}/products.json')); N=len(P); pages=[]
    for i,p in enumerate(P):
        s=p['slug']; sq=f'{MER}/img/products/{s}-square.png'; pl=f'{MER}/img/products/{s}-plant.png'
        if not os.path.exists(sq): continue
        form='10 mL vial' if s=='bacteriostatic-water' else 'Lyophilised vial'
        rows_p=[('Form',form),('Dose',p['dose']),('Available',' · '.join(p['doses'])),('Purity',p['purity']),('Category',p['category'].replace('-',' ')),('Use','Research use only')]
        pose={'lie':'Lying','stand':'Standing'}.get(p.get('pose',''),p.get('pose','').title()); ori=p.get('orientation','')
        rows_a=[('Object',p['plant'][0].upper()+p['plant'][1:]),('Pose',f'{pose}, {ori}'.strip(', ')),('Ground','Ecophilia green · #44B24B'),('Format','One offering, one object'),('Rule','Never the same kind twice'),('After','Constantin Boym, Ecophilia')]
        pages.append(f'''<section class="spec">
  <div class="col l"><div class="eye">Ecophilia · Nº {i+1:02d} / {N}</div><h1>{p['name']}</h1><div class="lab">The main shot, one master for every label: one light, one angle, one shadow.</div>
    <div class="h">The offering</div><table>{''.join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k,v in rows_p)}</table></div>
  <div class="sq"><img src="{web(sq,'m-'+s+'-sq')}"></div>
  <div class="col r"><div class="h">The page</div><table>{''.join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k,v in rows_a)}</table>
    <p class="w">One product per page. One natural object per page. The green is flat and exact. The type, when it comes, is plain and small, top right, the way the book does it.</p></div>
  <div class="foot"><span>meridian</span><span>Ecophilia · The product book</span><span>{2*i+3:02d}</span></div></section>''')
        if os.path.exists(pl):
            L,R=edge_colour(pl)
            pages.append(f'<section class="art" style="background:linear-gradient(90deg,{L} 0%,{L} 50%,{R} 50%,{R} 100%)"><img class="fit" src="{web(pl,"m-"+s+"-pl")}"><div class="cap">{p["name"]} · {p["dose"]}</div><div class="pn">{2*i+4:02d}</div></section>')
    cover=f'''<section class="art cover" style="background:{edge_colour(f"{MER}/img/products/tesamorelin-plant.png","left")}"><img class="fit" src="{web(f"{MER}/img/products/tesamorelin-plant.png","m-cover")}"><div class="ct"><div class="eye">meridian · The product book</div><h1>Ecophilia</h1><div class="s">one offering, one branch.</div></div></section>'''
    sentence='''<section class="text"><div class="eye">The book</div><h1>Every offering, on the piece of nature that belongs to it alone.</h1>
<div class="cols"><p>Constantin Boym's Ecophilia puts one found branch on one flat green page and lets it be the whole page. We take the format and subvert the subject: every page is a new offering, sitting on or hanging off a different piece of nature.</p>
<p>One product per page. One natural object per page, and never the same kind twice: lichen, bark, a cut branch, a leaf, a stone. The green is flat and exact. The type, when it comes, is plain and small, top right, the way the book does it.</p>
<p>This is the only place the Ecophilia green lives, and the only place the product is shown on a coloured ground. Everywhere else the vial stands on vanilla with its contact shadow.</p></div>
<div class="foot"><span>meridian</span><span>Ecophilia · The product book</span><span>02</span></div></section>'''
    css='''
@page{size:384mm 216mm;margin:0}
*{box-sizing:border-box;margin:0}html,body{background:#fff;color:#1c1b1a;font-family:Inter,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
section{width:384mm;height:216mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
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
'''
    return css,[cover,sentence]+pages,'Ecophilia'
FONTS='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">'
def render(css,pages,name):
    html=f'<!doctype html><html><head><meta charset="utf-8"><title>{name}</title>{FONTS}<style>{css}</style></head><body>{"".join(pages)}</body></html>'
    hp=f'{OUT}/{name}.html'; open(hp,'w').write(html)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b=pw.chromium.launch(); pg=b.new_page(); pg.goto('file://'+hp); pg.wait_for_load_state('networkidle'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(1500)
        pg.pdf(path=f'{OUT}/{name}.pdf',width='384mm',height='216mm',print_background=True,prefer_css_page_size=True); b.close()
    print(name,'pages',len(pages),'->',f'{OUT}/{name}.pdf',os.path.getsize(f'{OUT}/{name}.pdf')//1_000_000,'MB')
if __name__=='__main__':
    which=sys.argv[1] if len(sys.argv)>1 else 'both'
    if which in('iso','both'): render(*sko_pages())
    if which in('eco','both'): render(*mer_pages())
