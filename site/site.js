// edition three site: reveal on scroll, parallax on the wide plates, grid + pdp from products.json

// fit rule: a box takes its image's exact ratio, so cover never crops and never pads
function fitBox(box,im){const a=()=>{if(im.naturalWidth)box.style.aspectRatio=im.naturalWidth+'/'+im.naturalHeight};im.complete&&im.naturalWidth?a():im.addEventListener('load',a)}
function fitAll(root=document){root.querySelectorAll('.hero,.plate-wide,.tile,.card .im,.thumbs button').forEach(b=>{const im=b.querySelector('img');if(im)fitBox(b,im)})}
fitAll();addEventListener('resize',()=>fitAll(),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
const plates=[...document.querySelectorAll('.plate-wide img')];

const PRICE={'bpc-157':44,'tb-500':49,'ghk-cu':39,'mots-c':59,'nad':69,'glutathione':45,'semax':54,'selank':54,'kpv':49,'dsip':39,'cagrilintide':129,'tesamorelin':79,'ipamorelin':39,'sermorelin':49,'igf1-lr3':89,'mt-1':39,'mt-2':39,'pt-141':44,'ss-31':79,'thymosin-alpha-1':69,'ara-290':59,'aod-9604':49,'kisspeptin':49,'5-amino-1mq':59,'adamax':64,'glow':99,'wolverine':89,'tesa-ipa':99,'cjc-1295':54};
async function load(){const [prods,man]=await Promise.all([fetch('../products.json?v='+Date.now()).then(r=>r.json()),fetch('manifest.json?v='+Date.now()).then(r=>r.json()).catch(()=>({}))]);return {prods,man}}
let nth=0;
function card(p,man){const k=man[p.slug]||[];const has=k.includes('primary');const useWhite=k.includes('white');const price=PRICE[p.slug]||49;
  return `<a class="card rv ${has?'':'pending'}" href="product.html?s=${p.slug}"><div class="im"${useWhite?' style="background:#fff"':''}>${has?`<img src="../img/products/web/${p.slug}-${useWhite?'white':'primary'}.jpg" alt="${p.name}">${(man[p.slug]||[]).includes('white')&&!useWhite?`<img class="alt" src="../img/products/web/${p.slug}-white.jpg" alt="" loading="lazy">`:''}`:`<span>RENDERING</span>`}</div><div class="meta"><div class="name">${p.name}</div><div class="dose">${p.spray?'nasal spray':'lyophilised vial'} · 99% purity</div><div class="row"><span>$${price}.00</span><span class="buy">Add →</span></div></div></a>`}
const grid=document.querySelector('#grid');
if(grid){load().then(({prods,man})=>{const lim=+grid.dataset.limit||999;const list=prods.filter(p=>grid.dataset.spray?p.spray:!p.spray).slice(0,lim);grid.innerHTML=list.map(p=>card(p,man)).join('');fitAll(grid);grid.querySelectorAll('.rv').forEach(el=>io.observe(el));const c=document.querySelector('#count');if(c)c.textContent=`${list.length} SKUs`})}
const pdp=document.querySelector('#pdp');
if(pdp){load().then(({prods,man})=>{const s=new URLSearchParams(location.search).get('s')||'bpc-157';const p=prods.find(x=>x.slug===s)||prods[0];const kinds=['primary','chrome','frost','white','pigment','water'].filter(k=>(man[p.slug]||[]).includes(k));const srcs=kinds.map(k=>`../img/products/web/${p.slug}-${k}.jpg`);
  document.title=`${p.name} — SKO Compounds`;pdp.querySelector('h1').textContent=p.name;pdp.querySelector('.sub').textContent=(p.spray?'Nasal spray':'Lyophilised vial')+' · 99% purity · research use only';pdp.querySelector('.p').textContent=`$${PRICE[p.slug]||49}.00`;
  const car=pdp.querySelector('.car'),th=pdp.querySelector('.thumbs');car.querySelectorAll('img').forEach(i=>i.remove());th.innerHTML='';
  srcs.forEach((src,i)=>{const im=new Image();im.src=src;im.alt=p.name;if(kinds[i]==='white')im.dataset.ground='white';if(i===0)im.classList.add('on');car.prepend(im);const b=document.createElement('button');if(kinds[i]==='white')b.dataset.ground='white';b.innerHTML=`<img src="${src}" alt="">`;if(i===0)b.classList.add('on');b.onclick=()=>go(i);th.appendChild(b);fitBox(b,b.querySelector('img'))});
  let cur=0,imgs=[...car.querySelectorAll('img')],bts=[...th.querySelectorAll('button')];fitBox(car,imgs[0]);
  function go(i){cur=(i+imgs.length)%imgs.length;imgs.forEach((im,j)=>im.classList.toggle('on',j===cur));bts.forEach((b,j)=>b.classList.toggle('on',j===cur));fitBox(car,imgs[cur])}
  car.querySelector('.arr.l').onclick=()=>go(cur-1);car.querySelector('.arr.r').onclick=()=>go(cur+1);
  if(imgs.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>go(cur+1),4500);
  addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});
  const rel=document.querySelector('#rel');if(rel){rel.innerHTML=prods.filter(x=>x.slug!==p.slug&&!x.spray).slice(0,4).map(x=>card(x,man)).join('');fitAll(rel);rel.querySelectorAll('.rv').forEach(el=>io.observe(el))}
})}

// touch: first tap flips the tile to the white shot, second tap follows the link
document.addEventListener('touchend',e=>{const c=e.target.closest('.card');if(c&&c.querySelector('img.alt')&&!c.classList.contains('flip')){c.classList.add('flip');e.preventDefault()}},{passive:false});
