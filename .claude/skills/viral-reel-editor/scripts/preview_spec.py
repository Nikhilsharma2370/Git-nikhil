# preview_spec.py — scene-spec.json ka approx PIL preview (Photoshop ke bina layout / overlap check).
# Usage: python3 preview_spec.py <kit_dir> <out.png>   (kit me graphics/ aur fonts/ chahiye)
import json,sys
from PIL import Image,ImageDraw,ImageFont,ImageFilter
K=sys.argv[1]; spec=json.load(open(K+'/scene-spec.json'))
F={'Inter-Regular':'Inter-400','Inter-Medium':'Inter-500','Inter-SemiBold':'Inter-600','EBGaramond-Regular':'EBGaramond-400','EBGaramond-BoldItalic':'EBGaramond-700Italic'}
tiles=[]
for S in spec['scenes']:
    W,H=S['width'],S['height']; im=Image.new('RGBA',(W,H),'#F1EFEA'); d=ImageDraw.Draw(im)
    for x in range(0,W+1,90): d.line([(x,0),(x,H)],fill=(46,44,42,18))
    for y in range(0,H+1,90): d.line([(0,y),(W,y)],fill=(46,44,42,18))
    order={'DEPTH':0,'SUPPORT':1,'HERO':2,'TEXT':3}
    for L in sorted(S['layers'],key=lambda L:order[L.get('group','HERO')]):
        t=L['type']
        if t in('card','rect'):
            c=Image.new('RGBA',(int(L['w']),int(L['h'])),'#'+L.get('color','FFFFFF' if t=='card' else S.get('accent','3D7BFF')))
            c.putalpha(int(255*L.get('opacity',80 if t=='card' else 100)/100)); c=c.rotate(-L.get('rot',0),expand=True)
            im.alpha_composite(c,(int(L['x']-c.width/2),int(L['y']-c.height/2)))
        elif t=='image':
            g=Image.open(K+'/graphics/'+L['file']).convert('RGBA'); s=L['w']/g.width; g=g.resize((int(g.width*s),int(g.height*s)))
            g=g.rotate(-L.get('rot',0),expand=True)
            if L.get('blur'): g=g.filter(ImageFilter.GaussianBlur(L['blur']))
            im.alpha_composite(g,(int(L['x']-g.width/2),int(L['y']-g.height/2)))
        else:
            f=ImageFont.truetype(K+'/fonts/'+F[L['font']]+'.ttf',L['size']); j=L.get('justify','center')
            a={'center':'ms','left':'ls','right':'rs'}[j]
            ImageDraw.Draw(im).text((L['x'],L['y']),L['text'],font=f,fill='#'+L.get('color','2E2C2A'),anchor=a)
    im=im.convert('RGB'); im.thumbnail((360,640)); tiles.append(im)
sheet=Image.new('RGB',(360*len(tiles)+10*(len(tiles)-1),640),'white')
x=0
for t in tiles: sheet.paste(t,(x,0)); x+=370
sheet.save(sys.argv[2])
