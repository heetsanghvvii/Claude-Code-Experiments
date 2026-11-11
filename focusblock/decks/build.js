const pptxgen = require('pptxgenjs');
const CH='1C1C1E', ST='C9C7C3', OW='F5F4F1', SA='FF8A1F', DK='8F4600', MID='3A3A3D';
const HF='Cambria', BF='Calibri';
function base(){const p=new pptxgen();p.layout='LAYOUT_WIDE';return p;}
function title(s,t,dark){s.background={color:dark?CH:OW};
 s.addText(t,{x:0.6,y:0.4,w:12.1,h:0.9,fontFace:HF,fontSize:36,bold:true,color:dark?OW:CH,margin:0,isTextBox:true});}
function card(p,s,x,y,w,h,head,body,dark){
 s.addShape(p.ShapeType.roundRect,{x,y,w,h,fill:{color:dark?MID:'FFFFFF'},line:{color:dark?MID:ST,width:0.75},rectRadius:0.1});
 s.addText(head,{x:x+0.25,y:y+0.15,w:w-0.5,h:0.5,fontFace:HF,fontSize:20,bold:true,color:dark?SA:DK,margin:0,isTextBox:true,valign:'top'});
 s.addText(body,{x:x+0.25,y:y+0.7,w:w-0.5,h:h-0.85,fontFace:BF,fontSize:14,color:dark?OW:CH,margin:0,isTextBox:true,valign:'top'});}
function big(s,x,y,w,num,lab,dark){
 s.addText(num,{x,y,w,h:1.0,fontFace:HF,fontSize:48,bold:true,color:SA,margin:0,isTextBox:true});
 s.addText(lab,{x,y:y+1.0,w,h:0.8,fontFace:BF,fontSize:14,color:dark?ST:MID,margin:0,isTextBox:true,valign:'top'});}
function cover(p,t,sub,note){const s=p.addSlide();s.background={color:CH};
 s.addShape(p.ShapeType.ellipse,{x:9.3,y:1.4,w:3.6,h:3.6,fill:{color:SA},line:{color:SA}});
 s.addShape(p.ShapeType.ellipse,{x:10.2,y:2.3,w:1.8,h:1.8,fill:{color:CH},line:{color:CH}});
 s.addText('nope',{x:0.6,y:1.7,w:8,h:1.6,fontFace:HF,fontSize:96,bold:true,color:OW,margin:0,isTextBox:true});
 s.addText('Put it down.',{x:0.6,y:3.3,w:8,h:0.7,fontFace:HF,fontSize:30,italic:true,color:SA,margin:0,isTextBox:true});
 s.addText(t,{x:0.6,y:4.6,w:8.5,h:0.6,fontFace:BF,fontSize:22,bold:true,color:OW,margin:0,isTextBox:true});
 s.addText(sub,{x:0.6,y:5.3,w:8.5,h:0.8,fontFace:BF,fontSize:16,color:ST,margin:0,isTextBox:true,valign:'top'});
 s.addNotes(note||'');}
function table(p,s,rows,y,colW){
 const hdr=rows[0].map(t=>({text:t,options:{bold:true,color:OW,fill:{color:CH},fontFace:BF,fontSize:14}}));
 const body=rows.slice(1).map((r,i)=>r.map(t=>({text:t,options:{color:CH,fill:{color:i%2?OW:'FFFFFF'},fontFace:BF,fontSize:13}})));
 s.addTable([hdr,...body],{x:0.6,y,w:12.1,colW,border:{type:'solid',color:ST,pt:0.5},margin:0.08,valign:'middle'});}

// ================= DECK 1: REVIEW PACK =================
(async()=>{
let p=base(); p.title='nope review pack';
cover(p,'Review pack for the MD','Everything that needs your yes, your input or your eyes. Wed 11 Nov 2026.');
let s=p.addSlide(); title(s,'Where we stand');
big(s,0.6,1.7,3,'Rs 0','revenue today');
big(s,4.0,1.7,3,'0','customers, nothing tested on a real phone yet');
big(s,7.4,1.7,2.6,'1,999','price in Rs, locked');
big(s,10.3,1.7,2.4,'14 days','plan to prove tap works and a stranger pays');
card(p,s,0.6,4.1,12.1,2.3,'CEO verdict','Not profitable yet and cannot be by tomorrow. Fastest honest path: prove the tap in 7 days, prove a stranger pays in 14 days, spend at most Rs 8,600 of your Rs 10,000 to find out.');
s=p.addSlide(); title(s,'Your 5 approvals');
table(p,s,[['#','Approval','Cost','By'],
['A1','Pay the print order after Instinct shows the quote (2 bodies, 3 caps, 1 coupon strip, 2 old pucks)','Up to Rs 1,500','Now'],
['A2','Domain getnope.in, 25 mm NTAG213 stickers, felt pads, bumpers','Up to Rs 1,500','Now'],
['A3','Rs 1,000 Meta hook test, only if the phone test passes and page is waitlist only','Rs 1,000','Fri 13 Nov'],
['A4','Before customer money: read employment contract, business bank or UPI account, one CA call','About Rs 1,000','Account by Tue 17 Nov'],
['A5','Second Rs 5,000 (pilot kit, CA call, Play fee) only if Gate G1 passes','Rs 4,600','Mon 16 Nov']],1.6,[0.7,7.2,2.0,2.2]);
s.addNotes('Ads beyond the Rs 10,000 (Step 2, Rs 3,000 to 4,000) need a fresh yes on Fri 20 Nov.');
s=p.addSlide(); title(s,'Questions only you can answer');
card(p,s,0.6,1.6,3.9,2.4,'Seller address','Business address or home address on the site and invoices? Needed for legal pages.');
card(p,s,4.7,1.6,3.9,2.4,'WhatsApp number','Business number for support and the waitlist button.');
card(p,s,8.8,1.6,3.9,2.4,'Business UPI or QR','No personal UPI ID. Needed before any payment page opens.');
card(p,s,0.6,4.2,3.9,2.4,'Employment contract','Read it (20 min). Check side business and IP clauses before any customer money.');
card(p,s,4.7,4.2,3.9,2.4,'Trademark search','Founder runs it. Needs OTP login, fee Rs 4,500 per class.');
card(p,s,8.8,4.2,3.9,2.4,'iPhone timing','Android first. Apple needs a paid developer account, decide after Gate G1.');
s=p.addSlide(); title(s,'Website: fill before going live');
s.addText([
{text:'Site is built but not published. Waitlist mode, no payments.',options:{bold:true,breakLine:true}},
{text:'Placeholders to fill: WhatsApp number, business UPI and QR image (upi-qr.png missing), Meta Pixel ID, form backend, domain, founder name, seller details.',options:{bullet:true,breakLine:true}},
{text:'Legal pages written: privacy, refund, shipping, terms. Need seller details inserted.',options:{bullet:true,breakLine:true}},
{text:'Do not quote Brick price in any ad. Sources conflict (Rs 5,700 vs US$59).',options:{bullet:true,breakLine:true}},
{text:'Never claim it cannot be bypassed.',options:{bullet:true}}],
{x:0.6,y:1.6,w:7.2,h:4.5,fontFace:BF,fontSize:18,color:CH,paraSpaceAfter:10,margin:0,isTextBox:true,valign:'top'});
s.addImage({path:'../landing/og-image.png',x:8.0,y:1.8,w:4.7,h:2.47,sizing:{type:'contain',w:4.7,h:2.47}});
s=p.addSlide(); title(s,'Phone test today (Gate G0)');
card(p,s,0.6,1.6,5.9,4.7,'What to do','Install the standalone APK on 3 phones (Samsung, Xiaomi or Realme, one on Android 13+). Pair a sticker, tap to lock, tap to unlock. Try through the 2.4 mm printed skin. Note the restricted settings step on Android 13+.');
card(p,s,6.8,1.6,5.9,4.7,'Pass means','Tap reads reliably on all 3 phones. Setup completes without help. Then Rs 1,000 hook test and G1 funding unlock. Fail means stop and fix before spending.');
s=p.addSlide(); title(s,'Top risks');
table(p,s,[['Risk','Why it matters','Test'],
['Tap unreliable on real phones or through case','If it fails nothing else matters','Wed 11 and Mon 16 Nov'],
['Android 13+ restricted settings wall','Can kill activation of the first 50','Wed 11 Nov'],
['Ad cost above Rs 725 per order','Break-even ceiling, scale target Rs 400','Fri 20 Nov first number'],
['Play Store policy on accessibility','Strict mode must stay off in Play builds','After G1'],
['Legal: contract, GST, trademark','Blocks taking customer money','Before 18 Nov']],1.6,[4.6,4.6,2.9]);
s=p.addSlide(); title(s,'Next 14 days');
table(p,s,[['Date','Milestone'],
['Wed 11 Nov','Gate G0: tap test on 3 phones'],
['Thu 12 Nov','Free demand signals start'],
['Fri 13 Nov','Rs 1,000 Meta waitlist test, if G0 passed'],
['Mon 16 Nov','Gate G1, second Rs 5,000 decision'],
['Wed 18 Nov','Earliest Rs 199 refundable reservations'],
['Fri 20 Nov','First real ad cost number, Step 2 decision']],1.6,[3.0,9.1]);
await p.writeFile({fileName:'nope_review_pack.pptx'});

// ================= DECK 2: FRIEND DECK =================
p=base(); p.title='How nope was built';
cover(p,'How I built a hardware startup with AI','A pre-launch case study. Idea to product, brand, app and plan in days.');
s=p.addSlide(); title(s,'The idea',true);
s.addText('Phones are built to be hard to put down. nope is a palm-sized puck. Tap your phone on it and your distracting apps lock. Tap again to unlock.',{x:0.6,y:1.6,w:6.2,h:2.2,fontFace:BF,fontSize:22,color:OW,margin:0,isTextBox:true,valign:'top'});
s.addText('Rs 1,999. One time. No subscription. 30 day refund.',{x:0.6,y:4.2,w:6.2,h:0.9,fontFace:HF,fontSize:24,bold:true,color:SA,margin:0,isTextBox:true,valign:'top'});
s.addImage({path:'../product/renders/nope_threequarter.png',x:7.3,y:1.3,w:5.4,h:5.0,sizing:{type:'contain',w:5.4,h:5.0}});
s=p.addSlide(); title(s,'Copy the model, not the brand');
card(p,s,0.6,1.6,3.9,3.0,'Proven','A US brand sells a similar block. Strong demand and a viral reel prove people want friction.');
card(p,s,4.7,1.6,3.9,3.0,'Gap','Reel comments: too pricey for India, and "it is just an NFC chip". Local price and local story win.');
card(p,s,8.8,1.6,3.9,3.0,'Move','Own name, own look, own price. Android first, because India is Android.');
s.addText('Every claim about competitors is marked as a claim, not a fact.',{x:0.6,y:5.2,w:12,h:0.6,fontFace:BF,fontSize:16,italic:true,color:MID,margin:0,isTextBox:true});
s=p.addSlide(); title(s,'What got built');
card(p,s,0.6,1.6,3.9,2.4,'Android app','Expo and React Native. Native Kotlin blocker. NFC pairing, rescue code if locked out, setup doctor.');
card(p,s,4.7,1.6,3.9,2.4,'The product','3D printed pebble case 64 x 16 mm, bayonet cap, hidden NFC sticker. Designed in code.');
card(p,s,8.8,1.6,3.9,2.4,'Brand and site','Charcoal and saffron. Name, logo, tagline, waitlist site, legal pages, ad creatives.');
card(p,s,0.6,4.2,3.9,2.4,'Finance','Unit economics workbook. About Rs 977 per order before ads.');
card(p,s,4.7,4.2,3.9,2.4,'Legal and ops','India compliance checklist, support macros, shipping and refund playbook.');
card(p,s,8.8,4.2,3.9,2.4,'Strategy','Go to market, 14 day OKRs, risk register, kill criteria.');
s=p.addSlide(); title(s,'An AI C-suite, one founder',true);
s.addText('CEO',{x:5.9,y:1.5,w:1.5,h:0.7,fontFace:HF,fontSize:24,bold:true,color:CH,align:'center',valign:'middle',margin:0,isTextBox:true});
s.addShape(p.ShapeType.roundRect,{x:5.9,y:1.5,w:1.5,h:0.7,fill:{color:SA},line:{color:SA},rectRadius:0.1});
s.addText('CEO',{x:5.9,y:1.5,w:1.5,h:0.7,fontFace:HF,fontSize:22,bold:true,color:CH,align:'center',valign:'middle',margin:0,isTextBox:true});
const roles=['CTO','CFO','CMO','CPO','CLO','COO','CCO','CSO','Creative'];
roles.forEach((r,i)=>{const x=0.6+i*1.37;
 s.addShape(p.ShapeType.roundRect,{x,y:3.0,w:1.25,h:0.8,fill:{color:MID},line:{color:ST,width:0.5},rectRadius:0.1});
 s.addText(r,{x,y:3.0,w:1.25,h:0.8,fontFace:BF,fontSize:15,bold:true,color:OW,align:'center',valign:'middle',margin:0,isTextBox:true});});
s.addText('Each role is an AI agent with a brief. They report to the CEO agent, who reports to me. I make the final call on price, name, colours and spend.',{x:0.6,y:4.5,w:12,h:1.2,fontFace:BF,fontSize:20,color:OW,margin:0,isTextBox:true,valign:'top'});
s.addText('The agent personas and numbers are hypotheses to test, not market data.',{x:0.6,y:5.9,w:12,h:0.5,fontFace:BF,fontSize:14,italic:true,color:ST,margin:0,isTextBox:true});
s=p.addSlide(); title(s,'Validate before spending');
card(p,s,0.6,1.6,3.9,3.4,'Test the tap','3 real phones first. If the tap fails, stop. Cost: about Rs 0.');
card(p,s,4.7,1.6,3.9,3.4,'Test demand','Rs 1,000 waitlist ad. Free signals first. No payment page until legal is clear.');
card(p,s,8.8,1.6,3.9,3.4,'Then scale','Break-even ad cost per order about Rs 725. Target Rs 400. Written kill criteria if it misses.');
s.addText('Total planned spend to learn the truth: under Rs 10,000.',{x:0.6,y:5.5,w:12,h:0.7,fontFace:HF,fontSize:24,bold:true,color:DK,margin:0,isTextBox:true});
s=p.addSlide(); title(s,'Honest status',true);
big(s,0.6,1.7,3,'Built','app, case design, brand, site, plan, finance model',true);
big(s,4.6,1.7,3,'Next','phone test, print order, waitlist ad',true);
big(s,8.6,1.7,4,'Not yet','customers, revenue, proof it works on real phones',true);
s.addText('No fake traction. The point is how fast a founder plus AI can get from idea to a testable business, with the risks written down.',{x:0.6,y:4.4,w:12,h:1.4,fontFace:BF,fontSize:22,color:OW,margin:0,isTextBox:true,valign:'top'});
await p.writeFile({fileName:'nope_how_i_built_it.pptx'});
})();
