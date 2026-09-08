// edition three site: reveal on scroll, parallax on the wide plates, grid + pdp from products.json

// fit rule: a box takes its image's exact ratio, so cover never crops and never pads
function fitBox(box,im){const a=()=>{if(im.naturalWidth)box.style.aspectRatio=im.naturalWidth+'/'+im.naturalHeight};im.complete&&im.naturalWidth?a():im.addEventListener('load',a)}
function fitAll(root=document){root.querySelectorAll('.hero,.plate-wide,.tile,.card .im,.thumbs button').forEach(b=>{if(b.classList.contains('float'))return; /* the floating tile is always 1:1 */ const im=b.querySelector('img');if(im)fitBox(b,im)})}
fitAll();addEventListener('resize',()=>fitAll(),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
const plates=[...document.querySelectorAll('.plate-wide img')];

// bundles: members and price. The pair a product page offers comes from here.
const BUNDLES={'b-nad-mots-c':{name:'NAD+ · MOTS-c',members:['nad','mots-c'],price:129},'b-ss-31-mots-c':{name:'SS-31 · MOTS-c',members:['ss-31','mots-c'],price:149},'b-semax-selank':{name:'Semax · Selank',members:['semax','selank'],price:99},'b-kpv-ghk-cu':{name:'KPV · GHK-Cu',members:['kpv','ghk-cu'],price:79},'b-kpv-ghk-cu-glutathione':{name:'KPV · GHK-Cu · Glutathione',members:['kpv','ghk-cu','glutathione'],price:119},'metabolic-reference':{name:'Metabolic Reference',members:['sko-trz','cagrilintide','sko-3-rt'],price:229}};
// quantity tiers: [units, discount]. Prototype values; the store sets the real ones.
const TIERS=[[1,0],[2,.10],[3,.15]];
// research categories [confirm with Billy]. A compound can sit in more than one.
const CATS={'Recovery':['bpc-157','tb-500','wolverine','kpv','ara-290','glow'],'Skin & hair':['ghk-cu','ghk-cu-spray','glow','klow'],'Cognitive':['semax','selank','semax-spray','selank-spray','adamax','dsip'],'Cellular & longevity':['nad','nad-spray','mots-c','ss-31','5-amino-1mq','glutathione','thymosin-alpha-1'],'Growth & performance':['cjc-1295','ipamorelin','sermorelin','tesamorelin','tesa-ipa','igf1-lr3'],'Metabolic':['sko-3-rt','sko-trz','cagrilintide','aod-9604'],'Pigment':['mt-1','mt-2','mt-2-spray'],'Libido':['pt-141','kisspeptin'],'Supplies':['bac-water']};
// product slug -> structure registry slug on jackmorello.com. null = no public coordinates (the bottle stands alone).
const REG={'bpc-157':'bpc157','tb-500':'tb500','ghk-cu':'ghk','ghk-cu-spray':'ghk','kpv':'kpv','glutathione':'glutathione','nad':'nad','nad-spray':'nad','mots-c':'motsc','semax':'semax','semax-spray':'semax','selank':'selank','selank-spray':'selank','dsip':'dsip','kisspeptin':'kisspeptin10','ipamorelin':'ipamorelin','sermorelin':'sermorelin','tesamorelin':'tesamorelin','cjc-1295':'cjc1295','thymosin-alpha-1':'thymosina1','ara-290':'ara290','aod-9604':'aod9604','ss-31':'ss31','pt-141':'pt141','mt-1':'mt1','mt-2':'mt2','mt-2-spray':'mt2','5-amino-1mq':'amino1mq','igf1-lr3':'igf1lr3','cagrilintide':'cagrilintide','sko-trz':'tirzepatide','sko-3-rt':null,'glow':'ghk','wolverine':'bpc157','tesa-ipa':'tesamorelin','adamax':'semax','klow':'ghk','bac-water':null};
// framing per structure: a tripeptide would fill the frame at the same zoom that fits a 39-mer
const ZOOM={amino1mq:.8,kpv:.85,ghk:.85,glutathione:.85,nad:.9,dsip:.95,mt1:1,mt2:1,pt141:1,selank:1,semax:1,kisspeptin10:1,ipamorelin:1,motsc:1.1,ss31:1,aod9604:1.05,ara290:1.1,bpc157:1.25,tb500:1.3,sermorelin:1.3,tesamorelin:1.3,cjc1295:1.3,igf1lr3:1.35,thymosina1:1.35,tirzepatide:1.35,cagrilintide:1.35};
const PRICE={'bpc-157':44,'tb-500':49,'ghk-cu':39,'mots-c':59,'nad':69,'glutathione':45,'semax':54,'selank':54,'kpv':49,'dsip':39,'cagrilintide':129,'tesamorelin':79,'ipamorelin':39,'sermorelin':49,'igf1-lr3':89,'mt-1':39,'mt-2':39,'pt-141':44,'ss-31':79,'thymosin-alpha-1':69,'ara-290':59,'aod-9604':49,'kisspeptin':49,'5-amino-1mq':59,'adamax':64,'glow':99,'wolverine':89,'tesa-ipa':99,'cjc-1295':54};
async function load(){const [prods,man]=await Promise.all([fetch('../products.json?v='+Date.now()).then(r=>r.json()),fetch('manifest.json?v='+Date.now()).then(r=>r.json()).catch(()=>({}))]);return {prods,man}}
let nth=0;
function card(p,man){const k=man[p.slug]||[];const has=k.includes('primary');const cut=k.includes('cut');const tileKind=cut?'cut':(k.includes('white')?'white':'primary');const useWhite=tileKind!=='primary';const price=PRICE[p.slug]||49;
  return `<a class="card rv ${has?'':'pending'}" href="product.html?s=${p.slug}"><div class="im${cut?' float':''}${p.spray?' spray':''}"${useWhite?' style="background:#fff"':''}>${has?`<img src="../img/products/web/${p.slug}-${tileKind}.${cut?'png':'jpg'}" alt="${p.name}">${useWhite&&has?`<img class="alt" src="../img/products/web/${p.slug}-primary.jpg" alt="" loading="lazy">`:''}`:`<span>RENDERING</span>`}</div><div class="meta"><div class="name">${p.name}</div><div class="dose">${p.spray?'nasal spray':'lyophilised vial'} · 99% purity</div><div class="row"><span>$${price}.00</span><span class="buy">Add →</span></div></div></a>`}
const grid=document.querySelector('#grid');
if(grid){load().then(({prods,man})=>{const lim=+grid.dataset.limit||999;const list=prods.filter(p=>grid.dataset.spray?p.spray:!p.spray).slice(0,lim);grid.innerHTML=list.map(p=>card(p,man)).join('');fitAll(grid);grid.querySelectorAll('.rv').forEach(el=>io.observe(el));const c=document.querySelector('#count');if(c)c.textContent=`${list.length} SKUs`})}
const pdp=document.querySelector('#pdp');
if(pdp){load().then(({prods,man})=>{const s=new URLSearchParams(location.search).get('s')||'bpc-157';const p=prods.find(x=>x.slug===s)||prods[0];const have=man[p.slug]||[];
  // the gallery: every frame is the image's own ratio, never cropped. The 1:1 Isometrica frame is slide two.
  const kinds=['primary','square','white','rock','badge'].filter(k=>have.includes(k)); // the gallery is 1:1 only, so it never changes shape
  const grounds=['frost','pigment','water'].filter(k=>have.includes(k));const srcs=kinds.map(k=>`../img/products/web/${p.slug}-${k}.jpg`);
  const price=PRICE[p.slug]||49;
  document.title=`${p.name} — SKO Compounds`;pdp.querySelector('h1').textContent=p.name;pdp.querySelector('.sub').textContent=(p.spray?'Nasal spray':'Lyophilised vial')+` · ${p.dose||''} · 99% purity · research use only`;pdp.querySelector('.p').textContent=`$${price}.00`;
  const car=pdp.querySelector('.car'),th=pdp.querySelector('.thumbs');car.querySelectorAll('img').forEach(i=>i.remove());th.innerHTML='';
  srcs.forEach((src,i)=>{const im=new Image();im.src=src;im.alt=p.name;if(kinds[i]==='white')im.dataset.ground='white';if(i===0)im.classList.add('on');car.prepend(im);const b=document.createElement('button');if(kinds[i]==='white')b.dataset.ground='white';b.title=kinds[i];b.innerHTML=`<img src="${src}" alt="">`;if(i===0)b.classList.add('on');b.onclick=()=>go(i);th.appendChild(b);fitBox(b,b.querySelector('img'))});
  let cur=0,imgs=[...car.querySelectorAll('img')],bts=[...th.querySelectorAll('button')];fitBox(car,imgs[0]);
  function go(i){cur=(i+imgs.length)%imgs.length;imgs.forEach((im,j)=>im.classList.toggle('on',j===cur));bts.forEach((b,j)=>b.classList.toggle('on',j===cur));fitBox(car,imgs[cur])}
  car.querySelector('.arr.l').onclick=()=>go(cur-1);car.querySelector('.arr.r').onclick=()=>go(cur+1);
  if(imgs.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>go(cur+1),4500);
  addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});
  // the grounds strip: the 3:4 frames, each in its own ratio, under the fold
  const gs=document.querySelector('#grounds');if(gs){gs.innerHTML=grounds.map(k=>`<div class="tile g"><img src="../img/products/web/${p.slug}-${k}.jpg" alt="${p.name} on ${k}"><div class="cap"><div class="mono">${k.toUpperCase()}</div></div></div>`).join('');fitAll(gs)}
  // the wide Isometrica frame under the fold
  const wide=document.querySelector('#wide');if(wide&&have.includes('wide')){wide.querySelector('img').src=`../img/products/web/hd/${p.slug}-wide.jpg`;wide.hidden=false;fitBox(wide,wide.querySelector('img'))}
  // upsell layer 1: quantity tiers
  const tiers=pdp.querySelector('#tiers');if(tiers){tiers.innerHTML=TIERS.map(([n,d],i)=>{const unit=Math.round(price*(1-d));return `<button class="${i===0?'on':''}" data-n="${n}"><b>${n} ${n===1?'vial':'vials'}</b><span>$${unit}.00 each</span>${d?`<i>save ${Math.round(d*100)}%</i>`:'<i>&nbsp;</i>'}</button>`}).join('');const tb=[...tiers.children];tb.forEach(b=>b.onclick=()=>{tb.forEach(x=>x.classList.toggle('on',x===b));const n=+b.dataset.n,d=TIERS.find(t=>t[0]===n)[1];pdp.querySelector('.p').textContent=`$${Math.round(price*n*(1-d))}.00`;pdp.querySelector('.btn.blue').textContent=`Add ${n} to cart`})}
  // upsell layer 2: the pair. A bundle this compound belongs to, priced against buying separately.
  const pairs=Object.entries(BUNDLES).filter(([k,b])=>b.members.includes(p.slug));const pair=pdp.querySelector('#pair');
  if(pair){if(pairs.length){const [k,b]=pairs[0];const sep=b.members.reduce((a,m)=>a+(PRICE[m]||49),0);const names=b.members.map(m=>(prods.find(x=>x.slug===m)||{name:m}).name);pair.innerHTML=`<a class="pairc" href="bundles.html"><img src="../img/products/web/bundle-${k}.jpg" alt="${b.name}"><div><div class="mono mute">THE PAIR</div><div class="pn">${names.join(' + ')}</div><div class="pp">$${b.price}.00 <s>$${sep}.00</s> <em>save $${sep-b.price}</em></div><span class="btn">Add the pair</span></div></a>`;fitBox(pair.querySelector('.pairc'),pair.querySelector('img'))}else pair.hidden=true}
  // upsell layer 3: the routes up
  const routes=pdp.querySelector('#routes');if(routes){routes.innerHTML=`<a href="box.html"><b>Build a box</b><span>Fill the slots. Free shipping, then the free vial, then the next tier.</span></a><a href="bulk.html"><b>Bulk</b><span>Ten and up, one price per vial, one COA per batch.</span></a><a href="membership.html"><b>Membership</b><span>Monthly or every two months, same day, shipped cold.</span></a>`}
  // bundles band: every bundle this compound is in, with the blade art; otherwise the three top bundles
  const bb=document.querySelector('#bundles');if(bb){const keys=(pairs.length?pairs:Object.entries(BUNDLES).slice(0,3));bb.innerHTML=keys.map(([k,b])=>{const sep=b.members.reduce((a,m)=>a+(PRICE[m]||49),0);return `<a class="card rv" href="bundles.html"><div class="im wide"><img src="../img/products/web/hd/bundle-${k}.jpg" alt="${b.name}"></div><div class="meta"><div class="name">${b.name}</div><div class="dose">${b.members.length} vials · the blade · 99% purity</div><div class="row"><span>$${b.price}.00 <s class="mute">$${sep}.00</s></span><span class="buy">Add →</span></div></div></a>`}).join('');fitAll(bb);bb.querySelectorAll('.rv').forEach(el=>io.observe(el))}
  // build a box: the incentive ladder, with this compound in seat one
  const bx=document.querySelector('#boxmod');if(bx){bx.querySelector('.seat b').textContent=p.name;bx.querySelector('.seat span').textContent=p.dose||''}
  // pairs with: the compounds it is bundled with first, then the rest
  const rel=document.querySelector('#rel');if(rel){const mates=[...new Set(pairs.flatMap(([k,b])=>b.members))].filter(m=>m!==p.slug);const list=[...mates.map(m=>prods.find(x=>x.slug===m)).filter(Boolean),...prods.filter(x=>x.slug!==p.slug&&!x.spray&&!mates.includes(x.slug))].slice(0,4);rel.innerHTML=list.map(x=>card(x,man)).join('');fitAll(rel);rel.querySelectorAll('.rv').forEach(el=>io.observe(el))}
})}

// touch: first tap flips the tile to the white shot, second tap follows the link
document.addEventListener('touchend',e=>{const c=e.target.closest('.card');if(c&&c.querySelector('img.alt')&&!c.classList.contains('flip')){c.classList.add('flip');e.preventDefault()}},{passive:false});


// the hero: the compound's own rendered plate, full bleed, crossfading on change.
// Every frame is a finished photograph, so nothing is composited and nothing can mismatch.
// The live 3D viewer stays on the Isometrica page, where it is the instrument and not a fake composite.
const scene=document.querySelector('.hero.plate');
if(scene){load().then(({prods,man})=>{const frames=document.getElementById('hframes'),sweep=document.getElementById('hsweep'),thumb=document.getElementById('pthumb');
  let cur='bpc-157',layer=0,cart=[];
  const catOf=slug=>Object.entries(CATS).find(([c,l])=>l.includes(slug))?.[0]||'';
  const bottle=slug=>{const k=man[slug]||[];return k.includes('cut')?`../img/products/web/${slug}-cut.png`:`../img/products/web/${slug}-white.jpg`};
  const plate=slug=>{const k=man[slug]||[];return k.includes('wide')?`../img/products/web/hd/${slug}-wide.jpg`:`../img/products/web/hd/bpc-157-wide.jpg`};
  const a=document.createElement('img'),b=document.createElement('img');
  a.className='hf on';b.className='hf';frames.append(a,b);
  const seen=new Set();
  function preload(slug){if(seen.has(slug))return;seen.add(slug);const i=new Image();i.src=plate(slug)}
  function show(slug){const next=layer?a:b,curEl=layer?b:a;
    next.onload=()=>{next.classList.add('on');curEl.classList.remove('on');layer^=1;
      sweep.classList.remove('go');void sweep.offsetWidth;sweep.classList.add('go')};
    next.src=plate(slug);next.alt='';}
  function choose(slug){const p=prods.find(x=>x.slug===slug);if(!p)return;cur=slug;show(slug);
    thumb.src=bottle(slug);thumb.alt=p.name;
    document.getElementById('pcat').textContent=(catOf(slug)||'COMPOUND').toUpperCase();
    document.getElementById('pname').textContent=p.name;
    document.getElementById('pform').textContent=(p.spray?'Nasal spray':'Lyophilised vial')+` · ${p.dose||''} · 99% purity · research use only`;
    document.getElementById('pprice').textContent=`$${PRICE[slug]||49}.00`;
    const pe=document.getElementById('pearn');if(pe)pe.textContent=`EARNS ${PRICE[slug]||49} POINTS`;
    document.getElementById('cbtn').querySelector('span').textContent=p.name.toUpperCase()+' · CHANGE';closePanel()}
  const panel=document.getElementById('cpanel'),tabs=document.getElementById('ctabs'),list=document.getElementById('clist'),btn=document.getElementById('cbtn');let tab='All';
  function renderList(){const slugs=tab==='All'?prods.map(p=>p.slug):(CATS[tab]||[]);
    list.innerHTML=slugs.map(sl=>prods.find(p=>p.slug===sl)).filter(Boolean).map(p=>`<button role="option" data-s="${p.slug}" class="${p.slug===cur?'on':''}"><img src="${bottle(p.slug)}" alt="" loading="lazy"><span class="n">${p.name}</span><span class="d mono">${p.dose||''}</span><span class="p">$${PRICE[p.slug]||49}</span></button>`).join('');
    list.querySelectorAll('button').forEach(el=>{el.onclick=()=>choose(el.dataset.s);el.onmouseenter=()=>preload(el.dataset.s)})}
  tabs.innerHTML=['All',...Object.keys(CATS)].map(c=>`<button class="${c===tab?'on':''}" data-c="${c}">${c}</button>`).join('');
  tabs.querySelectorAll('button').forEach(el=>el.onclick=()=>{tab=el.dataset.c;tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===el));renderList()});
  function openPanel(){renderList();panel.hidden=false;btn.setAttribute('aria-expanded','true')}
  function closePanel(){panel.hidden=true;btn.setAttribute('aria-expanded','false')}
  btn.onclick=()=>panel.hidden?openPanel():closePanel();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
  document.addEventListener('click',e=>{if(!e.target.closest('#csel'))closePanel()});
  const xs=document.getElementById('xsell');
  function addToCart(slug){cart.push(slug);const c=document.getElementById('cartlink');if(c)c.textContent=`Cart (${cart.length})`}
  function xsell(slug){const p=prods.find(x=>x.slug===slug);
    const pairs=Object.values(BUNDLES).filter(bn=>bn.members.includes(slug)).flatMap(bn=>bn.members).filter(m=>m!==slug);
    const mates=(CATS[catOf(slug)]||[]).filter(m=>m!==slug);
    const picks=[...new Set([...pairs,...mates])].map(m=>prods.find(x=>x.slug===m)).filter(Boolean).slice(0,3);
    document.getElementById('xtitle').textContent=`Commonly researched with ${p.name}`;
    document.getElementById('xgrid').innerHTML=picks.map(q=>`<div class="xc"><img src="${bottle(q.slug)}" alt="${q.name}"><div class="n disp">${q.name}</div><div class="mute">${q.dose||''} · 99% purity</div><div class="r"><span>$${PRICE[q.slug]||49}.00</span><button class="btn small" data-s="${q.slug}">Add</button></div></div>`).join('');
    xs.querySelectorAll('button[data-s]').forEach(el=>el.onclick=()=>{addToCart(el.dataset.s);el.textContent='Added';el.disabled=true});
    xs.hidden=false;xs.scrollIntoView({behavior:'smooth',block:'nearest'})}
  document.getElementById('padd').onclick=e=>{e.preventDefault();addToCart(cur);xsell(cur)};
  document.getElementById('xkeep').onclick=e=>{e.preventDefault();xs.hidden=true};
  a.src=plate('bpc-157');choose('bpc-157')})}

// the category band: one card per research category, its lead compound floating, a click filters the grid
const cg=document.querySelector('#catgrid');
if(cg){load().then(({prods,man})=>{const lead={'Recovery':'bpc-157','Skin & hair':'ghk-cu','Cognitive':'semax','Cellular & longevity':'nad','Growth & performance':'cjc-1295','Metabolic':'sko-3-rt','Pigment':'mt-2','Libido':'pt-141','Supplies':'bac-water'};
  cg.innerHTML=Object.entries(CATS).filter(([c])=>c!=='Supplies').map(([c,slugs])=>{const l=lead[c]||slugs[0];const k=man[l]||[];const src=k.includes('cut')?`../img/products/web/${l}-cut.png`:`../img/products/web/${l}-white.jpg`;return `<a class="catcard rv" href="#grid-sec" data-c="${c}"><div class="cim"><img src="${src}" alt="${c}" loading="lazy"></div><div class="cname disp">${c}</div><div class="mono mute">${slugs.length} COMPOUND${slugs.length>1?'S':''}</div></a>`}).join('');
  cg.querySelectorAll('.rv').forEach(el=>io.observe(el));
  const grid=document.querySelector('#grid');
  cg.querySelectorAll('.catcard').forEach(a=>a.onclick=e=>{e.preventDefault();const c=a.dataset.c;const list=(CATS[c]||[]).map(sl=>prods.find(p=>p.slug===sl)).filter(Boolean);if(grid){grid.innerHTML=list.map(p=>card(p,man)).join('');fitAll(grid);grid.querySelectorAll('.rv').forEach(el=>{el.classList.add('in')});const t=document.querySelector('#gridtitle');if(t)t.textContent=c;const n=document.querySelector('#count');if(n)n.textContent=`${list.length} SKUs`;cg.querySelectorAll('.catcard').forEach(x=>x.classList.toggle('on',x===a));grid.scrollIntoView({behavior:'smooth',block:'start'})}})})}




// ── The Badge ─────────────────────────────────────────────────────
// Two separate things, on purpose:
//   POINTS are the currency. 1 per $1. You spend them.
//   LEVEL is lifetime spend. It is status, it is permanent, and it is never spent.
// Keeping them apart is what lets the top level sit at $150,000 without breaking the ladder.
// Every threshold and reward below is a first pass. Billy sets the real ones.
const LEVELS=[
 {k:'emboss', n:'Embossed', at:0,      img:'badge-emboss',  keep:'A foil sticker sheet, day one',
  u:['100 tokens on the board, day one','1 token per $1, every order','A foil badge sticker sheet in your first box']},
 {k:'cap',    n:'Pressed',  at:500,    img:'badge-cap',     keep:'The chrome token pin, shipped',
  u:['Free shipping, every order, forever','Your referral link unlocks','The chrome token pin, shipped to you']},
 {k:'foil',   n:'Foil',     at:2500,   img:'badge-foil',    keep:'The SKO hat',
  u:['5% back in tokens','The Live Deal code ten minutes early','The SKO hat, shipped']},
 {k:'cast',   n:'Chrome',   at:10000,  img:'badge-cast',    keep:'The cast chrome badge for your desk',
  u:['10% back in tokens','Claim the Live Deal even if you missed the live','The cast chrome badge, the real object']},
 {k:'pigment',n:'Pigment',  at:40000,  img:'badge-pigment', keep:'Your compound, printed at 60 inches',
  u:['15% back in tokens','A Full Box every birthday','The Isometrica print of your most-ordered compound']},
 {k:'bracelet',n:'The Bracelet',at:150000,img:'bracelet',   keep:'The championship bracelet, by hand',
  u:['20% back in tokens, for life','Dinner in Los Angeles with the founders','The chrome championship bracelet, made once, delivered by hand']},
];
const EARN=[
 ['Every order','1 point per $1 spent','1×'],
 ['Account created','You start on the board, never at zero','+100'],
 ['First order','Once','+50'],
 ['A box on a cadence','Every cycle, while the box is active','1.5×'],
 ['A review with a photo','One per compound','+75'],
 ['A referral joins','They open an account from your link','+100'],
 ['Their first order ships','The one that pays for the programme','+250'],
 ['Ordering inside 60 days','Keeps the streak, and the multiplier on it','1.25×'],
 ['Ordering during a live','The Live Deal, every week on TikTok','2×'],
];
const SPEND=[
 {p:150, n:'Bacteriostatic water', img:'sealed', w:'Free with your next order, boxed'},
 {p:400, n:'One peptide, free',     img:'ribbon', w:'Any vial under $50 — BPC-157, GHK-Cu, Ipamorelin, DSIP, MT-1, MT-2 and seven more'},
 {p:700, n:'One peptide, free',     img:'ribbon', w:'Any vial under $70 — TB-500, KPV, AOD-9604, Glutathione, Semax, Selank, CJC+IPA, MOTS-c and more'},
 {p:1100,n:'One peptide, free',     img:'ribbon', w:'Any vial under $100 — Adamax, SKO-NAD, SS-31, Tesamorelin, Wolverine, IGF1-LR3'},
 {p:1300,n:'Any bundle under $130', img:'open',   w:'KPV · GHK-Cu, Semax · Selank, KPV · GHK-Cu · Glutathione, NAD+ · MOTS-c'},
 {p:1800,n:'Two peptides, free',    img:'open',   w:'Any two vials, up to $100 each, seated in foam'},
 {p:2300,n:'Any bundle, any price', img:'open',   w:'Including the dearest one on the shelf'},
 {p:4000,n:'A full box cycle, free',img:'stack',  w:'A whole Build a Box cycle, however you filled it'},
];
// the programme page shows the shape of the shelf; the account page lists every rung
const SHELF=[
 {p:'150',     n:'The Water Box', img:'sealed', w:'Bacteriostatic water, free with your next order. Two orders in. The first thing almost everyone earns.'},
 {p:'FROM 400',n:'The Vial Box',  img:'ribbon', w:'One peptide, free, chrome ribbon tied. 400 points under $50 · 700 under $70 · 1,100 under $100.'},
 {p:'FROM 1,300',n:'The Pair Box',img:'open',   w:'A bundle from 1,300, two vials of your own at 1,800, or any bundle on the shelf at 2,300.'},
 {p:'4,000',   n:'The Full Box',  img:'stack',  w:'A whole Build a Box cycle, free, however you filled it.'},
];

// the programme page shows the shape of the shelf; the account page lists every rung

// boxes that arrive unbought. These are the ones that actually feel like gifts.
const GIFTS=[
 {n:'The Level Box',    img:'sealed', when:'When you level up',        w:'Your badge in the new material, boxed and sealed, with the card that says which level you just reached.'},
 {n:'The Make-Good Box',img:'ribbon', when:'When we get it wrong',      w:'Late, short, or damaged: this ships before you ask, with the compound replaced and something added.'},
 {n:'The Live Box',     img:'open',   when:'The Live Deal, boxed',      w:'Whatever the live deal is that week, packed as a gift instead of an order. Only during the live.'},
 {n:'The Bracelet Case',img:'stack',  when:'Level 06, once',            w:'The championship bracelet does not ship in a mailer. It comes in its own case, by hand.'},
];

const fmt=n=>n.toLocaleString('en-US');
const levelAt=spend=>{let i=0;LEVELS.forEach((t,j)=>{if(spend>=t.at)i=j});return i};
const badgeSrc=(k,hd)=>k==='bracelet'?`../img/loyalty/bracelet${hd?'':'-w'}.jpg`:`../img/${hd?'products/web/hd':'edition3'}/${k}.jpg`;

// the ladder, on the programme page
const lgrid=document.querySelector('#lgrid');
if(lgrid){
  lgrid.innerHTML=LEVELS.map((t,i)=>`<div class="lstep${t.k==='bracelet'?' apex':''}" data-k="${t.k}">
    <div class="lsim2"><img src="${badgeSrc(t.img,true)}" alt="${t.n}"></div>
    <div class="lt"><div class="lvl">LEVEL ${String(i+1).padStart(2,'0')}</div><h3>${t.n}</h3>
    <div class="lat">${t.at?'$'+fmt(t.at)+' LIFETIME':'ON SIGN-UP'}</div></div>
    <ul>${t.u.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="lkeep mono"><b>YOU KEEP</b>${t.keep}</div></div>`).join('');
}
const etab=document.querySelector('#etable');
if(etab)etab.innerHTML=EARN.map(([a,b,c])=>`<div><b>${a}</b><span>${b}</span><i class="mono">${c}</i></div>`).join('');
const stab=document.querySelector('#stable');
if(stab)stab.innerHTML=SHELF.map(x=>`<div class="sbox"><img src="../img/loyalty/box-${x.img}-w.jpg" alt="${x.n}"><div class="sbt"><div class="mono">${x.p} POINTS</div><h3 class="disp">${x.n}</h3><p>${x.w}</p></div></div>`).join('');
const gtab=document.querySelector('#gtable');
if(gtab)gtab.innerHTML=GIFTS.map(x=>`<div class="gbox"><img src="../img/loyalty/box-${x.img}-w.jpg" alt="${x.n}"><div class="gbt"><div class="mono mute">${x.when.toUpperCase()}</div><h3 class="disp">${x.n}</h3><p>${x.w}</p></div></div>`).join('');

// the card and the progress page
const lcardEl=document.querySelector('#lcard');
if(lcardEl){
  // the demo account. A real one comes from the store.
  const U={name:'J. Morello',points:1240,spend:3180,streak:41,ref:'J-MORELLO-8F2',
    log:[['08 SEP','Order · GHK-Cu, TB-500','+88'],['02 SEP','Referral first order · A. Chen','+250'],
         ['02 SEP','Referral joined · A. Chen','+100'],['24 AUG','Box cycle 04 · 1.5×','+207'],
         ['24 AUG','Review with photo · BPC-157','+75'],['11 AUG','Order · Semax','+54']]};
  const badge=document.getElementById('lbadge'),name=document.getElementById('ltiername'),ptsEl=document.getElementById('lpts'),
        fill=document.getElementById('lfill'),nextL=document.getElementById('lnextlabel'),unlock=document.getElementById('lunlock'),
        spendEl=document.getElementById('lspend'),ring=document.getElementById('lring');
  function render(){
    const i=levelAt(U.spend),t=LEVELS[i],nx=LEVELS[i+1];
    badge.src=badgeSrc(t.img);badge.alt=t.n;
    name.textContent=`${t.n.toUpperCase()} · LEVEL ${String(i+1).padStart(2,'0')}`;
    ptsEl.textContent=fmt(U.points);
    if(spendEl)spendEl.textContent='$'+fmt(U.spend);
    const from=t.at,to=nx?nx.at:t.at,pct=nx?Math.max(4,Math.min(100,((U.spend-from)/(to-from))*100)):100;
    fill.style.width=pct+'%';
    if(ring)ring.style.setProperty('--p',pct+'%');
    nextL.textContent=nx?`$${fmt(nx.at-U.spend)} TO ${nx.n.toUpperCase()}`:'TOP LEVEL · EVERY UNLOCK IS YOURS';
    unlock.textContent=nx?'UNLOCKS NEXT: '+nx.u[0].toUpperCase()+' · '+nx.keep.toUpperCase():t.keep.toUpperCase();
    document.querySelectorAll('.ltrack .ln').forEach((el,j)=>{el.classList.toggle('done',j<=i);el.classList.toggle('now',j===i)});
    const rl=document.getElementById('lreflock');
    if(rl)rl.hidden=i>=1;
    const rp=document.getElementById('lrefopen');
    if(rp)rp.hidden=i<1;
  }
  const track=document.querySelector('.ltrack');
  if(track)track.innerHTML=LEVELS.map((t,i)=>`<div class="ln"><img src="${badgeSrc(t.img)}" alt=""><span class="mono">${t.n}</span><em class="mono">${t.at?'$'+fmt(t.at):'JOIN'}</em></div>`).join('');
  const log=document.querySelector('#llog');
  if(log)log.innerHTML=U.log.map(([d,w,p])=>`<div><i class="mono">${d}</i><span>${w}</span><b class="mono">${p}</b></div>`).join('');
  const shelf=document.querySelector('#lshelf');
  const drawShelf=()=>{if(shelf)shelf.innerHTML=SPEND.map(x=>`<div class="sh${U.points>=x.p?' ok':''}"><img src="../img/loyalty/box-${x.img}-w.jpg" alt=""><div class="shw"><div class="mono">${fmt(x.p)} PTS</div><b>${x.n}</b><span>${x.w}</span></div><button class="btn small"${U.points>=x.p?'':' disabled'}>${U.points>=x.p?'Redeem':fmt(x.p-U.points)+' to go'}</button></div>`).join('')};
  drawShelf();
  document.querySelectorAll('.lsim button').forEach(b=>b.onclick=()=>{
    if(b.id==='lreset'){U.points=100;U.spend=0}else{U.spend+= +b.dataset.p;U.points+=Math.round(+b.dataset.p*(b.dataset.m||1))}
    render();drawShelf()});
  const copy=document.querySelector('.lreflink button');
  if(copy)copy.onclick=()=>{navigator.clipboard?.writeText('skocompounds.com/r/'+U.ref);copy.textContent='COPIED'};
  render();
}


// ── Referrals: the page ───────────────────────────────────────────
const rmsgs=document.querySelector('#rmsgs');
if(rmsgs){
  const LINK='skocompounds.com/r/J-MORELLO-8F2';
  const M=[
   ['TEXT','Here — 15% off your first order at SKO. Third-party tested, ships cold from LA. '+LINK],
   ['EMAIL','This is where I get my research peptides. Every batch has a COA and it ships cold from Los Angeles. This link takes 15% off your first order: '+LINK],
   ['A STORY OR A POST','SKO Compounds. 99% purity, COA on every batch. 15% off your first order with my link: '+LINK],
   ['THE LAB GROUP CHAT','If anyone still needs a supplier: SKO, third-party HPLC on every batch, COAs public. 15% off the first order — '+LINK],
  ];
  rmsgs.innerHTML=M.map(([k,t],i)=>`<button class="rmsg" data-i="${i}"><div class="mono mute">${k}</div><p>${t}</p><span class="mono rcopy">COPY</span></button>`).join('');
  rmsgs.querySelectorAll('.rmsg').forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(M[+b.dataset.i][1]);const s=b.querySelector('.rcopy');s.textContent='COPIED';setTimeout(()=>s.textContent='COPY',1600)});
}
const rtable=document.querySelector('#rtable');
if(rtable){
  const R=[['A. Chen','02 SEP','Ordered · BPC-157, TB-500','+350'],['M. Okafor','28 AUG','Ordered · SKO-NAD','+350'],
           ['D. Reyes','19 AUG','Joined · no order yet','+100'],['S. Vance','11 AUG','Joined · no order yet','+100']];
  rtable.innerHTML=R.map(([n,d,w,p])=>`<div><b>${n}</b><i class="mono">${d}</i><span>${w}</span><em class="mono">${p}</em></div>`).join('');
}
const rc=document.querySelector('#rcopy');
if(rc)rc.onclick=()=>{navigator.clipboard?.writeText('skocompounds.com/r/J-MORELLO-8F2');rc.textContent='COPIED'};


// ── The engines: missions, the live stamp card, the code vault, the affiliate ladder, the draw ──
// Every number here is a first pass for Billy. The mechanics are the point.
const MISSIONS=[
 {k:'review', c:'ORDERS', n:'Leave a review with a photo', r:'+75 points',        have:1, need:1},
 {k:'three',  c:'ORDERS', n:'Three orders in ninety days', r:'A free vial under $50', have:2, need:3},
 {k:'lives',  c:'LIVE',   n:'Four lives in a row',          r:'Bacteriostatic water, boxed', have:3, need:4},
 {k:'livebuy',c:'LIVE',   n:'Order during two lives',       r:'+300 points',       have:1, need:2},
 {k:'ref3',   c:'REFER',  n:'Three referrals who order',    r:'Any vial under $70, free', have:2, need:3},
 {k:'post',   c:'SHARE',  n:'Post your badge, tag us',      r:'+150 points',       have:0, need:1},
 {k:'codes',  c:'CODES',  n:'Redeem five codes',            r:'A mystery box',     have:2, need:5},
 {k:'golden', c:'DROP',   n:'Find the Golden Vial',         r:'A Full Box, free',  have:0, need:1},
];
// the referral ladder: what referrals earn on top of the 350 each
const REFLADDER=[
 {n:1, r:'+350 points, every time'},
 {n:3, r:'Any vial under $70, free'},
 {n:5, r:'Any bundle under $130, free'},
 {n:10,r:'Your own creator code: 15% for them, 10% of every order back to you in points'},
 {n:25,r:'The cast chrome badge, and a shout-out on the live'},
 {n:50,r:'A Full Box every quarter, for as long as you stay above fifty'},
];
// codes: five kinds, five behaviours. The vault reveals what a code did.
const CODES={
 'LIVE0911':  {kind:'LIVE',    what:'+200 points · this week\'s live code', pts:200},
 'PIGMENT':   {kind:'MULTIPLIER',what:'Double points on your next order', pts:0},
 'BOX-4F2A':  {kind:'IN THE BOX', what:'Bacteriostatic water, free, boxed', pts:0},
 'KAI15':     {kind:'CREATOR', what:'15% off this order · 10% back to Kai in points', pts:0},
 'MYSTERY':   {kind:'MYSTERY', what:null, pts:0},
};
const MYSTERY=['+100 points','+250 points','A foil badge sticker','Bacteriostatic water, free','Any vial under $50, free','Double points on your next order'];
const LEADERBOARD=[['Kai R.','Chrome',31],['Dani O.','Foil',22],['M. Okafor','Pigment',19],['J. Morello','Foil',2],['A. Chen','Pressed',3]];

function chip(c){return `<span class="mchip mono">${c}</span>`}
const mboard=document.querySelector('#mboard');
if(mboard){
  mboard.innerHTML=MISSIONS.map(m=>{const pct=Math.round(m.have/m.need*100),done=m.have>=m.need;return `<div class="mis${done?' done':''}">${chip(m.c)}<div class="mn">${m.n}</div><div class="mr mono">${done?'CLAIMED · ':''}${m.r.toUpperCase()}</div><div class="mbar"><i style="width:${pct}%"></i></div><div class="mcount mono">${m.have} / ${m.need}${done?' · DONE':''}</div></div>`}).join('');
}
const stamps=document.querySelector('#stamps');
if(stamps){
  const have=3,need=4;
  stamps.innerHTML=Array.from({length:6},(_,i)=>`<div class="stamp${i<have?' on':''}${i===need-1?' goal':''}"><img src="../img/edition3/badge-hood.jpg" alt=""><span class="mono">${i<have?'LIVE '+(i+1):i===need-1?'FREE WATER':'—'}</span></div>`).join('');
  const nxt=document.getElementById('stampnext'); if(nxt)nxt.textContent=`${need-have} MORE LIVE${need-have>1?'S':''} TO A FREE BOX · NEXT LIVE THURSDAY 6PM PT`;
}
const vault=document.querySelector('#vault');
if(vault){
  const inp=vault.querySelector('input'),btn=vault.querySelector('button'),out=vault.querySelector('.vout');
  const used=[];
  function reveal(code){const k=code.trim().toUpperCase();const c=CODES[k];
    if(!c){out.className='vout bad';out.innerHTML=`<div class="mono">NOT A CODE</div><p>Check the box, the live, or your email.</p>`;return}
    if(used.includes(k)){out.className='vout bad';out.innerHTML=`<div class="mono">ALREADY USED</div><p>${k} has been redeemed on this account.</p>`;return}
    used.push(k);const what=c.what||MYSTERY[Math.floor(Math.random()*MYSTERY.length)];
    out.className='vout';void out.offsetWidth;out.className='vout go';
    out.innerHTML=`<div class="mono">${c.kind} CODE · ${k}</div><div class="disp vwhat">${what}</div><p class="mono mute">ADDED TO YOUR ACCOUNT · ${used.length} OF 5 TOWARD THE MYSTERY BOX</p>`;
    const p=document.getElementById('lpts');if(p&&c.pts){p.textContent=fmt((+p.textContent.replace(/,/g,''))+c.pts)}}
  btn.onclick=()=>reveal(inp.value);inp.addEventListener('keydown',e=>{if(e.key==='Enter')reveal(inp.value)});
  vault.querySelectorAll('.vtry').forEach(b=>b.onclick=()=>{inp.value=b.dataset.c;reveal(b.dataset.c)});
}
const rlad=document.querySelector('#rladder');
if(rlad){const have=2; // referrals who ORDERED. Joining pays 100; the ladder counts orders.
  rlad.innerHTML=REFLADDER.map(x=>`<div class="rl${have>=x.n?' done':''}"><b class="mono">${x.n}</b><span>${x.r}</span><i class="mono">${have>=x.n?'EARNED':(x.n-have)+' TO GO'}</i></div>`).join('')}
const lb=document.querySelector('#leaderboard');
if(lb)lb.innerHTML=LEADERBOARD.map(([n,l,c],i)=>`<div class="${n==='J. Morello'?'me':''}"><i class="mono">${String(i+1).padStart(2,'0')}</i><b>${n}</b><span class="mono">${l.toUpperCase()}</span><em class="mono">${c} ORDERED</em></div>`).join('');


// ── The rail: one spend scale, join to the bracelet ───────────────
// Each level gets equal width on the rail so the early road is readable; spend interpolates inside each segment.
// MARKERS are the small rewards between levels. Adding one is one line here.
const MARKERS=[
 {at:1000, n:'A foil sticker pack'},
 {at:5000, n:'A birthday box, every year'},
 {at:20000,n:'The SKO hat'},
 {at:80000,n:'Your compound, printed at 60 inches'},
];
function railPos(spend){const L=LEVELS;for(let i=L.length-1;i>=0;i--){if(spend>=L[i].at){if(i===L.length-1)return 100;const a=L[i].at,b=L[i+1].at;return (i+(spend-a)/(b-a))/(L.length-1)*100}}return 0}
function railSpend(pos){const L=LEVELS;const seg=(L.length-1)*pos/100;const i=Math.min(L.length-2,Math.floor(seg));const f=seg-i;return Math.round(L[i].at+(L[i+1].at-L[i].at)*f)}
const rail=document.querySelector('#rail');
if(rail){
  const nodes=document.getElementById('railnodes'),fill=document.getElementById('railfill'),whatif=document.getElementById('railwhatif'),me=document.getElementById('railme'),thumb=document.getElementById('railthumb'),title=document.getElementById('railtitle'),what=document.getElementById('railwhat'),pos=document.getElementById('railpos');
  nodes.innerHTML=LEVELS.map((t,i)=>`<div class="rn" style="left:${i/(LEVELS.length-1)*100}%"><img src="${badgeSrc(t.img)}" alt=""><span class="mono">${t.n}</span><em class="mono">${t.at?'$'+fmt(t.at):'JOIN'}</em></div>`).join('')+
    MARKERS.map(m=>`<div class="rm" style="left:${railPos(m.at)}%" title="${m.n}"><i></i><span class="mono">$${fmt(m.at)}<br>${m.n}</span></div>`).join('');
  const spendOf=()=>+(document.getElementById('lspend')?.textContent||'$0').replace(/[$,]/g,'');
  function paint(explore){const cur=spendOf();const p=railPos(cur);fill.style.width=p+'%';me.style.left=p+'%';
    const ex=explore==null?cur:explore;const q=railPos(ex);
    whatif.style.left=Math.min(p,q)+'%';whatif.style.width=Math.abs(q-p)+'%';whatif.classList.toggle('back',q<p);
    const i=levelAt(ex),t=LEVELS[i],nx=LEVELS[i+1];
    const got=[...LEVELS.slice(0,i+1).map(l=>l.keep),...MARKERS.filter(m=>ex>=m.at).map(m=>m.n)];
    title.textContent=ex===cur?`${t.n} · $${fmt(cur)} so far`:`At $${fmt(ex)}: ${t.n}`;
    what.textContent=(nx?`${t.n.toUpperCase()} · $${fmt(nx.at-ex)} TO ${nx.n.toUpperCase()}`:'TOP OF THE ROAD')+' · '+got.length+' REWARDS UNLOCKED';
    pos.textContent=ex===cur?`YOU ARE HERE · $${fmt(cur)}`:`EXPLORING $${fmt(ex)} · RELEASE TO RETURN`;
    nodes.querySelectorAll('.rn').forEach((el,j)=>{el.classList.toggle('done',j<=levelAt(cur));el.classList.toggle('peek',j<=i&&j>levelAt(cur))});
    nodes.querySelectorAll('.rm').forEach(el=>{const at=+el.querySelector('span').textContent.replace(/[^0-9]/g,'').slice(0,6);});
  }
  thumb.addEventListener('input',()=>paint(railSpend(+thumb.value/10)));
  const snap=()=>{thumb.value=Math.round(railPos(spendOf())*10);paint(null)};
  thumb.addEventListener('change',snap);thumb.addEventListener('pointerup',()=>setTimeout(snap,900));
  document.querySelectorAll('.lsim button').forEach(b=>b.addEventListener('click',()=>setTimeout(snap,50)));
  snap();
}
// the CTA row: what they buy, something new, something paired
const cta=document.querySelector('#cta3');
if(cta){load().then(({prods,man})=>{const img=sl=>{const k=man[sl]||[];return k.includes('cut')?`../img/products/web/${sl}-cut.png`:`../img/products/web/${sl}-white.jpg`};
  const pick=(sl,tag,line)=>{const p=prods.find(x=>x.slug===sl);return p?`<a class="ctac" href="product.html?s=${sl}"><img src="${img(sl)}" alt="${p.name}"><div><div class="mono">${tag}</div><b class="disp">${p.name}</b><span>${line}</span><em class="mono">$${PRICE[sl]||49} · EARNS ${PRICE[sl]||49} PTS →</em></div></a>`:''};
  cta.innerHTML=pick('ghk-cu','YOUR FAVOURITE','Ordered three times. Reorder in one tap.')+pick('klow','NEW RESEARCH','Just landed. First access at Foil.')+pick('mots-c','COMMONLY PAIRED','With your last order, in the NAD+ bundle.')})}
