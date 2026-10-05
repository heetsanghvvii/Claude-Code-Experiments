import numpy as np, json, wave
SR=44100; tl=json.load(open('timeline.json')); D=tl['dur']; N=int(SR*(D+1.5))
rng=np.random.default_rng(7)
def hz(m): return 440*2**((m-69)/12)
def env(n,a,r,curve=3):
    t=np.arange(n)/SR; e=np.minimum(1,t/a)*np.exp(-t*curve/ max(r,1e-3)); return e
def add(buf,t0,x,g=1.0):
    i=int(t0*SR); j=min(len(buf),i+len(x))
    if i<len(buf): buf[i:j]+=x[:j-i]*g
def pluck(m,dur=1.6,bright=1.0):
    n=int(SR*dur); t=np.arange(n)/SR; f=hz(m)
    x=sum(a*np.sin(2*np.pi*f*k*t)*np.exp(-t*(2.2+k*1.6)) for k,a in [(1,1),(2,.35*bright),(3,.15*bright),(4,.06)])
    x*=np.minimum(1,t/0.004); return x
def bell(m,dur=2.5):
    n=int(SR*dur); t=np.arange(n)/SR; f=hz(m)
    x=np.sin(2*np.pi*f*t)*np.exp(-t*1.6)+.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*3.5)+.25*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*6)
    return x*np.minimum(1,t/0.003)
def pad(ms,dur):
    n=int(SR*dur); t=np.arange(n)/SR; x=np.zeros(n)
    for m in ms:
        for det in (-.07,0,.07):
            f=hz(m)*2**(det/12); x+=np.sin(2*np.pi*f*t+rng.random()*6)+.3*np.sin(2*np.pi*2*f*t)
    e=np.minimum(1,t/1.2)*np.minimum(1,(dur-t)/1.5)
    return x*e/len(ms)/4
def noise_band(n,lo,hi):
    x=rng.standard_normal(n); X=np.fft.rfft(x); f=np.fft.rfftfreq(n,1/SR)
    X*= (f>lo)&(f<hi); return np.fft.irfft(X,n)
def lp(x,fc):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
music=np.zeros(N); sfx=np.zeros(N)
# chords in D major: Dmaj9, Bm9, Gmaj7, A(add) 
chords=[([50,57,61,64,69],[62,66,69,73,76]),([47,54,57,61,66],[62,66,69,71,74]),([43,50,55,59,66],[62,67,71,74,78]),([45,52,57,61,64],[61,64,69,73,76])]
bar=5.25
for i,(pm,arp) in enumerate(chords):
    t0=i*bar
    add(music,t0,pad(pm,bar+1.6),1.0)
    beat=0.4375  # 8ths at ~137bpm: slower feel via 8th = bar/12
    step=bar/12
    pat=[0,2,4,2,3,1,4,2,3,1,2,0]
    for k,pi in enumerate(pat):
        tt=t0+0.15+k*step
        if tt<D+0.5:
            m=arp[pi]; add(music,tt,pluck(m,1.8),0.16 if k%3 else 0.22)
    # soft bass
    n=int(SR*3.5); t=np.arange(n)/SR; b=np.sin(2*np.pi*hz(pm[0]-12)*t)*np.exp(-t*.9)*np.minimum(1,t/.02)
    add(music,t0,b,0.34)
# final resolve chord bell at big reveal
for m in (62,69,74,78): add(music,tl['s5']['big'],bell(m,3.2),0.07)
# sfx
def thud(t0,g=1.0,f0=78):
    n=int(SR*.7); t=np.arange(n)/SR; x=np.sin(2*np.pi*(f0*np.exp(-t*6)+f0*.55)*t)*np.exp(-t*7)
    x+=lp(noise_band(n,200,2500),1200)*np.exp(-t*40)*.5
    add(sfx,t0,x,g)
thud(tl['s1']['stamp'],.9,74); thud(tl['s2']['stamp'],.45,82); thud(tl['s2']['postmark'],.6,70)
def whoosh(t0,d,g):
    n=int(SR*d); t=np.arange(n)/SR; x=lp(noise_band(n,300,4000),2500)*np.sin(np.pi*t/d)**2
    add(sfx,t0,x,g)
for a,d in [(tl['s1']['out0'],.9),(tl['s2']['out0'],.8),(tl['s3']['out0'],.9),(tl['s4']['out0'],.9)]: whoosh(a,d,.07)
def tick(t0,g=.05):
    n=int(SR*.03); t=np.arange(n)/SR; x=lp(noise_band(n,1500,5000),3500)*np.exp(-t*160); add(sfx,t0,x,g)
# typing ticks
txt=23
for k in range(txt):
    p=(k+1)/txt; a=tl['s2']['type0']; b=tl['s2']['type1']
    # inverse of ease in-out cubic
    x=p; tt=(x/4)**(1/3) if x<.5 else 1-((1-x)*2)**(1/3)/2
    tick(a+tt*(b-a)+rng.random()*.01,.035)
n4=150
for k in range(0,n4,2):
    a=tl['s4']['type0']; b=tl['s4']['type1']; p=(k+1)/n4
    tt=(p/4)**(1/3) if p<.5 else 1-((1-p)*2)**(1/3)/2
    tick(a+tt*(b-a),.025)
# click on button
n=int(SR*.05); t=np.arange(n)/SR; add(sfx,tl['s2']['press'],np.sin(2*np.pi*1900*t)*np.exp(-t*120)*.15+lp(noise_band(n,800,6000),4000)*np.exp(-t*100)*.2,.5)
# ledger row chimes, D pentatonic
for i,m in enumerate([81,85,88]): add(sfx,tl['s3']['row0']+i*tl['s3']['rowStep'],bell(m,1.8),0.05)
# approve chime
add(sfx,tl['s4']['check'],bell(86,2.2),.07); add(sfx,tl['s4']['check']+.12,bell(90,2.2),.05)
# route marks
for i,m in enumerate([74,78,81,86]): add(sfx,tl['s5']['m0']+i*tl['s5']['mStep'],bell(m,1.5),.05)
add(sfx,tl['s5']['btn'],bell(93,2),.035)
# pile list soft taps
for i in range(6):
    t0=tl['s1']['list0']+i*tl['s1']['listStep']; n=int(SR*.12); t=np.arange(n)/SR
    add(sfx,t0,np.sin(2*np.pi*hz(50+[0,2,4,7,9,12][i])*t)*np.exp(-t*30)*.05,1)
# reverb
ir_n=int(SR*2.2); t=np.arange(ir_n)/SR; ir=lp(rng.standard_normal(ir_n),5000)*np.exp(-t*2.6); ir[0]=0
def reverb(x,wet):
    L=len(x)+ir_n; y=np.fft.irfft(np.fft.rfft(x,L*1)*np.fft.rfft(ir,L),L)[:len(x)]
    return x*(1-wet)+y*wet*0.12
music=reverb(music,.45); sfx=reverb(sfx,.3)
mix=music*0.75+sfx*1.0
# fades
t=np.arange(N)/SR; mix*=np.minimum(1,t/0.6)*np.clip((D+1.2-t)/1.6,0,1)
mix=lp(mix,12000)
mix/=np.max(np.abs(mix))/0.85
mix=mix[:int(SR*(D))]
st=np.stack([mix,np.roll(mix,int(SR*.0004))],1)
with wave.open('audio.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
print('ok',np.sqrt((mix**2).mean()))
