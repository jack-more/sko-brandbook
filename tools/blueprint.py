#!/usr/bin/env python3
"""2D blueprint of a molecule for the Isometrica references.
usage: blueprint.py OUT.jpg a.sdf [b.sdf ...]      # blends: constituents side by side
       blueprint.py OUT.jpg --helix SEQUENCE        # peptide backbone as an alpha helix from sequence
PCA projection of heavy atoms, black-on-white, same look as img/ref2/mol/*.jpg"""
import sys,math
from PIL import Image, ImageDraw
def parse(path):
    L=open(path,errors='ignore').read().split('\n'); atoms=[];bonds=[]
    if any('V3000' in l for l in L[:6]):
        mode=None
        for l in L:
            s=l.strip()
            if s.startswith('M  V30 BEGIN ATOM'): mode='a';continue
            if s.startswith('M  V30 END ATOM'): mode=None;continue
            if s.startswith('M  V30 BEGIN BOND'): mode='b';continue
            if s.startswith('M  V30 END BOND'): mode=None;continue
            if mode=='a': p=s.split(); atoms.append((p[3],float(p[4]),float(p[5]),float(p[6])))
            elif mode=='b': p=s.split(); bonds.append((int(p[4])-1,int(p[5])-1,int(p[3])))
    else:
        na=int(L[3][:3]); nb=int(L[3][3:6])
        for l in L[4:4+na]: atoms.append((l[31:34].strip(),float(l[0:10]),float(l[10:20]),float(l[20:30])))
        for l in L[4+na:4+na+nb]: bonds.append((int(l[0:3])-1,int(l[3:6])-1,int(l[6:9])))
    return atoms,bonds
def project(atoms,bonds):
    keep=[i for i,a in enumerate(atoms) if a[0]!='H']; idx={o:n for n,o in enumerate(keep)}
    P=[(atoms[i][1],atoms[i][2],atoms[i][3]) for i in keep]; n=len(P)
    cx=sum(p[0] for p in P)/n; cy=sum(p[1] for p in P)/n; cz=sum(p[2] for p in P)/n
    X=[(p[0]-cx,p[1]-cy,p[2]-cz) for p in P]
    C=[[sum(x[i]*x[j] for x in X) for j in range(3)] for i in range(3)]
    mv=lambda v:[sum(C[i][j]*v[j] for j in range(3)) for i in range(3)]
    def norm(v): l=math.sqrt(sum(a*a for a in v)) or 1; return [a/l for a in v]
    v1=norm([1,.3,.2])
    for _ in range(60): v1=norm(mv(v1))
    v2=norm([.2,1,.3])
    for _ in range(60): v2=mv(v2); d=sum(a*b for a,b in zip(v2,v1)); v2=norm([a-d*b for a,b in zip(v2,v1)])
    pts=[(sum(a*b for a,b in zip(x,v1)),sum(a*b for a,b in zip(x,v2))) for x in X]
    B=[(idx[a],idx[b],o) for a,b,o in bonds if a in idx and b in idx]
    return pts,B,[atoms[i][0] for i in keep]
def helix(seq):
    # alpha helix backbone: 3.6 residues/turn, 1.5 A rise, radius 2.3 A; N-CA-C per residue, side chain stub on CA
    atoms=[];bonds=[];prev=None
    for i,ch in enumerate(seq):
        for k,(el,ro,dz) in enumerate([('N',2.3,0.0),('C',2.3,0.5),('C',2.3,1.0)]):
            th=(i*3+k)*(2*math.pi/10.8); z=i*1.5+dz
            atoms.append((el,ro*math.cos(th),ro*math.sin(th),z)); j=len(atoms)-1
            if prev is not None: bonds.append((prev,j,1))
            prev=j
            if k==1 and ch!='G':  # side chain stub from CA, pointing outward
                atoms.append(('C',3.9*math.cos(th),3.9*math.sin(th),z)); bonds.append((j,len(atoms)-1,1))
                if ch in 'KREDQNYWH': atoms.append(('N' if ch in 'KRQNH' else 'O',5.3*math.cos(th),5.3*math.sin(th),z)); bonds.append((len(atoms)-2,len(atoms)-1,1))
            if k==2: atoms.append(('O',3.5*math.cos(th+.3),3.5*math.sin(th+.3),z)); bonds.append((j,len(atoms)-1,2))
    return atoms,bonds
def draw_all(groups,out,W=1600,H=1600):
    # groups: list of (pts,B,els); laid out side by side, each scaled to the same height
    g=len(groups); pad=W*0.06; cellw=(W-pad*(g+1))/g
    im=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(im)
    for gi,(pts,B,els) in enumerate(groups):
        xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
        # rotate so the long axis is vertical when there are several groups
        if g>1 and (max(xs)-min(xs))>(max(ys)-min(ys)): pts=[(-y,x) for x,y in pts]; xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
        s=min(cellw/((max(xs)-min(xs)) or 1),(H*0.84)/((max(ys)-min(ys)) or 1))
        ox=pad+gi*(cellw+pad)+cellw/2-(max(xs)+min(xs))/2*s; oy=H/2-(max(ys)+min(ys))/2*s
        n=len(pts); lw=max(3,int(14-n/40)); r=max(4,int(16-n/40))
        for a,b,o in B:
            x1,y1=pts[a][0]*s+ox,pts[a][1]*s+oy; x2,y2=pts[b][0]*s+ox,pts[b][1]*s+oy
            d.line((x1,y1,x2,y2),fill=(40,40,60),width=lw)
            if o==2:
                dx,dy=x2-x1,y2-y1; L=math.hypot(dx,dy) or 1; nx,ny=-dy/L*lw*1.6,dx/L*lw*1.6
                d.line((x1+nx,y1+ny,x2+nx,y2+ny),fill=(40,40,60),width=max(2,lw//2))
        for (x,y),e in zip(pts,els):
            X,Y=x*s+ox,y*s+oy; col={'N':(30,60,200),'O':(200,40,40),'S':(200,160,0),'CU':(190,110,40),'P':(220,120,0)}.get(e.upper(),(60,60,80))
            d.ellipse((X-r,Y-r,X+r,Y+r),fill=col)
    im.save(out,quality=92)
if __name__=='__main__':
    out=sys.argv[1]
    if sys.argv[2]=='--helix':
        a,b=helix(sys.argv[3]); keep=list(range(len(a)))
        # oblique view so the coils read: axis along x, a little of the radial depth folded in
        pts=[(at[3]*0.95+at[1]*0.35,at[2]+at[1]*0.45) for at in a]
        draw_all([(pts,[(i,j,o) for i,j,o in b],[at[0] for at in a])],out)
    else: draw_all([project(*parse(f)) for f in sys.argv[2:]],out)
    print('wrote',out)
