"""Contour ink tracing (exp branches only), second approach.
Straight structural lines (LSD, merged, snapped, joined at corners) plus
skeletonised XDoG contours simplified to polylines, all at one steady pen weight.
Foliage (green, saturated areas) is left out, as in a measured drawing."""
import sys, math
import numpy as np, cv2
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize
INK=(22,22,22)

def lines_of(g, W):
    H=g.shape[0]
    lsd=cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
    L=lsd.detect(g)[0]
    return [] if L is None else L.reshape(-1,4)

def contrast(gf,W,H,x0,y0,x1,y1):
    n=np.array([y0-y1,x1-x0]);l=np.hypot(*n) or 1;n=n/l*3
    ts=np.linspace(.15,.85,9);xs=x0+(x1-x0)*ts;ys=y0+(y1-y0)*ts
    def s(dx,dy):
        return gf[np.clip((ys+dy).astype(int),0,H-1),np.clip((xs+dx).astype(int),0,W-1)]
    return float(np.abs(s(*n)-s(*-n)).mean())

def merge(items, gap, dang=2.5, drho=3):
    items=sorted(items,key=lambda r:-r[5]); used=[False]*len(items); out=[]
    for i,a in enumerate(items):
        if used[i]: continue
        th=a[0];ux,uy=math.cos(th),math.sin(th);nx,ny=-uy,ux
        rho=a[1]*nx+a[2]*ny; ts=[a[1]*ux+a[2]*uy,a[3]*ux+a[4]*uy];t0,t1=min(ts),max(ts);used[i]=True;cov=a[5]
        ch=True
        while ch:
            ch=False
            for j,b in enumerate(items):
                if used[j]: continue
                d=abs(b[0]-th);d=min(d,math.pi-d)
                if d>math.radians(dang): continue
                if abs(b[1]*nx+b[2]*ny-rho)>drho or abs(b[3]*nx+b[4]*ny-rho)>drho: continue
                q=[b[1]*ux+b[2]*uy,b[3]*ux+b[4]*uy]
                if min(q)>t1+gap or max(q)<t0-gap: continue
                t0,t1=min(t0,min(q)),max(t1,max(q));used[j]=True;cov+=b[5];ch=True
        out.append([th,rho*nx+t0*ux,rho*ny+t0*uy,rho*nx+t1*ux,rho*ny+t1*uy,t1-t0,cov])
    return out

def inter(a,b):
    x1,y1,x2,y2=a[:4];x3,y3,x4,y4=b[:4]
    d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4)
    if abs(d)<1e-6: return None
    t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/d
    u=-((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3))/d
    return t,u,(x1+t*(x2-x1),y1+t*(y2-y1))

def trace(src,out,W=1000,min_len=.045,cthr=18,snap=.03,weight=1.5,seed=5,maxn=140):
    rng=np.random.default_rng(seed)
    im=Image.open(src).convert('RGB');w0,h0=im.size;im=im.resize((W,round(h0*W/w0)),Image.LANCZOS)
    g=cv2.cvtColor(np.asarray(im),cv2.COLOR_RGB2GRAY);g=cv2.bilateralFilter(g,9,50,9);H=g.shape[0];gf=g.astype(np.float32)
    raw=[]
    for x0,y0,x1,y1 in lines_of(g,W):
        l=math.hypot(x1-x0,y1-y0)
        if l<10: continue
        raw.append([math.atan2(y1-y0,x1-x0)%math.pi,x0,y0,x1,y1,l])
    m=merge(raw,.035*W)
    segs=[]
    for th,x0,y0,x1,y1,l,cov in m:
        if l<min_len*W or cov/l<.55: continue
        # snap verticals (architectural convention)
        if abs(th-math.pi/2)<math.radians(3):
            mx=(x0+x1)/2;x0=x1=mx
        elif th<math.radians(2) or th>math.pi-math.radians(2):
            my=(y0+y1)/2;y0=y1=my
        c=contrast(gf,W,H,x0,y0,x1,y1)
        if c<cthr: continue
        segs.append([x0,y0,x1,y1,l,c])
    segs.sort(key=lambda s:-s[4]*min(1,s[5]/60)); segs=segs[:maxn]
    # thin crowded parallels
    keep=[]
    for s in segs:
        th=math.atan2(s[3]-s[1],s[2]-s[0])%math.pi;mx,my=(s[0]+s[2])/2,(s[1]+s[3])/2;cr=0
        for k in keep:
            kt=math.atan2(k[3]-k[1],k[2]-k[0])%math.pi;d=abs(kt-th);d=min(d,math.pi-d)
            if d<math.radians(4) and math.hypot((k[0]+k[2])/2-mx,(k[1]+k[3])/2-my)<.025*W+ .3*min(k[4],s[4]): cr+=1
        if cr<2: keep.append(s)
    segs=keep
    # endpoint snapping: extend/trim each end to the nearest crossing line within reach
    R=snap*W
    for i,a in enumerate(segs):
        L=math.hypot(a[2]-a[0],a[3]-a[1])
        for end in (0,1):
            best=None
            for j,b in enumerate(segs):
                if i==j: continue
                r=inter(a,b)
                if not r: continue
                t,u,p=r
                tt=t if end==1 else 1-t
                # where along a the crossing sits relative to this end, in px
                dist=(tt-1)*L
                if not(-R*.6<dist<R): continue
                Lb=b[4]; 
                if not(-R/Lb<u<1+R/Lb): continue
                ang=abs(math.atan2(b[3]-b[1],b[2]-b[0])-math.atan2(a[3]-a[1],a[2]-a[0]))%math.pi
                if min(ang,math.pi-ang)<math.radians(20): continue
                if best is None or abs(dist)<abs(best[0]): best=(dist,p)
            if best:
                if end==0: a[0],a[1]=best[1]
                else: a[2],a[3]=best[1]
    SS=3;cv=Image.new('L',(W*SS,H*SS),0);d=ImageDraw.Draw(cv)
    for x0,y0,x1,y1,l,c in segs:
        L=math.hypot(x1-x0,y1-y0) or 1;ux,uy=(x1-x0)/L,(y1-y0)/L
        o0=4+rng.random()*5;o1=4+rng.random()*5
        d.line([((x0-ux*o0)*SS,(y0-uy*o0)*SS),((x1+ux*o1)*SS,(y1+uy*o1)*SS)],fill=255,width=round(weight*SS))
    a=cv.resize((W,H),Image.LANCZOS);rgba=Image.new('RGBA',(W,H),INK+(0,));rgba.putalpha(a);rgba.save(out,optimize=True)
    return len(segs)
def run(src,out,W=1100,sigma=1.1,p=24,eps=-0.015,minlen=70,weight=1.7,struct=True,veg=80,wig=14):
    im=Image.open(src).convert('RGB');w0,h0=im.size;im=im.resize((W,round(h0*W/w0)),Image.LANCZOS)
    a=np.asarray(im)
    for _ in range(3): a=cv2.bilateralFilter(a,7,60,7)
    a=cv2.pyrMeanShiftFiltering(a,10,22)
    g=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY)
    g=cv2.createCLAHE(2.0,(8,8)).apply(g).astype(np.float32)/255
    g1=cv2.GaussianBlur(g,(0,0),sigma);g2=cv2.GaussianBlur(g,(0,0),sigma*1.6)
    d=(1+p)*g1-p*g2
    ink=(d<eps)
    sk=skeletonize(ink).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(sk,8)
    sk=np.isin(lab,[i for i in range(1,n) if st[i,4]>=minlen]).astype(np.uint8)
    H=sk.shape[0];SS=3
    # texture mask from the unsmoothed image: foliage / gravel are busy, walls are calm
    hsv=cv2.cvtColor(np.asarray(im),cv2.COLOR_RGB2HSV)
    busy=((hsv[...,0]>=22)&(hsv[...,0]<=95)&(hsv[...,1]>38)).astype(np.uint8)
    busy=cv2.dilate(busy,np.ones((7,7),np.uint8))>0
    cv=Image.new('L',(W*SS,H*SS),0);dr=ImageDraw.Draw(cv)
    n,lab,st,_=cv2.connectedComponentsWithStats(sk,8)
    for i in range(1,n):
        m=(lab==i)
        if busy[m].mean()>.6: continue
        cs,_=cv2.findContours(m.astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
        for c in cs:
            ap=cv2.approxPolyDP(c,1.2,True)[:,0,:]
            per=cv2.arcLength(c,True)/2
            if len(ap)/max(per,1)*100>wig: continue
            pts=[(float(x)*SS+SS/2,float(y)*SS+SS/2) for x,y in ap]
            if len(pts)>1: dr.line(pts+[pts[0]],fill=255,width=round(weight*SS),joint='curve')
    if struct:
        import tempfile; tmp=tempfile.mktemp(suffix='.png')
        trace(src,tmp,W=W,min_len=.1,weight=weight,maxn=60)
        s=Image.open(tmp).split()[3].resize((W*SS,H*SS),Image.LANCZOS)
        cv=Image.fromarray(np.maximum(np.asarray(cv),np.asarray(s)))
    al=cv.resize((W,H),Image.LANCZOS)
    o=Image.new('RGBA',(W,H),INK+(0,));o.putalpha(al);o.save(out,optimize=True)
SETTINGS = {'westfall-hillside-house': dict(sigma=.9, eps=-.004, p=30, minlen=45, wig=16)}

def batch():
    import json, os
    meta = json.load(open('assets/ink/meta.json'))
    for folder, src in meta.items():
        run(src, f'assets/ink/{folder}.png', **SETTINGS.get(folder, {}))
        print(folder)

if __name__ == '__main__':
    batch()
