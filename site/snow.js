// snowfall: sparse, slow, studio. Far flakes are dust, near flakes are soft bokeh, a few catch the
// light as four-point glints. Cheap on purpose: the soft flakes are pre-rendered sprites, the loop
// runs at 30 frames, it pauses when its stage is off screen or the tab is hidden, and under
// prefers-reduced-motion it draws one still frame.
(function(){
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sprite=(function(){const s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d');
    const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=r;g.fillRect(0,0,64,64);return s})();
  document.querySelectorAll('canvas.snowfall').forEach(init);
  function init(c){
    const ctx=c.getContext('2d');let W=0,H=0,dpr=1,flakes=[],raf=0,t=0,last=0,visible=true;
    const density=+c.dataset.density||1;
    function size(){dpr=Math.min(devicePixelRatio||1,2);const r=c.getBoundingClientRect();W=r.width;H=r.height;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);seed()}
    function seed(){const n=Math.min(180,Math.round(W*H/11000*density));flakes=[];for(let i=0;i<n;i++)flakes.push(make(true))}
    function make(anywhere){const z=Math.random();const near=z>.93;const glint=!near&&Math.random()<.06;
      return{x:Math.random()*W,y:anywhere?Math.random()*H:-14,z,near,glint,
        r:near?5+Math.random()*7:.5+z*1.8,vy:(near?.55:.12+z*.38)*(H/900)*2,ph:Math.random()*Math.PI*2,sw:.2+Math.random()*.6,a:near?.14+Math.random()*.16:.35+z*.5}}
    function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';
      for(const f of flakes){
        if(f.near){ctx.globalAlpha=f.a;ctx.drawImage(sprite,f.x-f.r*2,f.y-f.r*2,f.r*4,f.r*4);continue}
        ctx.globalAlpha=f.a;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();
        if(f.glint){const p=(Math.sin(t*.9+f.ph)+1)/2;if(p>.55){const s=f.r*(4+8*p),k=(p-.55)/.45;ctx.globalAlpha=k*.9;ctx.strokeStyle='#fff';ctx.lineWidth=.8;
          ctx.beginPath();ctx.moveTo(f.x-s,f.y);ctx.lineTo(f.x+s,f.y);ctx.moveTo(f.x,f.y-s);ctx.lineTo(f.x,f.y+s);ctx.stroke();
          ctx.globalAlpha=k*.5;ctx.beginPath();ctx.arc(f.x,f.y,f.r*2.2,0,7);ctx.fill()}}
      }ctx.globalAlpha=1}
    function step(now){raf=requestAnimationFrame(step);if(now-last<33)return;last=now;t+=1/30;
      for(let i=0;i<flakes.length;i++){const f=flakes[i];f.y+=f.vy;f.x+=Math.sin(t*f.sw+f.ph)*(f.near?.5:.24)+(.08*f.z);
        if(f.y>H+14||f.x<-18||f.x>W+18)flakes[i]=make(false)}draw()}
    function run(){cancelAnimationFrame(raf);if(still){draw();return}if(visible&&!document.hidden)raf=requestAnimationFrame(step)}
    size();addEventListener('resize',()=>{size();run()});
    document.addEventListener('visibilitychange',run);
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;run()}).observe(c);
    run();
  }
})();
