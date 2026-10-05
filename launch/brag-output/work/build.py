import re,json
R='/home/user/Claude-Code-Experiments/'
css=open('page.css').read()
fonts=open('fonts_local.css').read()
wm=open(R+'brand/logo/knock-wordmark-reverse.svg').read()
tl=open('timeline.json').read()
check='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5 8.3l2 2 4-4.3"/></svg>'
arrow='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>'
msg=[("Hey Rahul, ",None),("saw you moved from Flipkart into product at Zepto.",1),(" ",None),("I'm making a similar jump from brand management.",2),(" ",None),("Curious, what was the biggest adjustment for you?",3)]
bq=''
for text,n in msg:
    chars=''.join(f'<span class="c">{c if c!=" " else "&nbsp;"}</span>' if False else f'<span class="c">{c}</span>' for c in text)
    if n: bq+=f'<mark data-n="{n}">{chars}</mark><span class="n" data-n="{n}" aria-hidden="true">{n}</span>'
    else: bq+=chars
pile=[("Associate Product Manager","Applied through a job portal","Under review"),("Product Manager, Payments","Applied through a job portal","Under review"),("APM, Consumer","Applied through a careers page","No response"),("Product Analyst","Applied through a job portal","Under review"),("Associate PM, Growth","Applied through a job portal","No response"),("Product Manager I","Applied through a careers page","Under review")]
pl=''.join(f'<li><span><b>{a}</b>{b}</span><em>{c}</em></li>' for a,b,c in pile)
stampsvg='<svg viewBox="0 0 64 72" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10h24"/><path d="M26 10v6M38 10v6"/><circle cx="32" cy="22" r="6"/><path d="M22 34a14 14 0 1 0 20 0"/><path d="M32 54v8"/><path d="M26 64h12"/></svg>'
html=f'''<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><style>
{fonts}
{css}
html,body{{margin:0;width:1920px;height:1080px;overflow:hidden;background:#EEF3F8}}
#stage{{position:absolute;inset:0;overflow:hidden;background:#EEF3F8}}
.scene{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0}}
.z{{zoom:1.3}}
#s1 h2{{font-size:5.2rem;line-height:.95}}
#s1 .wrap{{width:1240px}}
.problem .grid{{display:grid}}
#sheet{{position:absolute;left:150px;top:90px;width:1620px;height:900px;opacity:0;padding:0}}
#sheet .in{{position:absolute;inset:0}}
.blk{{position:absolute;left:0;top:0;width:1246px;height:692px}}
#hero{{padding:72px 72px 0}}
#hero h1{{font-size:7rem;max-width:none}}
#hero .hint2{{margin-top:26px;font-size:1.3rem;max-width:34ch;line-height:1.4;color:var(--ink)}}
#hero .address{{position:absolute;left:72px;right:72px;bottom:70px;max-width:none}}
#hero .stamp-wrap{{position:absolute;right:72px;top:72px;width:150px}}
#hero .address input{{pointer-events:none}}
#caret{{position:absolute;bottom:14px;width:2px;height:28px;background:var(--post);left:0}}
#ledgerblk{{padding:70px 72px 0}}
#ledgerblk h2{{font-size:5rem;max-width:14ch}}
#ledgerblk .ledger{{position:absolute;left:0;right:0;bottom:0;margin:0}}
#ledgerblk .ledger table{{border-collapse:separate;border-spacing:0}}
#ledgerblk .ledger td{{font-size:1.12rem;padding-top:18px;padding-bottom:18px}}
#ledgerblk .why .w{{background:linear-gradient(transparent 58%,var(--post-soft) 58%) no-repeat;background-size:0% 100%;padding:0 .08em}}
#s4{{background:transparent}}
#s4 .grid{{width:1240px;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.2fr);gap:70px;align-items:center}}
#s4 h2{{font-size:5rem}}
#s4 .sub{{margin-top:22px;font-size:1.5rem;font-family:var(--serif);color:var(--ink);max-width:22ch;line-height:1.35}}
#s4 .note{{transform:rotate(-1deg)}}
#s4 blockquote{{font-size:1.9rem}}
#s4 .c{{visibility:hidden}}
#s4 mark{{background:linear-gradient(transparent 62%,var(--post-soft) 62%) no-repeat;background-size:0% 100%}}
#s5 .wrapz{{width:1240px;height:830px;position:relative}}
#s5 .route{{position:absolute;left:0;right:0;top:40px}}
#s5 .route li{{opacity:0}}
#s5 .route h3{{font-size:1.7rem}}
#s5 .logo{{position:absolute;left:0;top:300px;width:300px}}
#s5 .big{{position:absolute;left:0;top:330px;font-family:var(--display);font-variation-settings:"wdth" 70;font-stretch:70%;font-weight:800;font-size:8.2rem;line-height:.9;letter-spacing:-.02em;color:var(--white);width:1200px}}
#s5 .tag{{position:absolute;left:4px;top:530px;font-family:var(--serif);font-style:italic;font-size:2.2rem;color:var(--inland)}}
#s5 .cta{{position:absolute;left:0;top:640px;display:flex;align-items:center;gap:28px}}
#s5 .cta .btn{{background:var(--inland);color:var(--ink);border-color:var(--inland);font-size:1.25rem;min-height:60px}}
#s5 .cta span{{color:#BFD0E6;font-size:1.15rem}}
#s5 .stampw{{position:absolute;right:0;top:300px;width:200px}}
.pop{{transform-origin:center}}
</style></head><body><div id="stage">

<div class="scene" id="s1"><div class="z"><div class="problem"><div class="wrap grid">
  <div class="copy"><h2 id="h1s1">Hundreds of applications. No callbacks.</h2></div>
  <div class="pile"><ol id="pile">{pl}</ol><div class="returned" id="ret">Still waiting<small>Return to sender</small></div></div>
</div></div></div></div>

<div id="sheet" class="sheet" style="width:1620px;height:900px"><span class="perf l"></span><span class="perf r"></span>
 <div class="z" style="position:absolute;left:0;top:0;width:1246px;height:692px">
  <div class="blk" id="hero">
    <h1><span id="l1">Stop applying.</span> <span class="two" id="l2">Start conversations.</span></h1>
    <p class="hint2" id="hint">Interviews at your target companies, through the people who work there.</p>
    <div class="stamp-wrap" id="stampw"><div class="stamp"><div class="stamp-inner">{stampsvg}<b>Knock</b></div></div>
      <svg class="postmark" id="pm" viewBox="0 0 200 200" fill="none" stroke="currentColor"><defs><path id="pmp" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs><circle cx="100" cy="100" r="92" stroke-width="3"/><circle cx="100" cy="100" r="56" stroke-width="2"/><text font-family="Archivo, sans-serif" font-size="17" font-weight="700" letter-spacing="3.2" fill="currentColor" stroke="none"><textPath href="#pmp">KNOCK ON THE RIGHT DOOR · ONE PERSON AT A TIME ·</textPath></text><text x="100" y="108" text-anchor="middle" font-family="Archivo, sans-serif" font-size="16" font-weight="700" letter-spacing="3" fill="currentColor" stroke="none">INDIA</text><path d="M8 150c30-8 60 8 92 0s62-8 92 0M8 166c30-8 60 8 92 0s62-8 92 0M8 182c30-8 60 8 92 0s62-8 92 0" stroke-width="2.5"/></svg></div>
    <div class="address" id="addr"><label>To</label><div class="field"><input id="q" type="text" placeholder="Zepto, Razorpay, Swiggy"><span id="caret"></span></div><button class="btn" id="btn" type="button">Get my target list {arrow}</button></div>
  </div>
  <div class="blk" id="ledgerblk">
    <h2 id="lh">A shared reason to talk.</h2>
    <div class="ledger"><div class="ledger-cap"><p>What a target list looks like, for a move into product at Zepto.</p><small>Sample for illustration. Real lists name real people.</small></div>
    <table><thead><tr><th>Who</th><th>Where</th><th>The shared reason to talk</th><th>Status</th></tr></thead><tbody id="rows">
     <tr><td>Hiring manager, Product</td><td class="where">Zepto</td><td class="why"><span class="w">Both started in FMCG brand roles before product</span></td><td class="st"><span class="status"><i></i>Message drafted for you</span></td></tr>
     <tr><td>Product manager, Growth</td><td class="where">Zepto</td><td class="why"><span class="w">Same college, three batches apart</span></td><td class="st"><span class="status"><i></i>Message drafted for you</span></td></tr>
     <tr><td>Senior PM, Quick commerce</td><td class="where">Blinkit</td><td class="why"><span class="w">Wrote about a launch you worked on as a brand manager</span></td><td class="st"><span class="status"><i></i>Researching</span></td></tr>
    </tbody></table></div>
  </div>
 </div>
</div>

<div class="scene" id="s4"><div class="z"><div class="grid example">
  <div><h2 id="h4">A first message you approve.</h2><p class="sub" id="sub4">Short. Specific. About them.</p></div>
  <figure class="note" id="note" style="margin:0"><div class="note-meta"><span class="avatar">R</span><div><b>To Rahul</b><small>Product, Zepto · previously Flipkart</small></div></div>
   <blockquote><p id="bq">{bq}</p></blockquote>
   <figcaption class="note-foot"><span id="f1">{check}Approved by you</span><span id="f2">{check}Sent from your LinkedIn</span></figcaption></figure>
</div></div></div>

<div class="scene" id="s5"><div class="z"><div class="wrapz">
  <ol class="route" id="route">
   <li><span class="mark">1</span><h3>You pick your targets</h3></li>
   <li><span class="mark">2</span><h3>We find the right people</h3></li>
   <li><span class="mark">3</span><h3>We write to each one</h3></li>
   <li><span class="mark">4</span><h3>We guide every reply</h3></li>
  </ol>
  <div class="big" id="big">Knock on the right door.</div>
  <div class="tag" id="tag">Stop applying. Start conversations.</div>
  <div class="cta" id="cta"><a class="btn">Get my target list {arrow}</a><span>Packages from Rs 2,499</span></div>
</div></div></div>
</div>
<script>
const T={tl};
const $=id=>document.getElementById(id);
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const p=(t,s,d)=>cl((t-s)/d);
const eo=x=>1-Math.pow(1-x,3);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eb=x=>{{const c=1.4;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}};
const lerp=(a,b,x)=>a+(b-a)*x;
function mix(c1,c2,x){{return `rgb(${{c1.map((v,i)=>Math.round(lerp(v,c2[i],x))).join(',')}})`}}
const PAPER=[238,243,248],INL=[169,199,230],INK=[14,31,58];
function fade(el,t,a0,a1,o0,o1){{ // in at a0..a1, out o0..o1
  let v=eio(p(t,a0,a1-a0))*(1-eio(p(t,o0,o1-o0)));return v}}
function rise(el,v,dy=28){{el.style.opacity=v;el.style.transform=`translateY(${{(1-v)*dy}}px)`}}
let measure;
function render(t){{
 const A=T;
 // background
 let bg=PAPER;
 let b4=eio(p(t,A.s4.bg0,A.s4.bg1-A.s4.bg0)), b5=eio(p(t,A.s5.bg0,A.s5.bg1-A.s5.bg0));
 let col=mix(PAPER,INL,b4); 
 if(b5>0){{ col=mix(INL,INK,b5)}}
 $('stage').style.background=col;
 // S1
 const s1=$('s1'); const s1o=1-eio(p(t,A.s1.out0,A.s1.out1-A.s1.out0));
 s1.style.opacity=t<A.s1.out1?s1o:0;
 rise($('h1s1'),eo(p(t,0.05,0.7))*s1o,22);
 const lis=$('pile').children, base=[1,1,.8,.6,.42,.26];
 for(let i=0;i<6;i++){{const v=eo(p(t,A.s1.list0+i*A.s1.listStep,0.5));lis[i].style.opacity=v*base[i];lis[i].style.transform=`translateY(${{(1-v)*30}}px)`}}
 const rs=p(t,A.s1.stamp,0.35); const ret=$('ret');
 ret.style.opacity=rs>0?Math.min(1,rs*4):0; ret.style.transform=`rotate(${{-8-(1-eo(rs))*12}}deg) scale(${{lerp(1.8,1,eo(rs))}})`;
 // sheet
 const sh=$('sheet'); const shv=eio(p(t,A.s2.in0,A.s2.in1-A.s2.in0))*(1-eio(p(t,A.s3.out0+0.2,A.s3.out1-A.s3.out0)));
 sh.style.opacity=shv; sh.style.transform=`translateY(${{(1-eio(p(t,A.s2.in0,A.s2.in1-A.s2.in0)))*24}}px)`;
 sh.style.boxShadow=`0 1px 0 rgba(255,255,255,.6) inset,0 30px 60px -36px rgba(14,31,58,${{.55*shv}}),0 6px 14px -8px rgba(14,31,58,${{.25*shv}})`;
 // hero
 const heroOut=1-eio(p(t,A.s2.out0,A.s2.out1-A.s2.out0));
 $('hero').style.opacity=heroOut; $('hero').style.display=t>A.s2.out1?'none':'block';
 const l1=eo(p(t,A.s2.h1a,0.6)),l2=eo(p(t,A.s2.h1b,0.6));
 $('l1').style.opacity=l1;$('l1').style.transform=`translateY(${{(1-l1)*30}}px)`;
 $('l2').style.opacity=l2;$('l2').style.transform=`translateY(${{(1-l2)*30}}px)`;
 $('l1').style.display=$('l2').style.display='block';
 rise($('hint'),eo(p(t,A.s2.hint,0.6)),16);
 const sp=p(t,A.s2.stamp,0.45);$('stampw').style.opacity=sp>0?1:0;
 $('stampw').firstElementChild.style.transform=`rotate(${{3+(1-eo(sp))*-10}}deg) scale(${{lerp(1.35,1,eo(sp))}})`;
 $('stampw').firstElementChild.style.opacity=Math.min(1,sp*3);
 const pp=p(t,A.s2.postmark,0.7); const pm=$('pm');
 pm.style.opacity=lerp(0,.72,Math.min(1,pp*1.4)); pm.style.animation='none';
 pm.style.transform=`rotate(${{lerp(-24,-14,eo(pp))}}deg) scale(${{lerp(1.5,1,eo(pp))}})`; pm.style.filter=`blur(${{(1-eo(pp))*3}}px)`;
 rise($('addr'),eo(p(t,A.s2.addr,0.6)),20);
 const txt="Zepto, Razorpay, Swiggy"; const n=Math.round(txt.length*eio(p(t,A.s2.type0,A.s2.type1-A.s2.type0)));
 const q=$('q'); q.value=txt.slice(0,n);
 if(!measure){{measure=document.createElement('span');measure.style.cssText='position:absolute;visibility:hidden;white-space:pre;font-family:"Source Serif 4",Georgia,serif;font-size:1.3rem';document.body.appendChild(measure)}}
 // caret
 const car=$('caret'); const showCar=t>A.s2.type0-0.3 && t<A.s2.press && (Math.floor(t*2.2)%2===0||t<A.s2.type1);
 car.style.display=showCar?'block':'none';
 // measure at zoom
 measure.className='';measure.style.zoom=1.3;measure.textContent=q.value||'';
 car.style.left=(measure.getBoundingClientRect().width/1.3+4)+'px';
 const pr=Math.sin(Math.PI*p(t,A.s2.press,0.28)); const btn=$('btn');
 btn.style.transform=`scale(${{1-.04*pr}})`;
 const on=t>A.s2.press-0.02; btn.style.background=on?'#B3301B':''; btn.style.borderColor=on?'#B3301B':'';
 btn.style.boxShadow=on?'0 8px 20px -10px rgba(179,48,27,.7)':'';
 // ledger
 const lb=$('ledgerblk'); const lOut=1-eio(p(t,A.s3.out0,A.s3.out1-A.s3.out0));
 lb.style.display=(t<A.s2.out1)?'none':'block'; lb.style.opacity=lOut*eio(p(t,A.s2.out1,0.4));
 rise($('lh'),eo(p(t,A.s3.head,0.6)),24);
 const rows=$('rows').children;
 for(let i=0;i<3;i++){{const v=eo(p(t,A.s3.row0+i*A.s3.rowStep,0.5));rows[i].style.opacity=v;rows[i].style.transform=`translateY(${{(1-v)*22}}px)`;
   rows[i].querySelector('.w').style.backgroundSize=(eio(p(t,A.s3.wash0+i*A.s3.washStep,0.5))*100)+'% 100%'}}
 lb.querySelector('.ledger-cap').style.opacity=eo(p(t,A.s3.row0-0.2,0.5));
 lb.querySelector('thead').style.opacity=eo(p(t,A.s3.row0-0.2,0.5));
 // S4
 const s4=$('s4'); const o4=1-eio(p(t,A.s4.out0,A.s4.out1-A.s4.out0));
 s4.style.opacity=(t>=A.s4.head-0.05&&t<A.s4.out1)?o4:0;
 rise($('h4'),eo(p(t,A.s4.head,0.6)),24); rise($('sub4'),eo(p(t,A.s4.head+0.3,0.6)),16);
 const nv=eo(p(t,A.s4.note,0.7)); $('note').style.opacity=nv; $('note').style.transform=`translateY(${{(1-nv)*40}}px) rotate(-1deg)`;
 const cs=$('bq').querySelectorAll('.c'); const total=cs.length; const k=Math.round(total*p(t,A.s4.type0,A.s4.type1-A.s4.type0));
 cs.forEach((c,i)=>c.style.visibility=i<k?'visible':'hidden');
 // mark washes: when typed past end of that mark
 const marks=$('bq').querySelectorAll('mark'); let idx=0;
 marks.forEach(m=>{{const len=m.querySelectorAll('.c').length;const end=idx+len;const done=(end)/total; const tEnd=A.s4.type0+done*(A.s4.type1-A.s4.type0);
   const w=eio(p(t,tEnd-0.05,0.5)); m.style.backgroundSize=(w*100)+'% 100%';
   const nn=$('bq').querySelector('.n[data-n="'+m.dataset.n+'"]'); const nvv=eb(p(t,tEnd+0.1,0.35)); nn.style.opacity=p(t,tEnd+0.1,0.2); nn.style.transform=`scale(${{lerp(.4,1,nvv)}})`;
   idx=end+0}});
 // note: counts ignore spaces between marks (they're .c spans too, so idx stays consistent only partially)
 $('f1').style.opacity=eo(p(t,A.s4.check,0.4)); $('f2').style.opacity=eo(p(t,A.s4.check+0.3,0.4));
 const f1=$('f1');f1.style.transform=`translateY(${{(1-eo(p(t,A.s4.check,0.4)))*10}}px)`;$('f2').style.transform=`translateY(${{(1-eo(p(t,A.s4.check+0.3,0.4)))*10}}px)`;
 // S5
 const s5=$('s5'); s5.style.opacity=t>=A.s5.bg0?eio(p(t,A.s5.m0-0.3,0.4)):0;
 const lis5=$('route').children; for(let i=0;i<4;i++){{const v=eo(p(t,A.s5.m0+i*A.s5.mStep,0.5));lis5[i].style.opacity=v;lis5[i].style.transform=`translateY(${{(1-v)*18}}px)`}}
 // route dashed line fade
 rise($('big'),eo(p(t,A.s5.big,0.8)),30); rise($('tag'),eo(p(t,A.s5.big+0.35,0.7)),16); rise($('cta'),eo(p(t,A.s5.btn,0.7)),16);
}}
window.render=render;
</script></body></html>'''
open('video.html','w').write(html)
