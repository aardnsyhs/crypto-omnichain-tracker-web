"""Compute contrast for ledger surfaces and text tokens without a browser."""
import math
import re
from pathlib import Path


def rgb(value):
    if value.startswith('#'):
        return [int(value[i:i+2], 16) / 255 for i in (1, 3, 5)]
    light, chroma, hue = map(float, re.search(r'oklch\(([^)]+)\)', value)[1].split())
    a, b = chroma * math.cos(math.radians(hue)), chroma * math.sin(math.radians(hue))
    l, m, s = [(light + x*a + y*b)**3 for x,y in [(0.3963377774,0.2158037573),(-0.1055613458,-0.0638541728),(-0.0894841775,-1.291485548)]]
    linear = [4.0767416621*l-3.3077115913*m+0.2309699292*s, -1.2684380046*l+2.6097574011*m-0.3413193965*s, -0.0041960863*l-0.7034186147*m+1.707614701*s]
    return [max(0,min(1,12.92*c if c <= 0.0031308 else 1.055*c**(1/2.4)-0.055)) for c in linear]


def luminance(color):
    return sum(w*(c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4) for c,w in zip(color,[0.2126,0.7152,0.0722]))


def ratio(fg, bg):
    l1,l2=sorted([luminance(fg),luminance(bg)],reverse=True)
    return (l1+0.05)/(l2+0.05)


css=Path('app/globals.css').read_text()
tokens=dict(re.findall(r'--([a-z-]+): (oklch\([^)]+\));',css))
surfaces=['background','card','surface-elevated','surface-nested','popover','secondary','accent']
text={'foreground': (tokens['foreground'], 1), 'foreground/90': (tokens['foreground'],.9), 'muted':(tokens['muted-foreground'],1), 'muted/80':(tokens['muted-foreground'],.8)}
for name,(color,alpha) in text.items():
    results=[]
    for surface in surfaces:
        bg=rgb(tokens[surface]); fg=[alpha*c+(1-alpha)*b for c,b in zip(rgb(color),bg)]
        results.append(ratio(fg,bg))
    minimum=min(results)
    print(f'{name}: worst surface {minimum:.2f}:1 {"PASS" if minimum>=4.5 else "FAIL"}')
    assert minimum>=4.5
for name,color in [('focus','#6ee7b7'),('input boundary','#718096')]:
    minimum=min(ratio(rgb(color),rgb(tokens[surface])) for surface in surfaces)
    print(f'{name}: worst surface {minimum:.2f}:1 {"PASS" if minimum>=3 else "FAIL"}')
    assert minimum>=3
