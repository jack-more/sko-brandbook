/* The Badge — the loyalty app. Self-contained. Every number is a first pass for Billy; the mechanics are the point. */
const $=s=>document.querySelector(s);const fmt=n=>Math.round(n).toLocaleString('en-US');
const IMG='../../img/';const ICO=k=>`${IMG}icons/${k}.png`;
const TIERICO={Embossed:'tier-emboss',Pressed:'tier-cap',Foil:'tier-foil',Chrome:'tier-chrome',Pigment:'tier-pigment','The Bracelet':'tier-bracelet'};
function iconFor(txt){const t=txt.toLowerCase();
  if(/bracelet/.test(t))return 'tier-bracelet';if(/golden/.test(t))return 'golden';if(/print/.test(t))return 'print';if(/badge/.test(t)&&/chrome/.test(t))return 'tier-chrome';
  if(/sticker/.test(t))return 'sticker';if(/hat/.test(t))return 'hat';if(/pin/.test(t))return 'pin';if(/spin/.test(t))return 'spin';if(/free shipping/.test(t))return 'freeship';if(/token/.test(t))return 'tokens';if(/water/.test(t))return 'vial';if(/two (vials|peptides)/.test(t))return 'vials';if(/vial|peptide/.test(t))return 'vial';
  if(/bundle|pair/.test(t))return 'box-open';if(/box cycle|full box/.test(t))return 'shelf';if(/mystery/.test(t))return 'mystery';if(/code/.test(t))return 'code';if(/shipping/.test(t))return 'shipping';
  if(/batch|early/.test(t))return 'ticket';if(/double|multiplier/.test(t))return 'token';if(/live|stamp/.test(t))return 'stamp';if(/refer|creator|shout/.test(t))return 'refer';return 'box'}
const TIERS=[
 {n:'Embossed',from:1, at:0,     img:'edition3/badge-emboss.jpg',  keep:'A foil sticker sheet and 100 tokens, day one'},
 {n:'Pressed', from:9, at:500,   img:'edition3/badge-cap.jpg',     keep:'The chrome token pin, shipped'},
 {n:'Foil',    from:17,at:2500,  img:'edition3/badge-foil.jpg',    keep:'The SKO hat'},
 {n:'Chrome',  from:25,at:10000, img:'edition3/badge-cast.jpg',    keep:'The cast chrome badge for your desk'},
 {n:'Pigment', from:33,at:40000, img:'edition3/badge-pigment.jpg', keep:'Your compound printed at 60 inches, and a Full Box every birthday'},
 {n:'The Bracelet',from:50,at:150000,img:'loyalty/bracelet-w.jpg', keep:'The championship bracelet, delivered by hand'},
];
// 50 levels. Thresholds interpolate geometrically between the tier anchors, so every early order levels you up.
const LEVELS=(()=>{const L=[];const A=[[1,0],[2,40],[9,500],[17,2500],[25,10000],[33,40000],[50,150000]];
 for(let i=0;i<A.length-1;i++){const [l0,s0]=A[i],[l1,s1]=A[i+1];for(let l=l0;l<l1;l++){const f=(l-l0)/(l1-l0);L[l]=s0>0?Math.round(s0*Math.pow(s1/s0,f)):Math.round(s0+(s1-s0)*f)}}
 L[50]=150000;return L})();
const SMALL=['Free shipping on your next order','A vial under $50, free','+100 tokens','Free shipping on your next order','A vial under $70, free','A spin','Free shipping on your next order','A vial under $50, free','Double tokens on your next order','Free shipping on your next order','A vial under $100, free','A spin','Free shipping on your next two orders','A vial under $70, free','+250 tokens','Free shipping on your next order','A vial under $100, free','A spin','Free shipping on your next order','A bundle under $130, free'];
function rewardFor(l){const t=TIERS.find(t=>t.from===l);if(t)return {big:true,txt:t.keep};return {big:false,txt:SMALL[(l*7)%SMALL.length]}}
const levelOf=s=>{let l=1;for(let i=1;i<=50;i++)if(s>=LEVELS[i])l=i;return l};
const tierOf=l=>{let t=TIERS[0];TIERS.forEach(x=>{if(l>=x.from)t=x});return t};
const SHELF=[
 {p:150, n:'Bacteriostatic water',img:'loyalty/box-sealed-w.jpg',w:'Free with your next order, boxed'},
 {p:400, n:'One peptide, free',   img:'loyalty/box-ribbon-w.jpg',w:'Any vial under $50'},
 {p:700, n:'One peptide, free',   img:'loyalty/box-ribbon-w.jpg',w:'Any vial under $70'},
 {p:1100,n:'One peptide, free',   img:'loyalty/box-ribbon-w.jpg',w:'Any vial under $100'},
 {p:1300,n:'Any bundle under $130',img:'loyalty/box-open-w.jpg', w:'Seated in foam with the card'},
 {p:1800,n:'Two peptides, free',  img:'loyalty/box-open-w.jpg',  w:'Any two vials up to $100 each'},
 {p:2300,n:'Any bundle, any price',img:'loyalty/box-open-w.jpg', w:'Including the dearest on the shelf'},
 {p:4000,n:'A full box cycle, free',img:'loyalty/box-stack-w.jpg',w:'However you filled it'},
];
const MISSIONS=[
 {k:'review', c:'ORDERS',n:'Leave a review with a photo', r:75,  rt:'+75 tokens', have:0,need:1,claimed:false},
 {k:'three',  c:'ORDERS',n:'Three orders in ninety days',  r:0,   rt:'A free vial under $50', have:0,need:3},
 {k:'lives',  c:'LIVE',  n:'Four lives in a row',          r:0,   rt:'Bacteriostatic water, boxed', have:0,need:4},
 {k:'livebuy',c:'LIVE',  n:'Order during two lives',       r:300, rt:'+300 tokens', have:0,need:2},
 {k:'ref3',   c:'REFER', n:'Three referrals who order',    r:0,   rt:'Any vial under $70, free', have:0,need:3},
 {k:'post',   c:'SHARE', n:'Post your badge, tag us',      r:150, rt:'+150 tokens', have:0,need:1},
 {k:'codes',  c:'CODES', n:'Redeem five codes',            r:0,   rt:'A mystery box', have:0,need:5},
 {k:'golden', c:'DROP',  n:'Find the Golden Vial',         r:0,   rt:'A Full Box, free', have:0,need:1},
];
const CODES={'LIVE0911':{k:'LIVE',w:'+200 tokens · this week\'s live code',t:200},'PIGMENT':{k:'MULTIPLIER',w:'Double tokens on your next order',t:0},'BOX-4F2A':{k:'IN THE BOX',w:'Bacteriostatic water, free, boxed',t:0},'KAI15':{k:'CREATOR',w:'15% off this order · 10% back to Kai',t:0},'MYSTERY':{k:'MYSTERY',w:null,t:0}};
const MYST=[['+100 tokens',100],['+250 tokens',250],['A foil badge sticker',0],['Bacteriostatic water, free',0],['Any vial under $50, free',0],['Double tokens on your next order',0]];
const LADDER=[[1,'+350 tokens, every time'],[3,'Any vial under $70, free'],[5,'Any bundle under $130, free'],[10,'Your own creator code · 10% of every order back to you'],[25,'The cast chrome badge · a shout-out on the live'],[50,'A Full Box every quarter']];
const LB=[['Kai R.','Chrome',31],['Dani O.','Foil',22],['M. Okafor','Pigment',19],['J. Morello','Embossed',0],['A. Chen','Pressed',3]];

const U={spend:0,tokens:0,streak:0,refs:0,stamps:0,used:[],mult:1,spins:0,welcomed:false};
let view='road';

// ── tokens flying ──
function burst(x,y,n=40,toBal=true){const b=$('#burst');const app=$('#app').getBoundingClientRect();const bal=$('#bal').getBoundingClientRect();const tx=bal.left-app.left+bal.width/2,ty=bal.top-app.top+bal.height/2;
  for(let i=0;i<n;i++){const im=document.createElement('img');im.src=IMG+'loyalty/token.png';im.style.width=im.style.height=(22+Math.random()*22)+'px';b.appendChild(im);
    const a=Math.random()*Math.PI*2,sp=4+Math.random()*9;let px=x,py=y,vx=Math.cos(a)*sp,vy=Math.sin(a)*sp-6,rot=Math.random()*360,t=0;const life=42+Math.random()*20;
    const step=()=>{t++;if(t<life){vy+=.42;px+=vx;py+=vy;rot+=vx*3;im.style.transform=`translate(${px}px,${py}px) rotate(${rot}deg)`;im.style.opacity=1;requestAnimationFrame(step)}
      else if(toBal&&t<life+22){const k=(t-life)/22;const e=k*k;px+=(tx-px)*e*.5;py+=(ty-py)*e*.5;im.style.transform=`translate(${px}px,${py}px) scale(${1-k*.6})`;im.style.opacity=1-k*.4;requestAnimationFrame(step)}
      else im.remove()};requestAnimationFrame(step)}}
function tick(el,from,to,ms=900,pre='',post=''){const t0=performance.now();const f=now=>{const k=Math.min(1,(now-t0)/ms);const e=1-Math.pow(1-k,3);el.textContent=pre+fmt(from+(to-from)*e)+post;if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
function centerOf(el){const r=el.getBoundingClientRect(),a=$('#app').getBoundingClientRect();return [r.left-a.left+r.width/2,r.top-a.top+r.height/2]}

// ── header ──
function header(){const l=levelOf(U.spend),t=tierOf(l);$('#hlvl').textContent=`LEVEL ${l} · ${t.n.toUpperCase()}`;const st=$('#hstreak');if(st)st.textContent=U.streak?`STREAK ${U.streak} DAYS`:'';$('#hbadge').src=ICO(TIERICO[t.n]);$('#btok').textContent=fmt(U.tokens)}

// ── earning: an order ──
function order(amount,mult=1){const before=levelOf(U.spend),bt=tierOf(before);const got=Math.round(amount*mult*U.mult);U.mult=1;
  U.spend+=amount;const after=levelOf(U.spend),at=tierOf(after);
  U.spins+=1;collect(got,()=>{U.tokens+=got;header();if(after>before){levelUp(before,after,bt!==at)}else render()})}
function collect(got,then){const ov=$('#overlay');ov.hidden=false;ov.className='overlay';
  ov.innerHTML=`<div class="sweep"></div><div class="ov"><img class="bigtoken" src="${IMG}loyalty/token.png" alt=""><div class="mono">TOKENS EARNED</div><div class="disp cnt" id="cnt">0 <em>TOKENS</em></div><p>Every dollar is a token. Tokens buy peptides.</p><button class="btn pig" id="okc">Collect</button></div>`;
  const [x,y]=centerOf(ov.querySelector('#cnt'));setTimeout(()=>{burst(x,y,44,false);ov.querySelector('.sweep').classList.add('go');tick(ov.querySelector('#cnt'),0,got,1100,'',' ')},80);
  ov.querySelector('#cnt').innerHTML='0 <em>TOKENS</em>';
  const cnt=ov.querySelector('#cnt');const t0=performance.now();const f=now=>{const k=Math.min(1,(now-t0)/1100);const e=1-Math.pow(1-k,3);cnt.innerHTML=fmt(got*e)+' <em>TOKENS</em>';if(k<1)requestAnimationFrame(f)};setTimeout(()=>requestAnimationFrame(f),80);
  $('#okc').onclick=()=>{const [bx,by]=centerOf($('#okc'));burst(bx,by,30,true);ov.hidden=true;then()}}
function levelUp(from,to,tierChanged){const ov=$('#overlay');ov.hidden=false;ov.className='overlay';const t=tierOf(to);const rw=rewardFor(to);
  const row=TIERS.map(x=>`<img src="${ICO(TIERICO[x.n])}" class="${x.from<=to?(x.n===t.n&&tierChanged?'new':'done'):''}" alt="${x.n}">`).join('');
  ov.innerHTML=`<div class="sweep"></div><div class="ov"><div class="mono">${tierChanged?'YOU MOVED UP':'LEVEL UP'}</div><div class="rowwrap"><div class="row">${row}</div></div><div class="disp h1">${tierChanged?`You are ${t.n}.`:`Level ${to}.`}</div><p>${tierChanged?t.keep+'. It ships this week.':'Unlocked: '+rw.txt+'.'}${to-from>1?` And ${to-from-1} more level${to-from>2?'s':''} on the way up.`:''}</p><button class="btn" id="okl">Continue</button></div>`;
  const rowEl=ov.querySelector('.row');const idx=TIERS.findIndex(x=>x.n===t.n);
  requestAnimationFrame(()=>{const imgs=[...rowEl.children];const target=imgs[idx];const off=target.offsetLeft+target.offsetWidth/2;rowEl.style.transform=`translateX(${-off}px)`});
  setTimeout(()=>{ov.querySelector('.sweep').classList.add('go');const [x,y]=centerOf(ov.querySelector('.row'));burst(x,y,60,false)},350);
  $('#okl').onclick=()=>{ov.hidden=true;render()}}

// ── The Spin: one per order. Always lands on something. ──
const WHEEL=[
 {n:'Free shipping',      w:30, ico:'freeship', t:0},
 {n:'+100 tokens',        w:22, ico:'tokens',   t:100},
 {n:'A vial under $50',   w:10, ico:'vial',     t:0},
 {n:'+250 tokens',        w:14, ico:'tokens',   t:250},
 {n:'Double tokens next order',w:9,ico:'token', t:0},
 {n:'Bacteriostatic water',w:8, ico:'vial',     t:0},
 {n:'A foil sticker sheet',w:5, ico:'sticker',  t:0},
 {n:'A mystery box',      w:2,  ico:'mystery',  t:0},
];
function spinView(){const m=$('#view');const n=WHEEL.length,seg=360/n;
  const conic=WHEEL.map((x,i)=>`${i%2?'#173384':'#e6ecf7'} ${i*seg}deg ${(i+1)*seg}deg`).join(',');
  m.innerHTML=`${band('The spin','ONE PER ORDER · IT ALWAYS LANDS ON SOMETHING')}<div class="card spinc"><div class="mono mute">YOU HAVE <b id="spinsleft" style="color:var(--pig)">${U.spins} SPIN${U.spins===1?'':'S'}</b></div>
   <div class="wheelwrap"><div class="pointer"></div><div class="wheel" id="wheel" style="background:conic-gradient(${conic})">${WHEEL.map((x,i)=>`<div class="wedge" style="transform:rotate(${i*seg+seg/2}deg)"><img src="${ICO(x.ico)}" alt=""></div>`).join('')}<div class="hub"><img src="${IMG}loyalty/token.png" alt=""></div></div></div>
   <div class="spinout" id="spinout"><div class="disp" style="font-size:15px">Spin the token.</div><div class="mono mute" style="margin-top:6px">FREE SHIPPING · TOKENS · A FREE VIAL · DOUBLE TOKENS · A MYSTERY BOX</div></div>
   <button class="btn pig wide" id="spinbtn"${U.spins?'':' disabled'}>${U.spins?'Spin':'Order to earn a spin'}</button><button class="btn ghost wide" id="spinback" style="margin-top:8px">Back</button></div>`;
  let turns=0,busy=false;
  $('#spinbtn').onclick=()=>{if(busy||!U.spins)return;busy=true;U.spins--;
    const total=WHEEL.reduce((a,x)=>a+x.w,0);let r=Math.random()*total,pick=0;for(let i=0;i<n;i++){r-=WHEEL[i].w;if(r<=0){pick=i;break}}
    const target=360*5+(360-(pick*seg+seg/2))+(Math.random()*seg*.6-seg*.3);turns+=target;
    const w=$('#wheel');w.style.transition='transform 4.2s cubic-bezier(.12,.8,.12,1)';w.style.transform=`rotate(${turns}deg)`;
    $('#spinbtn').disabled=true;$('#spinout').innerHTML='<div class="mono" style="color:var(--pig)">SPINNING</div>';
    setTimeout(()=>{const x=WHEEL[pick];if(x.t){U.tokens+=x.t;header()}if(/Double/.test(x.n))U.mult=2;
      $('#spinout').innerHTML=`<div class="mono" style="color:var(--pig)">YOU WON</div><div class="disp" style="font-size:18px;margin-top:6px">${x.n}</div><div class="mono mute" style="margin-top:6px">${x.t?'ADDED TO YOUR BALANCE':'ADDED TO YOUR NEXT ORDER'}</div>`;
      const [cx,cy]=centerOf($('#spinout'));burst(cx,cy,x.t?50:24,!!x.t);busy=false;$('#spinbtn').disabled=!U.spins;$('#spinbtn').textContent=U.spins?`Spin again (${U.spins})`:'Order to earn a spin';$('#spinsleft').textContent=`${U.spins} SPIN${U.spins===1?'':'S'}`},4300)};
  $('#spinback').onclick=()=>go('road')}

// ── views ──
const band=(t,s)=>`<div class="band"><div class="disp">${t}</div><div class="mono">${s}</div></div>`;
function road(){const l=levelOf(U.spend),t=tierOf(l),nl=Math.min(50,l+1),nt=TIERS.find(x=>x.from>l);
  const from=LEVELS[l],to=LEVELS[nl],pct=l>=50?100:Math.max(4,(U.spend-from)/(to-from)*100);
  const steps=[];for(let i=Math.max(1,l-2);i<=Math.min(50,l+6);i++){const r=rewardFor(i);steps.push(`<div class="step${i<l?' done':i===l?' now':''}"><div class="n">${i}</div><img class="ico" src="${ICO(r.big?TIERICO[tierOf(i).n]:iconFor(r.txt))}" alt=""><div class="r"><b>${i<l?'EARNED':i===l?'YOU ARE HERE':'$'+fmt(LEVELS[i])}</b>${r.txt}</div><div class="s">${i===l?'':i<l?'✓':'$'+fmt(Math.max(0,LEVELS[i]-U.spend))+' to go'}</div></div>`)}
  return `${band('The road','FIFTY LEVELS · SIX MATERIALS · ONE BRACELET')}
  <div class="card status"><div class="ring" style="--p:${pct}%"><img src="${ICO(TIERICO[t.n])}" alt=""></div><div><div class="mono next">LEVEL ${l} · ${t.n.toUpperCase()}</div><div class="disp big">${fmt(U.tokens)} <em>TOKENS</em></div><div class="meter"><i style="width:${pct}%"></i></div><div class="mono mute">${l<50?`$${fmt(to-U.spend)} TO LEVEL ${nl} · ${rewardFor(nl).txt.toUpperCase()}`:'TOP OF THE ROAD'}</div></div></div>
  <a class="card spincard" id="tospin"><img src="${ICO('spin')}" alt=""><div><div class="mono" style="color:var(--pig)">THE SPIN</div><div class="disp" style="font-size:14px;margin-top:5px">${U.spins?`You have ${U.spins} spin${U.spins===1?'':'s'}.`:'Order to earn a spin.'}</div><div class="mono mute" style="margin-top:5px">FREE SHIPPING · TOKENS · A FREE VIAL · A MYSTERY BOX</div></div><span class="btn${U.spins?' pig':''}">${U.spins?'Spin':'Locked'}</span></a>
  <div class="card slide"><div class="lab"><div><div class="mono mute">WHAT WOULD IT TAKE</div><div class="disp" id="stitle" style="font-size:14px;margin-top:6px">Drag the token</div></div><div class="mono next" id="ssub"></div></div>
    <div class="track" id="track"><div class="fill" id="sfill"></div><div class="what" id="swhat"></div>${TIERS.map(x=>`<div class="tick t" style="left:${pos(x.at)}%"></div>`).join('')}<div class="knob" id="knob"></div></div>
    <div class="out"><div><div class="disp" id="sout"></div><div class="mono" id="sout2"></div></div><button class="btn pig" id="sjump">Buy it now</button></div>
    <div class="jump"><button class="btn ghost" data-j="10000">Jump to Chrome · $${fmt(Math.max(0,10000-U.spend))}</button><button class="btn" data-j="150000">The Bracelet · $${fmt(Math.max(0,150000-U.spend))}</button></div></div>
  ${band('Next up','EVERY LEVEL IS A REWARD')}<div class="card map">${steps.join('')}</div>
  ${band('The materials','THE OBJECT AT EACH TIER')}<div class="card">${TIERS.map(x=>`<div class="tierrow"><img src="${ICO(TIERICO[x.n])}" alt=""><div><div class="disp">${x.n}</div><div class="mono">${x.at?'LEVEL '+x.from+' · $'+fmt(x.at):'LEVEL 1 · JOIN'} · ${x.keep.toUpperCase()}</div></div></div>`).join('')}</div>
  <div class="card"><div class="mono mute">DEV · SIMULATE AN ORDER</div><div class="dev"><button data-o="44">ORDER $44</button><button data-o="129">BUNDLE $129</button><button data-o="420" data-m="1.5">BOX $420 · 1.5×</button><button data-o="2500">$2,500</button><button id="reset">RESET</button></div></div>`}
function pos(spend){/* equal width per tier band, spend interpolates inside */const A=TIERS.map(t=>t.at);for(let i=A.length-1;i>=0;i--){if(spend>=A[i]){if(i===A.length-1)return 100;return (i+(spend-A[i])/(A[i+1]-A[i]))/(A.length-1)*100}}return 0}
function spendAt(p){const A=TIERS.map(t=>t.at);const seg=(A.length-1)*p/100;const i=Math.min(A.length-2,Math.floor(seg));return Math.round(A[i]+(A[i+1]-A[i])*(seg-i))}
function wireRoad(){const tr=$('#track'),knob=$('#knob'),fill=$('#sfill'),what=$('#swhat');const cur=pos(U.spend);let ex=U.spend;
  function paint(sp){ex=sp;const p=pos(sp);knob.style.left=p+'%';fill.style.width=cur+'%';what.style.left=Math.min(cur,p)+'%';what.style.width=Math.abs(p-cur)+'%';
    const l=levelOf(sp),t=tierOf(l);const gained=Math.max(0,l-levelOf(U.spend));
    $('#sout').textContent=sp<=U.spend?`Level ${levelOf(U.spend)} · ${tierOf(levelOf(U.spend)).n}`:`Level ${l} · ${t.n}`;
    $('#sout2').textContent=sp<=U.spend?'YOU ARE HERE':`$${fmt(sp-U.spend)} MORE · +${gained} LEVEL${gained===1?'':'S'} · ${t.keep.toUpperCase()}`;
    $('#ssub').textContent=`AT $${fmt(sp)}`;$('#sjump').disabled=sp<=U.spend;$('#sjump').textContent=sp<=U.spend?'Drag to explore':`Buy $${fmt(sp-U.spend)} now`}
  paint(U.spend);
  const move=e=>{const r=tr.getBoundingClientRect();const p=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));paint(spendAt(p))};
  tr.addEventListener('pointerdown',e=>{tr.classList.add('drag');tr.setPointerCapture(e.pointerId);move(e)});
  tr.addEventListener('pointermove',e=>{if(tr.classList.contains('drag'))move(e)});
  const up=()=>tr.classList.remove('drag');tr.addEventListener('pointerup',up);tr.addEventListener('pointercancel',up);
  $('#sjump').onclick=()=>{if(ex>U.spend)order(ex-U.spend)};
  document.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{const a=+b.dataset.j-U.spend;if(a>0)order(a);else paint(+b.dataset.j)});
  document.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>order(+b.dataset.o,+(b.dataset.m||1)));
  $('#reset').onclick=()=>{U.spend=0;U.tokens=100;U.spins=1;header();render()};
  const ts=$('#tospin');if(ts)ts.onclick=()=>spinView()}

function shelf(){return `${band('The shelf','TOKENS BUY PEPTIDES · A BOX ARRIVES')}${SHELF.map((x,i)=>`<div class="sh${U.tokens>=x.p?' ok':''}"><img src="${ICO(iconFor(x.n+' '+x.w))}" alt=""><div class="t"><div class="mono">${fmt(x.p)} TOKENS</div><b>${x.n}</b>${x.w}</div><button class="btn" data-r="${i}"${U.tokens>=x.p?'':' disabled'}>${U.tokens>=x.p?'Redeem':fmt(x.p-U.tokens)+' to go'}</button></div>`).join('')}
  ${band('The vault','FIVE KINDS OF CODE')}<div class="card"><div class="vin"><input id="vin" placeholder="ENTER A CODE" spellcheck="false"><button class="btn" id="vgo">Reveal</button></div><div class="vout" id="vout"><div class="mono mute">LIVE · CREATOR · IN THE BOX · MULTIPLIER · MYSTERY</div></div><div class="tries">${Object.keys(CODES).map(c=>`<button data-c="${c}">${c}</button>`).join('')}</div></div>`}
function wireShelf(){document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>redeem(SHELF[+b.dataset.r]));
  const rv=code=>{const k=code.trim().toUpperCase(),c=CODES[k],o=$('#vout');if(!c){o.innerHTML='<div class="mono mute">NOT A CODE</div><p style="font-size:12px;margin-top:6px">Check the box, the live, or your email.</p>';return}
    if(U.used.includes(k)){o.innerHTML='<div class="mono mute">ALREADY USED</div>';return}U.used.push(k);let w=c.w,t=c.t;if(!w){const m=MYST[Math.floor(Math.random()*MYST.length)];w=m[0];t=m[1]}
    o.innerHTML=`<div class="mono" style="color:var(--pig)">${c.k} CODE · ${k}</div><div class="disp">${w}</div><div class="mono mute" style="margin-top:6px">${U.used.length} OF 5 TOWARD THE MYSTERY BOX</div>`;
    const [x,y]=centerOf(o);burst(x,y,t?28:14,!!t);if(t){U.tokens+=t;header()}};
  $('#vgo').onclick=()=>rv($('#vin').value);$('#vin').addEventListener('keydown',e=>{if(e.key==='Enter')rv($('#vin').value)});document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{$('#vin').value=b.dataset.c;rv(b.dataset.c)})}
function redeem(item){const m=$('#view');m.innerHTML=`${band('Redeem','DRAG THE TOKEN INTO THE BOX')}<div class="card redeem"><div><div class="mono mute">YOU ARE SPENDING</div><div class="disp" style="font-size:18px;margin-top:6px">${fmt(item.p)} tokens</div><div class="mono" style="color:var(--pig);margin-top:6px">${item.n.toUpperCase()} · ${item.w.toUpperCase()}</div></div>
   <div class="slot" id="slot"><img class="coin" id="coin" src="${IMG}loyalty/token.png" alt="" draggable="false"><div class="mono hint" id="hint">↓ DRAG DOWN TO REDEEM</div><div class="halo"></div><img class="box" id="rbox" src="${IMG}loyalty/box-sealed-w.jpg" alt=""></div>
   <button class="btn ghost wide" id="rback">Back to the shelf</button></div>`;
  const coin=$('#coin'),slot=$('#slot'),box=$('#rbox');let y0=0,dy=0,drag=false;
  coin.addEventListener('pointerdown',e=>{drag=true;y0=e.clientY;coin.setPointerCapture(e.pointerId);coin.style.transition='none'});
  coin.addEventListener('pointermove',e=>{if(!drag)return;dy=Math.max(0,Math.min(190,e.clientY-y0));coin.style.transform=`translateY(${dy}px) scale(${1-dy/600})`;slot.classList.toggle('ready',dy>120)});
  const drop=()=>{if(!drag)return;drag=false;coin.style.transition='';if(dy>120){coin.style.transform='translateY(190px) scale(.3)';coin.style.opacity=0;setTimeout(()=>done(),380)}else{coin.style.transform='';slot.classList.remove('ready')}};
  coin.addEventListener('pointerup',drop);coin.addEventListener('pointercancel',drop);
  function done(){U.tokens-=item.p;header();const ov=$('#overlay');ov.hidden=false;ov.className='overlay dark';ov.innerHTML='<div class="ov"><div class="mono">·</div></div>';
    setTimeout(()=>{ov.className='overlay';ov.innerHTML=`<div class="sweep go"></div><div class="ov"><div class="mono">REDEEMED</div><img src="${IMG}loyalty/box-open-w.jpg" style="width:220px;height:165px;object-fit:cover" alt=""><div class="disp h1">${item.n}.<br>On its way.</div><div class="receipt"><img src="${IMG+item.img}" alt=""><div><b>${item.n}</b><span>${fmt(item.p)} tokens · ships with your next order · ${fmt(U.tokens)} left</span></div></div><button class="btn" id="okr">Back to the shelf</button></div>`;
      const [x,y]=centerOf(ov.querySelector('.h1'));burst(x,y,36,false);$('#okr').onclick=()=>{ov.hidden=true;go('shelf')}},700)}
  $('#rback').onclick=()=>go('shelf')}

function missions(){return `${band('Missions','DO THIS, GET THAT')}${MISSIONS.map((m,i)=>{const done=m.have>=m.need;return `<div class="mis${done?' done':''}"><img class="mico" src="${ICO(iconFor(m.rt))}" alt=""><span class="chip mono">${m.c}</span><div class="n">${m.n}</div><div class="mono r">${m.rt.toUpperCase()}</div><div class="bar"><i style="width:${Math.round(m.have/m.need*100)}%"></i></div><div class="row"><span class="mono mute">${m.have} / ${m.need}</span>${done?(m.claimed?'<span class="mono" style="color:var(--pig)">CLAIMED</span>':`<button class="btn" data-m="${i}">Claim</button>`):`<button class="btn ghost" data-do="${i}">Do it</button>`}</div></div>`}).join('')}`}
function wireMissions(){document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const m=MISSIONS[+b.dataset.m];m.claimed=true;const [x,y]=centerOf(b);burst(x,y,30,!!m.r);if(m.r){U.tokens+=m.r;header()}render()});
  document.querySelectorAll('[data-do]').forEach(b=>b.onclick=()=>{const m=MISSIONS[+b.dataset.do];m.have=Math.min(m.need,m.have+1);const [x,y]=centerOf(b);burst(x,y,10,false);render()})}

function live(){const have=U.stamps,need=4;return `${band('The live','THURSDAY 6PM PT · TIKTOK @SKOCOMPOUNDS')}
  <div class="card"><div class="mono mute">THIS WEEK</div><div class="disp" style="font-size:18px;margin:8px 0">Double tokens<br>while we are live.</div><div class="mono" style="color:var(--pig)">THE FULL BOX DRAW · EVERY ORDER THIS WEEK IS AN ENTRY</div><button class="btn wide" style="margin-top:12px" id="remind">Set a reminder</button></div>
  <div class="card"><div class="h"><div class="disp">Stamp card</div><span class="mono mute">${need-have>0?need-have+' MORE TO A FREE BOX':'FREE BOX EARNED'}</span></div><div class="stamps">${Array.from({length:8},(_,i)=>`<div class="stamp${i<have?' on':''}${i===need-1?' goal':''}"><img src="${ICO('stamp')}" alt=""><span class="mono">${i<have?'LIVE '+(i+1):i===need-1?'FREE BOX':'—'}</span></div>`).join('')}</div><button class="btn ghost wide" style="margin-top:10px" id="stamp">I was there (dev)</button></div>
  <div class="card"><div class="mono mute">THE LIVE CODE</div><p style="font-size:13px;color:var(--mute);margin-top:6px;line-height:1.5">Read out once, on the live, worth 200 tokens. Enter it in the vault on the Shelf tab.</p></div>`}
function wireLive(){$('#stamp').onclick=e=>{U.stamps=Math.min(8,U.stamps+1);const [x,y]=centerOf(e.target);burst(x,y,16,false);render()};$('#remind').onclick=e=>{e.target.textContent='Reminder set';}}

function refer(){return `${band('Refer','THEY GET 15% · YOU GET 350')}
  <div class="card"><div class="mono mute">YOUR LINK</div><div class="link mono" style="margin-top:8px">skocompounds.com/r/<b>J-MORELLO-8F2</b><button id="copy">COPY</button></div><div class="mono mute" style="margin-top:10px">${U.refs} ORDERED · ${U.refs*350} TOKENS EARNED · IT PAYS WHEN THEIR ORDER SHIPS</div></div>
  <div class="card"><div class="h"><div class="disp">The ladder</div><span class="mono mute">BY REFERRALS WHO ORDER</span></div><div class="lad">${LADDER.map(([n,r])=>`<div class="${U.refs>=n?'done':''}"><b>${n}</b><span><img class="lico" src="${ICO(iconFor(r))}" alt="">${r}</span><i>${U.refs>=n?'EARNED':(n-U.refs)+' TO GO'}</i></div>`).join('')}</div></div>
  <div class="card"><div class="h"><div class="disp">This month</div><span class="mono mute">READ OUT ON THE LIVE</span></div><div class="lb">${LB.map(([n,l,c],i)=>`<div><i class="mono">${String(i+1).padStart(2,'0')}</i><b>${n}</b><span class="mono">${c} ORDERED</span></div>`).join('')}</div></div>`}
function wireRefer(){$('#copy').onclick=e=>{navigator.clipboard?.writeText('skocompounds.com/r/J-MORELLO-8F2');e.target.textContent='COPIED'}}

const V={road:[road,wireRoad],shelf:[shelf,wireShelf],missions:[missions,wireMissions],live:[live,wireLive],refer:[refer,wireRefer]};
function render(){const [h,w]=V[view];$('#view').innerHTML=h();w();header();document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===view))}
function go(v){view=v;render();$('main').scrollTo(0,0)}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>go(b.dataset.t));
$('#bal').onclick=()=>go('shelf');
render();
if(!U.welcomed){U.welcomed=true;setTimeout(()=>{const ov=$('#overlay');ov.hidden=false;ov.className='overlay';
  ov.innerHTML=`<div class="sweep"></div><div class="ov"><img class="bigtoken" src="${IMG}loyalty/token.png" alt=""><div class="mono">WELCOME TO THE BADGE</div><div class="disp cnt" id="cnt">0 <em>TOKENS</em></div><p>You start on the board, never at zero. Every dollar from here is a token, and tokens buy peptides.</p><button class="btn pig" id="okc">Collect</button></div>`;
  const cnt=$('#cnt');setTimeout(()=>{ov.querySelector('.sweep').classList.add('go');const [x,y]=centerOf(cnt);burst(x,y,50,false);const t0=performance.now();const f=now=>{const k=Math.min(1,(now-t0)/1100);const e=1-Math.pow(1-k,3);cnt.innerHTML=fmt(100*e)+' <em>TOKENS</em>';if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)},120);
  $('#okc').onclick=()=>{const [bx,by]=centerOf($('#okc'));burst(bx,by,30,true);U.tokens+=100;ov.hidden=true;header();render()}},600)}
