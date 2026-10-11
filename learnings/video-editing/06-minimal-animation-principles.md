# 06: Minimal Animation Style: build process + design principles

**Source:** YouTube video *"How to Edit VIRAL Instagram Reels Using ONLY Claude! (New Style in 2026)"*, chapter "Training Claude: the visual guide (captions, animations, UI)". Lesson 01–05 bhi isi video se hain.

Lesson 05 me humne seekha ki **kaunse** scene types hote hain. Is lesson me seekhenge ki ek scene **kaise banta hai**: 4 build steps aur 5 design rules.

---

## Part A: Scene banane ke 4 steps

Frame ko **3×3 grid** me baanto (rule of thirds). Har step ka apna zone hai:

```
┌─────┬─────┬─────┐
│  4  │  4  │  4  │   4 = Depth zone (bahar ke 8 boxes)
├─────┼─────┼─────┤
│  4  │ 2/3 │  4  │   2 = Focal zone (beech ka box)
├─────┼─────┼─────┤   3 = Supporting ring (beech ke box ka border,
│  4  │  4  │  4  │       thoda bahar tak)
└─────┴─────┴─────┘
```

### Step 1: Background
![Background](assets/06-minimal-1-background.webp)

- Zyada tar **white** (warm ya cold, video ke mood ke hisaab se)
- **Light thin grid**, grey color me
- **Casted shadow overlay**, light. Jaise khidki ya patton ki parchhai background par pad rahi ho

### Step 2: Focal point
![Focal point](assets/06-minimal-2-focal-point.webp)

> *"Assess the scene's main focus and place it in the main focal zone"*

- Pehle decide karo: is scene ka hero kya hai? **Object, text ya person?** (Lesson 05 ki families)
- Jo bhi hero hai, use **beech wale zone** me rakho. Oval shape, jo center box se thoda upar-neeche phaila hua hai.
  - Object hero hai → object beech me (cup + "Big brands")
  - Text hero hai → text beech me ("it lets you see the future")
  - Person hero hai → person beech me ("GLOBAL" wala)

### Step 3: Supporting element
![Supporting element](assets/06-minimal-3-supporting.webp)

> *"Add supporting elements around main object to emphasize it"*

- Hero ke **theek aas-paas** (center box ke border wale ring me) ek supporting element:
  - Object hero → **text upar**, emphasis ke liye ("YOUR" + purple object)
  - Text hero → **object right side me**, emphasis ke liye ("life's work" + red block/vine)
- Supporting element hero se chhota aur kam bright ho. Wo sirf hero ki taraf ishara kare.

### Step 4: Depth elements
![Depth elements](assets/06-minimal-4-depth.webp)

> *"Add elements outside the focal point to create depth"*

- **Bahar ke 8 boxes** me (corners aur edges par) objects aur graphics, jo frame se aadhe bahar kate hue hon:
  - Red rectangles, color blocks
  - Cassette, camera, ya koi related object, kona kata hua
  - Brush strokes, arrows
- Ye kabhi beech me nahi aate. Sirf ek "layer" banate hain, taaki scene flat na lage.

**Yaad rakhne ka tareeka:** andar se bahar → **Hero → Support → Depth**, aur sabse peeche Background.

---

## Part B: 5 design principles

![Design principles](assets/06-design-principles.webp)

### 1. Color: 3-tone palette
> *"use a 3 tone color palette made up of black, white and a special color"*

| Scene | Off-white | Dark | Special color |
|-------|-----------|------|---------------|
| Text scene (life's work) | ~`#E4E2DE` | ~`#3A3A3A` | Teal ~`#3FA58A` |
| Number scene (596,000) | ~`#E4E2DE` | ~`#3A3A3A` | Deep red ~`#9E0F0F` |
| Object scene (sword) | ~`#ECEAE2` | ~`#3A3A3A` | Lavender purple ~`#A766E0` |

- Pure black (`#000`) nahi, **charcoal** ke paas. Pure white bhi nahi, **off-white**.
- Ek scene me sirf ek special color. Lesson 05 ki "ek accent" wali baat confirm.

*(Hex values swatches dekh ke andaze se likhe hain.)*

### 2. Fonts
> *"Use sans fonts for main text and script or other for highlighted special text"*

- Lesson 02 wala hi rule: main text sans, special word script ya koi doosra contrast font.
- Same scene ko 2 versions me dikhaya hai: sans-only aur special font wala. Special font wala zyada premium lagta hai.

### 3. Texts: halka gradient
> *"Use gradients (very light difference) for the main color of the text"*

- Text ka color flat nahi hota. Upar se neeche **bahut halka gradient**, jaise teal se thoda dark teal.
- Fark itna kam ho ki dikhe nahi, bas mehsoos ho. Isse text "printed" aur rich lagta hai.

### 4. Objects: shadow + texture
> *"Use casted shadows + textures on objects"*

- Har object ke neeche **casted shadow** (sirf drop shadow nahi). Object ke shape jaisi parchhai, ek direction me giri hui.
- Object par **texture**: grain, halftone, paper. Isse cutout "sticker" nahi lagta, scene ka hissa lagta hai.

### 5. Backgrounds: gradient + texture + casted shadow
> *"Use gradients + textures + casted shadows for backgrounds"*

- Background bhi flat nahi: halka **gradient** (vignette ya ek side se light), upar **texture**, aur upar **casted shadow overlay**.

---

## Banane ke settings (mere suggestions, creator ne numbers nahi diye)

| Cheez | Setting |
|-------|---------|
| Grid | 1px lines, grey `#BDBDBD`, opacity 20–30%, 3×3 ya chhote squares |
| Casted shadow overlay | Leaf/window shadow PNG, Multiply, opacity 10–20%, blur 10–20px |
| Text gradient | Same color ke do shade, brightness me sirf 5–10% ka fark, upar light se neeche dark |
| Object casted shadow | Object ki copy → black fill → skew/rotate ek direction me → blur 15–25px → opacity 25–35% |
| Texture | Grain + halftone, Overlay/Soft Light, 10–20% |
| BG gradient | Center light, edges 5–10% dark (radial) |

## Checklist: har animated scene ke liye
- [ ] BG: off-white + thin grid + light casted shadow + halka gradient + texture
- [ ] Hero decide kiya (object / text / person) aur center zone me rakha
- [ ] Ek supporting element hero ke theek paas
- [ ] Depth elements bahar ke edges par, frame se aadhe kate hue
- [ ] Sirf 3 colors: off-white + charcoal + ek special color
- [ ] Main text sans, special word script
- [ ] Text me halka gradient
- [ ] Objects par casted shadow + texture
