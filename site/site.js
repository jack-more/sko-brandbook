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
 {k:'emboss', n:'Embossed', at:0,      img:'badge-emboss',  keep:'The badge, blind-embossed, on the box',
  u:['Points on every order, 1 per $1','Order history and batch tracking','Your first badge sticker in the box']},
 {k:'cap',    n:'Pressed',  at:500,    img:'badge-cap',     keep:'The badge, pressed into the cap',
  u:['Free shipping, every order, forever','Your referral link unlocks','A reminder before every live, and the streak that comes with it']},
 {k:'foil',   n:'Foil',     at:2500,   img:'badge-foil',    keep:'The badge, foil-stamped, in the box',
  u:['5% back in points','The Live Deal code, ten minutes before the live opens','First access to a new compound before launch']},
 {k:'cast',   n:'Chrome',   at:10000,  img:'badge-cast',    keep:'A cast chrome badge, shipped to you',
  u:['10% back in points','Claim the Live Deal even if you missed the live','Batch COAs before they go public']},
 {k:'pigment',n:'Pigment',  at:40000,  img:'badge-pigment', keep:'Your compound, printed',
  u:['15% back in points','Reserve a vial from a batch before release','The Isometrica print of your most-ordered compound']},
 {k:'bracelet',n:'The Bracelet',at:150000,img:'bracelet',   keep:'The championship bracelet',
  u:['20% back in points','A standing reservation on every batch','The chrome championship bracelet, made once, for you']},
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
 [250,'$25 off any order'],[500,'Bacteriostatic water, free, any order'],
 [1000,'$110 off, or any single vial under $110'],[2000,'A bundle of your choice, free'],
 [3500,'A Build a Box cycle, free'],
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
if(stab)stab.innerHTML=SPEND.map(([p,w])=>`<div><b class="mono">${fmt(p)} PTS</b><span>${w}</span></div>`).join('');

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
  if(shelf)shelf.innerHTML=SPEND.map(([p,w])=>`<div class="sh${U.points>=p?' ok':''}"><div class="mono">${fmt(p)} PTS</div><div class="shw">${w}</div><button class="btn small"${U.points>=p?'':' disabled'}>${U.points>=p?'Redeem':fmt(p-U.points)+' to go'}</button></div>`).join('');
  document.querySelectorAll('.lsim button').forEach(b=>b.onclick=()=>{
    if(b.id==='lreset'){U.points=100;U.spend=0}else{U.spend+= +b.dataset.p;U.points+=Math.round(+b.dataset.p*(b.dataset.m||1))}
    render();if(shelf)shelf.innerHTML=SPEND.map(([p,w])=>`<div class="sh${U.points>=p?' ok':''}"><div class="mono">${fmt(p)} PTS</div><div class="shw">${w}</div><button class="btn small"${U.points>=p?'':' disabled'}>${U.points>=p?'Redeem':fmt(p-U.points)+' to go'}</button></div>`).join('')});
  const copy=document.querySelector('.lreflink button');
  if(copy)copy.onclick=()=>{navigator.clipboard?.writeText('skocompounds.com/r/'+U.ref);copy.textContent='COPIED'};
  render();
}
