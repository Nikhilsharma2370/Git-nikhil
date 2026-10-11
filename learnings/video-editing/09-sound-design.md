# 09: Sound Design (Remotion me)

**Source:** Joseph Eid ka free guide *"UE Sound Design: Claude Training (COMPLETE)"*, jo isi video ke Drive folder me hai: <https://drive.google.com/drive/folders/1WJMeuTvYZJgufE9_Xpkp6xThzQWXhR-G>. Final edit me 106 sound effects lage hain. Ye note us guide ka saar hai, apne shabdon me.

## Philosophy
1. **Sound sirf motion ko emphasize karta hai.** Screen par kuch nahi ho raha, to sound bhi nahi.
2. **3 families, 3 kaam:**
   - **Whooshes** → kuch **move** hua (slide, pan, zoom, camera move, scene transition)
   - **Textures** → kuch **hua** par slide nahi hua (pop, click, reveal, UI change, letter-by-letter)
   - **Risers + hits** → **anticipation** (agle segment me le jaana, phir release)
3. **Kabhi zyada loud nahi.** Voice hamesha king hai.
4. **Animations ke neeche music nahi**, sirf SFX. Music sirf talking head ke neeche.
5. **Har scene me ek hi sabse loud moment.**
6. Shot bada to sound bada, close-up to sound chhota.
7. Screen par jo cheez asli me awaaz karti, pehle wahi sound lo (diegetic).
8. **Whoosh ka peak = movement ka sabse fast frame.**

## Kaunsa sound kab

### Whooshes (movement), level −12 dB (bade move par max −10)
| Movement | Whoosh |
|----------|--------|
| Standard slide / pan (default) | Deep voice whoosh, hollow whoosh, futuristic whoosh |
| Slow, methodical move | Organic wind whoosh |
| Fast transition se pehle build | Generic long whoosh (aadha riser) |
| Scene → scene transition | Synthetic / transition spacey / water dropper |
| Bahut chhota fast move (kam use) | Short whoosh |
| Bada, bhaari move (kam use) | Classy airy whoosh |

### Textures (events), level −6 to −7 dB
| Screen par kya hua | Texture |
|--------------------|---------|
| Text pop (poora element) | Pop |
| UI element pop | UI click |
| Click, ya UI ke andar change (color badla) | Sci-fi click |
| Letter-by-letter text / typewriter | Gears (har letter par) |
| Screen par typing | Keyboard writing |
| Ek image/object pop, emphasis chahiye | Video scan / gears moving |
| Kai assets ek ke baad ek | Complex mechanism gizmo (har element par) |
| Naya UI/object **reveal** hokar aaye | Sci-fi impact |
| Naye animation me transition | "Activate protection energy" |
| Clip → clip transition / camera flash | Digital camera click (transition frame par) |
| Bahut bada reveal | Heavenly choir |
| Conclusion | Success reward |

### Risers + hits (anticipation)
- **Hook ke ~5 second baad** ek riser, cut par khatam, aur uske neeche ek **hit**.
- Har segment change, A-roll → B-roll, naya idea/chapter → riser.
- Poore video me **kam se kam 2 sharp bass + 2 metallic risers**.
- Suck-back riser: ya bahut halka ya bahut loud, beech wala level kabhi nahi.

## Levels
| Family | dB |
|--------|----|
| Whoosh | −12 (max −10) |
| Texture | −6 to −7 |
| Riser | −5 |
| Hit | Riser ke neeche. Riser + hit transition ka sabse loud stack |
| Music (sirf talking head) | −19 |
| Voice | Kabhi touch nahi. Uske upar kuch bhi loud nahi |

Clipping ho to **hit kam karo, voice kabhi nahi.**

## Order (badalna nahi)
1. **Analyze:** pehle poora video frame-by-frame dekho. Har moment ko MOVEMENT / EVENT / BUILD me baanto, timecodes ke saath likho, aur report karo.
2. **Pass 1, Whooshes:** shuru se end tak, har movement par.
3. **Pass 2, Textures:** shuru se end tak, har non-slide event par.
4. **Pass 3, Risers + hits:** shuru se end tak, "viewer ko kahan build karna hai?"
5. Mix check: sabse loud stack dhundho, clipping warn karo.
6. **Pass 4, Music:** sirf approval ke baad, talking head ke neeche, −19 dB.

## Remotion me kaise
- Har family ka **alag track/Sequence**: WHOOSHES, TEXTURES, RISERS, HITS, MUSIC. Ek track par do families kabhi nahi.
- `<Audio src={staticFile('sfx/...')} volume={dbToGain(-12)} />` ko `<Sequence from={frame}>` me rakho. `dbToGain(db) = 10 ** (db / 20)`.
- Whoosh: sound file ka **peak point** pata karo, aur `from = fastestFrame - peakOffsetFrames` rakho.
- Texture: event frame par. Transition sounds: cut se 2–3 frame pehle (lead).
- Original audio **delete nahi, mute** karo.
- Folder me 3+ variations hon to sab sun ke ek chuno, aur batao kyun.
- Library me sound ho to generate mat karo.

## Never
- Animation ke neeche music
- Pop wali cheez par whoosh, ya slide par pop
- Whoosh ka peak fastest frame se hat ke
- Whoosh −10 dB se upar
- Voice se loud kuch bhi

> Note: Joseph ki SFX library paid hai. Nikhil ke paas apni library ho to usi ke file names isi mapping me lagao.
