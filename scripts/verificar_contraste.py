"""Calcula el contraste WCAG 2.x de los tokens de color (app/globals.css). Uso: python3 scripts/verificar_contraste.py"""
import json
L = {
'canvas':'#F3F7FA','surface':'#FAFCFD','surface-raised':'#FFFFFF','surface-sunken':'#E7EEF3','border':'#D2DDE6','border-strong':'#A7BACA',
'ink':'#10222F','ink-muted':'#40586A','ink-faint':'#586E7F','accent':'#1B4965','accent-hover':'#143A52','accent-tint':'#CAE9FF','on-accent':'#FFFFFF',
'danger':'#B42318','warning':'#8A5A00','success':'#17754A',
'nivel-1':'#BEE9E8','nivel-2':'#62B6CB','nivel-3':'#B38F24','nivel-4':'#B2561D','nivel-5':'#7E2A27',
'curva-1':'#2B7BB9','curva-2':'#B03A7D','curva-3':'#3F8A4F','curva-4':'#6B4FB0','curva-5':'#55697A'}
D = {
'canvas':'#0B1620','surface':'#102030','surface-raised':'#152A3B','surface-sunken':'#08111A','border':'#1F3547','border-strong':'#35536B',
'ink':'#E6F1F8','ink-muted':'#A6BFCF','ink-faint':'#8AA3B5','accent':'#5FA8D3','accent-hover':'#7DBBE0','accent-tint':'#1B4965','on-accent':'#0B1620',
'danger':'#F28B82','warning':'#E3B341','success':'#5FC48A',
'nivel-1':'#27596A','nivel-2':'#2F7487','nivel-3':'#8A7A2E','nivel-4':'#C9732F','nivel-5':'#F08A75',
'curva-1':'#6FB1E6','curva-2':'#E07DB4','curva-3':'#78C58A','curva-4':'#A794E8','curva-5':'#A9B9C6'}
def rgb(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def lum(c):
    def f(v):
        v/=255; return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    r,g,b=map(f,c); return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=lum(a),lum(b)
    if la<lb: la,lb=lb,la
    return (la+0.05)/(lb+0.05)
def mix(fg,bg,a): return tuple(round(fg[i]*a+bg[i]*(1-a)) for i in range(3))
out={}
for name,T in (('claro',L),('oscuro',D)):
    bgs=['canvas','surface','surface-sunken']
    r={}
    for k in ('ink','ink-muted','ink-faint'):
        r[k]=round(min(cr(rgb(T[k]),rgb(T[b])) for b in bgs),2)
    r['accent/canvas']=round(cr(rgb(T['accent']),rgb(T['canvas'])),2)
    r['on-accent/accent']=round(cr(rgb(T['on-accent']),rgb(T['accent'])),2)
    for k in ('danger','warning','success'):
        r[k]=round(min(cr(rgb(T[k]),rgb(T[b])) for b in bgs),2)
    # badge: ink over nivel-N 20% sobre surface
    bad=[]
    for n in range(1,6):
        bgm=mix(rgb(T[f'nivel-{n}']),rgb(T['surface']),0.2)
        bad.append(round(cr(rgb(T['ink']),bgm),2))
    r['ink/badge nivel 1..5']=bad
    r['lum nivel 1..5']=[round(lum(rgb(T[f'nivel-{n}'])),3) for n in range(1,6)]
    r['paso minimo entre niveles']=round(min(cr(rgb(T[f'nivel-{n}']),rgb(T[f'nivel-{n+1}'])) for n in range(1,5)),2)
    r['nivel-1/canvas']=round(cr(rgb(T['nivel-1']),rgb(T['canvas'])),2)
    r['nivel-2/canvas']=round(cr(rgb(T['nivel-2']),rgb(T['canvas'])),2)
    r['border-strong/canvas (UI 3:1)']=round(cr(rgb(T['border-strong']),rgb(T['canvas'])),2)
    r['curva min/surface']=round(min(cr(rgb(T[f'curva-{n}']),rgb(T['surface'])) for n in range(1,6)),2)
    r['ink-faint sobre surface-raised']=round(cr(rgb(T['ink-faint']),rgb(T['surface-raised'])),2)
    r['ink-muted sobre surface-raised']=round(cr(rgb(T['ink-muted']),rgb(T['surface-raised'])),2)
    out[name]=r
print(json.dumps(out,indent=1,ensure_ascii=False))
