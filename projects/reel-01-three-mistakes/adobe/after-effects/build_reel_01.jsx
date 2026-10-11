/*
  build_reel_01.jsx — After Effects me poori "3 mistakes" reel banata hai.
  Chalana: After Effects → File → Scripts → Run Script File… → ye file.

  Folder structure (kit):
    adobe/
      after-effects/build_reel_01.jsx   (ye file)
      after-effects/reel-data.jsxinc    (timings: cuts, words, captions, scenes, sfx)
      footage/3 things from beginner to pro.mp4   (Joseph ki raw footage, khud download karo)
      graphics/*.png                    (Gemini cutouts)
      sfx/*.wav
      fonts/*.ttf                       (pehle install karo: Inter + EB Garamond)

  Bana kya hai (Project panel → "REEL_01" folder):
    REEL_01          final 1080×1920 comp (speaker + dim/blur + GRAPHICS + SFX)
    SPEAKER          13 jump cuts (raw footage par, in/out editable)
    GRAPHICS         sab graphics (alpha) — Premiere ke liye alag render kar sakte ho
    SC_* comps       har scene ka apna comp (half = 1080×960, full = 1080×1920)
    UI_STEPPER, UI_SLIDER, CARD_CLIP

  Note: script ExtendScript (ES3) me hai. Har effect parameter try/catch me hai,
  taaki kisi AE version me ek param na mile to baaki build chalta rahe.
*/

//@include "reel-data.jsxinc"

(function () {
  var D = DATA;
  var FPS = D.fps;
  var DUR = D.duration;
  var W = 1080, H = 1920, SPLIT = 960;
  var FACE = [495, 520];
  var HALF_SHIFT = 840;

  var FONT_SANS = "Inter-Regular";
  var FONT_SANS_MED = "Inter-Medium";
  var FONT_SANS_SEMI = "Inter-SemiBold";
  var FONT_SCRIPT = "EBGaramond-BoldItalic";
  var FONT_SERIF = "EBGaramond-Regular";

  var KIT = File($.fileName).parent.parent;
  var warnings = [];

  // ---------- small helpers ----------
  function hex(h) {
    h = h.replace("#", "");
    return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
  }
  var COL = {
    white: hex("F3F3F3"), accent: hex("5B95FF"), paper: hex("F1EFEA"), charcoal: hex("2E2C2A"),
    muted: hex("8B8780"), blue: hex("3D7BFF"), blueDeep: hex("2A62E6"), dullBlue: hex("5D6F8F"),
    sage: hex("7D8C76"), glass: hex("12141A"), uiGrey: hex("8A8F98"), black: [0, 0, 0], pureWhite: [1, 1, 1],
    red: hex("E02424"), magenta: hex("FF00B8"), lime: hex("7CFF00")
  };
  function W_(i) { return D.words[i]; }
  function ws(i) { return D.words[i].s; }
  function we(i) { return D.words[i].e; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function tryDo(label, fn) { try { return fn(); } catch (e) { warnings.push(label + ": " + e.toString()); return null; } }

  function easeAll(prop) {
    var n = prop.numKeys;
    var dims = 1;
    if (!(prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL)) {
      var v = prop.keyValue(1);
      if (v instanceof Array) dims = v.length;
    }
    for (var k = 1; k <= n; k++) {
      var arr = [];
      for (var d = 0; d < dims; d++) arr.push(new KeyframeEase(0, 70));
      try { prop.setTemporalEaseAtKey(k, arr, arr); } catch (e) {}
    }
  }
  /** keys: [[t, v], ...]; ease: "ease" | "linear" | "hold" */
  function keys(prop, list, ease) {
    for (var i = 0; i < list.length; i++) prop.setValueAtTime(list[i][0], list[i][1]);
    if (ease === "hold") {
      for (var k = 1; k <= prop.numKeys; k++) prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
    } else if (ease !== "linear") {
      easeAll(prop);
    }
  }
  function tr(layer) { return layer.property("ADBE Transform Group"); }
  function pos(layer) { return tr(layer).property("ADBE Position"); }
  function scl(layer) { return tr(layer).property("ADBE Scale"); }
  function opa(layer) { return tr(layer).property("ADBE Opacity"); }
  function rot(layer) { return tr(layer).property("ADBE Rotate Z"); }
  function anc(layer) { return tr(layer).property("ADBE Anchor Point"); }

  /** Overshoot pop: 0 → 108 → 100 (percent of `base`). */
  function popIn(layer, t, base) {
    base = base || 100;
    var b = base / 100;
    keys(scl(layer), [[t, [0, 0]], [t + 0.2, [108 * b, 108 * b]], [t + 0.32, [100 * b, 100 * b]]]);
  }
  /** Fade window. */
  function fadeWindow(layer, a, b, fin, fout) {
    fin = fin || 0.15; fout = fout || 0.12;
    keys(opa(layer), [[a, 0], [a + fin, 100], [b - fout, 100], [b, 0]]);
  }

  // ---------- project items ----------
  function findOrMakeFolder(name, parent) {
    var f = app.project.items.addFolder(name);
    if (parent) f.parentFolder = parent;
    return f;
  }
  function importFile(path, folder) {
    var f = new File(path);
    if (!f.exists) { warnings.push("Missing file: " + path); return null; }
    var io = new ImportOptions(f);
    var item = app.project.importFile(io);
    if (folder) item.parentFolder = folder;
    return item;
  }
  function makeComp(name, w, h, folder) {
    var c = app.project.items.addComp(name, w, h, 1, DUR, FPS);
    c.bgColor = COL.paper;
    if (folder) c.parentFolder = folder;
    return c;
  }

  // ---------- layer builders ----------
  function addText(comp, str, font, size, color, p, just, tracking) {
    var l = comp.layers.addText(str);
    var prop = l.property("ADBE Text Properties").property("ADBE Text Document");
    var td = prop.value;
    if (td.resetCharStyle) td.resetCharStyle();
    if (td.resetParagraphStyle) td.resetParagraphStyle();
    td.font = font;
    td.fontSize = size;
    td.applyFill = true;
    td.fillColor = color;
    td.applyStroke = false;
    td.tracking = tracking || 0;
    td.justification = just || ParagraphJustification.CENTER_JUSTIFY;
    prop.setValue(td);
    pos(l).setValue(p);
    return l;
  }
  /** Word-by-word reveal (rise + fade + blur), synced to word times (Lesson 02). */
  function wordReveal(layer, times, rise, blur) {
    var anims = layer.property("ADBE Text Properties").property("ADBE Text Animators");
    var a = anims.addProperty("ADBE Text Animator");
    a.name = "Word Reveal";
    var ap = a.property("ADBE Text Animator Properties");
    ap.addProperty("ADBE Text Opacity").setValue(0);
    ap.addProperty("ADBE Text Position 3D").setValue([0, rise || 20, 0]);
    tryDo("text blur", function () { ap.addProperty("ADBE Text Blur").setValue([blur || 10, blur || 10]); });
    var sel = a.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    var adv = sel.property("ADBE Text Range Advanced");
    tryDo("range units", function () { adv.property("ADBE Text Range Units").setValue(2); }); // Index
    tryDo("range based on", function () { adv.property("ADBE Text Range Type2").setValue(3); }); // Words
    var n = times.length;
    tryDo("index end", function () { sel.property("ADBE Text Index End").setValue(n); });
    var st = sel.property("ADBE Text Index Start");
    var last = -1;
    for (var i = 0; i < n; i++) {
      var t = Math.max(times[i], last + 0.04);
      st.setValueAtTime(t, i);
      last = t;
    }
    st.setValueAtTime(last + 0.32, n);
  }
  function addDropShadow(layer, opacityPct, dist, soft) {
    tryDo("drop shadow", function () {
      var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
      fx.property("ADBE Drop Shadow-0001").setValue([0, 0, 0, 1]);
      fx.property("ADBE Drop Shadow-0002").setValue(Math.round(255 * opacityPct / 100));
      fx.property("ADBE Drop Shadow-0003").setValue(180);
      fx.property("ADBE Drop Shadow-0004").setValue(dist);
      fx.property("ADBE Drop Shadow-0005").setValue(soft);
    });
  }
  function addGlow(layer, radius, intensity) {
    return tryDo("glow", function () {
      var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Glo2");
      fx.property("ADBE Glo2-0002").setValue(55);
      fx.property("ADBE Glo2-0003").setValue(radius);
      fx.property("ADBE Glo2-0004").setValue(intensity);
      return fx;
    });
  }
  function addBlur(layer, amount) {
    return tryDo("gaussian blur", function () {
      var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
      fx.property("ADBE Gaussian Blur 2-0001").setValue(amount);
      return fx;
    });
  }
  /** Effect ka pehla COLOR parameter (matchName index AE versions me badalta hai). */
  function fxColor(fx) {
    for (var i = 1; i <= fx.numProperties; i++) {
      var p = fx.property(i);
      if (p.propertyValueType === PropertyValueType.COLOR) return p;
    }
    return null;
  }
  function addFillFx(layer, color) {
    return tryDo("fill fx", function () {
      var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Fill");
      fxColor(fx).setValue([color[0], color[1], color[2], 1]);
      return fx;
    });
  }
  function shapeLayer(comp, name) {
    var l = comp.layers.addShape();
    l.name = name;
    return l;
  }
  function addGroup(l, name) {
    var g = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    g.name = name || "Group";
    return g.property("ADBE Vectors Group");
  }
  function addRectPath(contents, w, h, r, offset) {
    var rect = contents.addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([w, h]);
    rect.property("ADBE Vector Rect Roundness").setValue(r || 0);
    if (offset) rect.property("ADBE Vector Rect Position").setValue(offset);
    return rect;
  }
  function addEllipsePath(contents, w, h, offset) {
    var e = contents.addProperty("ADBE Vector Shape - Ellipse");
    e.property("ADBE Vector Ellipse Size").setValue([w, h]);
    if (offset) e.property("ADBE Vector Ellipse Position").setValue(offset);
    return e;
  }
  function addStroke(contents, color, width, opacity) {
    var s = contents.addProperty("ADBE Vector Graphic - Stroke");
    s.property("ADBE Vector Stroke Color").setValue(color);
    s.property("ADBE Vector Stroke Width").setValue(width);
    s.property("ADBE Vector Stroke Opacity").setValue(opacity === undefined ? 100 : opacity);
    return s;
  }
  function addFill(contents, color, opacity) {
    var f = contents.addProperty("ADBE Vector Graphic - Fill");
    f.property("ADBE Vector Fill Color").setValue(color);
    f.property("ADBE Vector Fill Opacity").setValue(opacity === undefined ? 100 : opacity);
    return f;
  }
  /** Rounded rectangle shape layer, centered at p. */
  function roundRect(comp, name, w, h, r, p, fill, fillOp, stroke, strokeW, strokeOp) {
    var l = shapeLayer(comp, name);
    var c = addGroup(l, "Rect");
    addRectPath(c, w, h, r);
    if (stroke) addStroke(c, stroke, strokeW || 2, strokeOp);
    if (fill) addFill(c, fill, fillOp);
    pos(l).setValue(p);
    return l;
  }
  function ellipse(comp, name, d, p, fill, fillOp, stroke, strokeW, strokeOp) {
    var l = shapeLayer(comp, name);
    var c = addGroup(l, "Ellipse");
    addEllipsePath(c, d, d);
    if (stroke) addStroke(c, stroke, strokeW || 2, strokeOp);
    if (fill) addFill(c, fill, fillOp);
    pos(l).setValue(p);
    return l;
  }
  /** PNG layer sized to a target width. */
  function image(comp, item, name, p, targetW, rotation) {
    if (!item) return null;
    var l = comp.layers.add(item);
    l.name = name;
    var s = targetW / item.width * 100;
    scl(l).setValue([s, s]);
    pos(l).setValue(p);
    if (rotation) rot(l).setValue(rotation);
    return l;
  }
  function setMatte(layer, matteLayer) {
    tryDo("track matte", function () {
      if (layer.setTrackMatte) layer.setTrackMatte(matteLayer, TrackMatteType.ALPHA);
      else layer.trackMatteType = TrackMatteType.ALPHA;
    });
  }

  // ---------- paper background (Lesson 06 step 1) ----------
  function paperBG(comp, h) {
    var bg = comp.layers.addSolid(COL.paper, "BG paper", W, h, 1, DUR);
    // thin grid (shape + repeater)
    var grid = shapeLayer(comp, "BG grid");
    var gv = addGroup(grid, "Vertical");
    addRectPath(gv, 1.5, h + 40, 0, [-540, 0]);
    addFill(gv, COL.charcoal, 100);
    var rep = gv.addProperty("ADBE Vector Filter - Repeater");
    rep.property("ADBE Vector Repeater Copies").setValue(14);
    rep.property("ADBE Vector Repeater Transform").property("ADBE Vector Repeater Position").setValue([90, 0]);
    var gh = addGroup(grid, "Horizontal");
    addRectPath(gh, W + 40, 1.5, 0, [0, -h / 2]);
    addFill(gh, COL.charcoal, 100);
    var rep2 = gh.addProperty("ADBE Vector Filter - Repeater");
    rep2.property("ADBE Vector Repeater Copies").setValue(Math.ceil(h / 90) + 2);
    rep2.property("ADBE Vector Repeater Transform").property("ADBE Vector Repeater Position").setValue([0, 90]);
    pos(grid).setValue([W / 2, h / 2]);
    opa(grid).setValue(6.5);
    // casted shadow (window blinds), slowly drifting
    var sh = shapeLayer(comp, "BG casted shadow");
    var sc = addGroup(sh, "Blinds");
    addRectPath(sc, 80, h * 2.2, 0, [-600, 0]);
    addFill(sc, [0.24, 0.2, 0.16], 100);
    var rep3 = sc.addProperty("ADBE Vector Filter - Repeater");
    rep3.property("ADBE Vector Repeater Copies").setValue(8);
    rep3.property("ADBE Vector Repeater Transform").property("ADBE Vector Repeater Position").setValue([210, 0]);
    rot(sh).setValue(28);
    keys(pos(sh), [[0, [W / 2 - 80, h / 2]], [DUR, [W / 2 + 230, h / 2]]], "linear");
    opa(sh).setValue(7);
    addBlur(sh, 40);
    // radial gradient (center light, edges dark)
    var vg = comp.layers.addSolid([1, 1, 1], "BG gradient", W, h, 1, DUR);
    tryDo("gradient ramp", function () {
      var fx = vg.property("ADBE Effect Parade").addProperty("ADBE Ramp");
      fx.property("ADBE Ramp-0001").setValue([W / 2, h * 0.42]);
      fx.property("ADBE Ramp-0002").setValue([1, 1, 1, 1]);
      fx.property("ADBE Ramp-0003").setValue([W * 1.05, h * 1.05]);
      fx.property("ADBE Ramp-0004").setValue([0.55, 0.5, 0.45, 1]);
      fx.property("ADBE Ramp-0005").setValue(2); // radial
    });
    vg.blendingMode = BlendingMode.MULTIPLY;
    opa(vg).setValue(18);
    // grain
    var gr = comp.layers.addSolid([0.5, 0.5, 0.5], "BG grain", W, h, 1, DUR);
    tryDo("fractal noise", function () {
      var fx = gr.property("ADBE Effect Parade").addProperty("ADBE Fractal Noise");
      fx.property("Contrast").setValue(160);
      fx.property("Transform").property("Scale").setValue(18);
      fx.property("Evolution").expression = "time*900";
    });
    gr.blendingMode = BlendingMode.OVERLAY;
    opa(gr).setValue(12);
    return bg;
  }

  /** Placeholder "ghost" card: depth element at frame edges (Lesson 06 step 4). */
  function ghostCard(comp, name, w, h, p, rotation, blur) {
    var l = shapeLayer(comp, name);
    var c = addGroup(l, "Card");
    addRectPath(c, w, h, 28);
    addFill(c, COL.pureWhite, 100);
    var d = addGroup(l, "Avatar");
    addEllipsePath(d, 60, 60, [-w / 2 + 58, -h / 2 + 58]);
    addFill(d, hex("E9E6E0"), 100);
    var ln = addGroup(l, "Line");
    addRectPath(ln, w * 0.55, 14, 7, [-w / 2 + 28 + w * 0.275, -h / 2 + 120]);
    addFill(ln, hex("ECE9E3"), 100);
    pos(l).setValue(p);
    rot(l).setValue(rotation || 0);
    addDropShadow(l, 14, 14, 36);
    if (blur) addBlur(l, blur);
    opa(l).setValue(80);
    return l;
  }

  // Scene text: sans words (charcoal) and script payoff (bold italic, light gradient feel via glow-less fill)
  function sceneSans(comp, idxs, p, size, just, textOverride, color) {
    var parts = [];
    var times = [];
    for (var i = 0; i < idxs.length; i++) {
      parts.push(textOverride && textOverride[idxs[i]] ? textOverride[idxs[i]] : W_(idxs[i]).w);
      times.push(ws(idxs[i]) - 0.04);
    }
    var l = addText(comp, parts.join(" "), FONT_SANS, size || 52, color || COL.charcoal, p, just, -10);
    l.name = "T " + parts.join(" ");
    wordReveal(l, times, 20, 10);
    return l;
  }
  function sceneScript(comp, idxs, p, size, just, textOverride, color) {
    var parts = [];
    var times = [];
    for (var i = 0; i < idxs.length; i++) {
      parts.push(textOverride && textOverride[idxs[i]] ? textOverride[idxs[i]] : W_(idxs[i]).w);
      times.push(ws(idxs[i]) - 0.04);
    }
    var l = addText(comp, parts.join(" "), FONT_SCRIPT, size || 120, color || COL.blue, p, just, -15);
    l.name = "S " + parts.join(" ");
    wordReveal(l, times, 20, 10);
    return l;
  }

  // =====================================================================
  app.beginUndoGroup("Build REEL_01");

  var root = findOrMakeFolder("REEL_01");
  var fComps = findOrMakeFolder("comps", root);
  var fScenes = findOrMakeFolder("scenes", root);
  var fMedia = findOrMakeFolder("media", root);
  var fSfx = findOrMakeFolder("sfx", root);

  // ---------- import ----------
  var footPath = KIT.fsName + "/footage/3 things from beginner to pro.mp4";
  var foot = null;
  if (new File(footPath).exists) foot = importFile(footPath, fMedia);
  else {
    var picked = File.openDialog("Raw footage chuno: '3 things from beginner to pro.mp4'");
    if (picked) foot = importFile(picked.fsName, fMedia);
  }
  if (!foot) { alert("Footage nahi mili. Script ruk rahi hai."); app.endUndoGroup(); return; }

  var G = {};
  var gNames = ["app_icon", "arrow_huge", "brush_stroke", "camcorder", "eye", "perfume", "sparkle", "spotlight_lamp", "star_huge", "tube_black", "tube_white", "tube_red"];
  for (var gi = 0; gi < gNames.length; gi++) G[gNames[gi]] = importFile(KIT.fsName + "/graphics/" + gNames[gi] + ".png", fMedia);

  var SFX = {};
  var sNames = ["whoosh_hollow", "whoosh_deep", "whoosh_transition", "pop", "ui_click", "scifi_click", "scifi_impact", "gear_tick", "riser_bass", "riser_metal", "hit", "success"];
  for (var si = 0; si < sNames.length; si++) SFX[sNames[si]] = importFile(KIT.fsName + "/sfx/" + sNames[si] + ".wav", fSfx);

  var S = D.scenes;

  // ---------- SPEAKER: 13 jump cuts on the raw footage ----------
  var speaker = makeComp("SPEAKER", W, H, fComps);
  speaker.bgColor = [0.04, 0.1, 0.17];
  var tAcc = 0;
  for (var r = 0; r < D.ranges.length; r++) {
    var a = D.ranges[r][0], b = D.ranges[r][1];
    var cl = speaker.layers.add(foot);
    cl.name = "CUT " + (r + 1) + "  (raw " + a.toFixed(2) + "–" + b.toFixed(2) + ")";
    cl.startTime = tAcc - a;
    cl.inPoint = tAcc;
    cl.outPoint = tAcc + (b - a);
    tAcc += b - a;
  }

  // ---------- CARD_CLIP: video-centric card content ----------
  var cardComp = makeComp("CARD_CLIP", 500, 889, fComps);
  var cardFoot = cardComp.layers.add(foot);
  cardFoot.name = "clip (muted)";
  cardFoot.startTime = S.full1.start - D.ranges[0][0];
  tryDo("mute card audio", function () { cardFoot.audioEnabled = false; });
  scl(cardFoot).setValue([500 / 1080 * 100, 500 / 1080 * 100]);
  pos(cardFoot).setValue([250, 444.5]);
  var cardMask = roundRect(cardComp, "rounded matte", 500, 889, 26, [250, 444.5], COL.pureWhite, 100);
  cardMask.moveBefore(cardFoot);
  setMatte(cardFoot, cardMask);
  var cardBorder = roundRect(cardComp, "white border", 492, 881, 24, [250, 444.5], null, 100, COL.pureWhite, 8, 100);

  // ---------- UI_STEPPER ----------
  var stepper = makeComp("UI_STEPPER", W, H, fComps);
  var UI_Y = 1185;
  var stCard = roundRect(stepper, "glass card", 400, 114, 34, [540, UI_Y + 57], COL.glass, 82, COL.pureWhite, 2, 12);
  addDropShadow(stCard, 45, 24, 60);
  var stepX = [380, 540, 700];
  var stepY = UI_Y + 57;
  var fillOn = [
    [[0, 0], [ws(23), 1], [45.6, 0], [ws(137), 1]],
    [[0, 0], [ws(66), 1], [45.6, 0], [ws(138), 1]],
    [[0, 0], [ws(97), 1], [45.6, 0], [ws(139), 1]]
  ];
  var hookPop = [0.34, 0.5, 0.66];
  for (var lnI = 0; lnI < 2; lnI++) {
    var lnBg = roundRect(stepper, "link " + (lnI + 1) + " bg", 70, 4, 2, [460 + lnI * 160, stepY], COL.pureWhite, 14);
    var lnFill = roundRect(stepper, "link " + (lnI + 1) + " fill", 70, 4, 2, [425 + lnI * 160, stepY], COL.white, 100);
    anc(lnFill).setValue([-35, 0]);
    var lk = fillOn[lnI + 1];
    var lks = [];
    for (var q = 0; q < lk.length; q++) {
      if (lk[q][1] === 1) { lks.push([lk[q][0] - 0.1, [0, 100]]); lks.push([lk[q][0] + 0.15, [100, 100]]); }
      else lks.push([lk[q][0], [0, 100]]);
    }
    keys(scl(lnFill), lks, "ease");
  }
  for (var s = 0; s < 3; s++) {
    var circ = ellipse(stepper, "step " + (s + 1), 62, [stepX[s], stepY], COL.white, 100, COL.pureWhite, 2, 18);
    var fillP = circ.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Opacity");
    var fk = [];
    for (var q2 = 0; q2 < fillOn[s].length; q2++) {
      var on = fillOn[s][q2][1];
      if (on) { fk.push([fillOn[s][q2][0], 6]); fk.push([fillOn[s][q2][0] + 0.25, 100]); }
      else fk.push([fillOn[s][q2][0], 6]);
    }
    keys(fillP, fk, "linear");
    keys(scl(circ), [[0, [0, 0]], [hookPop[s], [0, 0]], [hookPop[s] + 0.2, [110, 110]], [hookPop[s] + 0.3, [100, 100]]]);
    var num = addText(stepper, String(s + 1), FONT_SANS_SEMI, 28, COL.uiGrey, [stepX[s], stepY + 10], ParagraphJustification.CENTER_JUSTIFY);
    num.name = "num " + (s + 1);
    var nf = addFillFx(num, COL.uiGrey);
    if (nf) {
      var nfc = fxColor(nf);
      var nk = [];
      for (var q3 = 0; q3 < fillOn[s].length; q3++) nk.push([fillOn[s][q3][0] + (fillOn[s][q3][1] ? 0.12 : 0), fillOn[s][q3][1] ? [0.08, 0.09, 0.11, 1] : [COL.uiGrey[0], COL.uiGrey[1], COL.uiGrey[2], 1]]);
      keys(nfc, nk, "hold");
    }
    keys(scl(num), [[0, [0, 0]], [hookPop[s], [0, 0]], [hookPop[s] + 0.2, [110, 110]], [hookPop[s] + 0.3, [100, 100]]]);
  }

  // ---------- UI_SLIDER ----------
  var slider = makeComp("UI_SLIDER", W, H, fComps);
  var slCard = roundRect(slider, "glass card", 620, 150, 34, [540, UI_Y + 75], COL.glass, 82, COL.pureWhite, 2, 12);
  addDropShadow(slCard, 45, 24, 60);
  var lb1 = addText(slider, "Beginner", FONT_SANS_MED, 24, COL.white, [264, UI_Y + 52], ParagraphJustification.LEFT_JUSTIFY);
  var lb2 = addText(slider, "Professional", FONT_SANS_MED, 24, COL.uiGrey, [816, UI_Y + 52], ParagraphJustification.RIGHT_JUSTIFY);
  var trackY = UI_Y + 98;
  roundRect(slider, "track", 520, 8, 4, [540, trackY], COL.pureWhite, 12);
  var slFill = roundRect(slider, "track fill", 520, 8, 4, [280, trackY], COL.accent, 100);
  anc(slFill).setValue([-260, 0]);
  addGlow(slFill, 14, 0.8);
  var knob = ellipse(slider, "knob", 30, [280, trackY], COL.pureWhite, 100);
  addDropShadow(knob, 40, 2, 8);
  var sl1a = ws(19), sl1b = ws(22) + 0.3, sl2a = ws(148), sl2b = ws(151) + 0.3;
  keys(scl(slFill), [[0, [0, 100]], [sl1a, [0, 100]], [sl1b, [100, 100]], [49.8, [100, 100]], [49.85, [0, 100]], [sl2a, [0, 100]], [sl2b, [100, 100]]], "ease");
  keys(pos(knob), [[0, [280, trackY]], [sl1a, [280, trackY]], [sl1b, [800, trackY]], [49.8, [800, trackY]], [49.85, [280, trackY]], [sl2a, [280, trackY]], [sl2b, [800, trackY]]], "ease");
  var lb2fx = addFillFx(lb2, COL.uiGrey);
  if (lb2fx) keys(fxColor(lb2fx), [[0, [COL.uiGrey[0], COL.uiGrey[1], COL.uiGrey[2], 1]], [(sl1a + sl1b) / 2, [COL.white[0], COL.white[1], COL.white[2], 1]], [49.85, [COL.uiGrey[0], COL.uiGrey[1], COL.uiGrey[2], 1]], [(sl2a + sl2b) / 2, [COL.white[0], COL.white[1], COL.white[2], 1]]], "hold");

  // =================== SCENES ===================

  // ---- FULL 1: video-centric "screams beginner" ----
  var f1 = makeComp("SC_FULL1_video_centric", W, H, fScenes);
  paperBG(f1, H);
  var blob = ellipse(f1, "depth blue blob", 520, [W + 100, H + 140], COL.blue, 100);
  opa(blob).setValue(16); addBlur(blob, 60);
  var cam = image(f1, G.camcorder, "depth camcorder", [985, 110], 300, 8);
  if (cam) { addDropShadow(cam, 25, 18, 40); addBlur(cam, 2); }
  var brush = image(f1, G.brush_stroke, "depth brush stroke", [180, 1760], 520, -8);
  if (brush) tryDo("linear wipe", function () {
    var fx = brush.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe");
    keys(fx.property("ADBE Linear Wipe-0001"), [[S.full1.start + 0.2, 100], [S.full1.start + 0.9, 0]], "ease");
    fx.property("ADBE Linear Wipe-0002").setValue(270);
    fx.property("ADBE Linear Wipe-0003").setValue(60);
  });
  var swapT = ws(35) - 0.2;
  var t1 = sceneSans(f1, [27, 28, 29, 30], [80, 270], 52, ParagraphJustification.LEFT_JUSTIFY);
  var t2 = sceneScript(f1, [31, 32], [80, 392], 120, ParagraphJustification.LEFT_JUSTIFY);
  keys(opa(t1), [[swapT, 100], [swapT + 0.2, 0]]); keys(opa(t2), [[swapT, 100], [swapT + 0.2, 0]]);
  var t3 = sceneSans(f1, [35, 36, 37], [80, 270], 52, ParagraphJustification.LEFT_JUSTIFY, (function () { var o = {}; o[35] = "Huge"; return o; })());
  var t4 = sceneScript(f1, [38, 39], [80, 392], 120, ParagraphJustification.LEFT_JUSTIFY, (function () { var o = {}; o[39] = "shapes."; return o; })());
  t3.inPoint = swapT; t4.inPoint = swapT;
  var card = f1.layers.add(cardComp);
  card.name = "HERO video card";
  rot(card).setValue(-3);
  keys(pos(card), [[S.full1.start, [540, 1150 + 444]], [S.full1.end, [540, 730 + 444]]], "ease");
  addDropShadow(card, 30, 50, 90);
  var arrow = image(f1, G.arrow_huge, "beginner: huge arrow", [100, 230], 330, -12);
  if (arrow) { arrow.parent = card; popIn(arrow, ws(35), scl(arrow).value[0]); }
  var star = image(f1, G.star_huge, "beginner: huge star", [400, 470], 300, 0);
  if (star) { star.parent = card; popIn(star, ws(36), scl(star).value[0]); }
  var mag = roundRect(f1, "beginner: huge shape 1", 420, 160, 0, [140, 680], COL.magenta, 92);
  mag.parent = card; rot(mag).setValue(8); popIn(mag, ws(38));
  var lime = roundRect(f1, "beginner: huge shape 2", 360, 220, 110, [400, 780], COL.lime, 90);
  lime.parent = card; rot(lime).setValue(-10); popIn(lime, ws(39));

  // ---- HALF 1: 25% smaller ----
  var h1 = makeComp("SC_HALF1_shrink", W, SPLIT, fScenes);
  paperBG(h1, SPLIT);
  ghostCard(h1, "depth card L", 300, 220, [30, 230], -6, 3);
  ghostCard(h1, "depth card R", 300, 240, [1050, 680], 5, 3);
  var lbl = addText(h1, "ELEMENT SIZE", FONT_SANS_MED, 22, COL.muted, [70, 95], ParagraphJustification.LEFT_JUSTIFY, 180);
  var heroN = h1.layers.addNull(DUR);
  heroN.name = "HERO_SCALE";
  pos(heroN).setValue([540, 470]);
  var sh1 = ws(56), sh2 = we(57);
  keys(scl(heroN), [[S.half1.start + 0.1, [0, 0]], [S.half1.start + 0.35, [108, 108]], [S.half1.start + 0.5, [100, 100]], [sh1, [100, 100]], [sh2, [75, 75]]]);
  var icon = image(h1, G.app_icon, "HERO app icon", [0, 0], 340);
  if (icon) { icon.parent = heroN; pos(icon).setValue([0, 0]); addDropShadow(icon, 22, 20, 45); }
  var box = shapeLayer(h1, "figma selection box");
  var bx = addGroup(box, "Box"); addRectPath(bx, 376, 376, 0); addStroke(bx, COL.blue, 2, 100);
  var hd = [[-188, -188], [188, -188], [-188, 188], [188, 188]];
  for (var hi = 0; hi < 4; hi++) { var hg = addGroup(box, "Handle " + (hi + 1)); addRectPath(hg, 14, 14, 0, hd[hi]); addStroke(hg, COL.blue, 2, 100); addFill(hg, COL.pureWhite, 100); }
  box.parent = heroN; pos(box).setValue([0, 0]);
  var sizeLbl = addText(h1, "420 × 420", FONT_SANS_SEMI, 22, COL.pureWhite, [0, 230], ParagraphJustification.CENTER_JUSTIFY);
  sizeLbl.name = "size label";
  var sizePill = roundRect(h1, "size pill", 150, 38, 8, [0, 222], COL.blue, 100);
  sizePill.moveAfter(sizeLbl);
  sizeLbl.parent = heroN; sizePill.parent = heroN; pos(sizeLbl).setValue([0, 230]); pos(sizePill).setValue([0, 222]);
  tryDo("size expression", function () {
    sizeLbl.property("ADBE Text Properties").property("ADBE Text Document").expression =
      'var s = thisComp.layer("HERO_SCALE").transform.scale[0] / 100; var n = Math.round(420 * s); n + " \\u00D7 " + n;';
  });
  var badge = roundRect(h1, "-25% badge", 150, 60, 30, [0, 0], COL.blue, 100);
  var badgeT = addText(h1, "−25%", FONT_SANS_SEMI, 34, COL.pureWhite, [0, 12], ParagraphJustification.CENTER_JUSTIFY);
  badge.parent = heroN; badgeT.parent = heroN;
  pos(badge).setValue([200, -215]); pos(badgeT).setValue([200, -203]);
  popIn(badge, sh1); popIn(badgeT, sh1);
  var sp1 = image(h1, G.sparkle, "sparkle", [700, 320], 70, 0);
  if (sp1) popIn(sp1, ws(63), scl(sp1).value[0]);
  var sp2 = image(h1, G.sparkle, "sparkle 2", [370, 590], 46, 0);
  if (sp2) popIn(sp2, ws(63) + 0.12, scl(sp2).value[0]);

  // ---- HALF 2: less is more ----
  var h2 = makeComp("SC_HALF2_less_is_more", W, SPLIT, fScenes);
  paperBG(h2, SPLIT);
  addText(h2, "EFFECT USAGE", FONT_SANS_MED, 22, COL.muted, [90, 100], ParagraphJustification.LEFT_JUSTIFY, 180);
  var counter = addText(h2, "0 / 9", FONT_SANS_SEMI, 24, COL.blue, [990, 100], ParagraphJustification.RIGHT_JUSTIFY, 80);
  counter.name = "counter";
  var EFFECTS = ["Shake", "Blur", "Zoom", "RGB Split", "Glow", "Flash", "Glitch", "Spin", "Bounce"];
  var OFF_ORDER = [0, 8, 2, 6, 1, 7, 3, 5];
  var offStart = ws(74), offEnd = ws(80);
  function onAt(k) { return ws(70) + k * 0.04; }
  function offAt(k) { var idx = -1; for (var z = 0; z < OFF_ORDER.length; z++) if (OFF_ORDER[z] === k) idx = z; return offStart + idx / (OFF_ORDER.length - 1) * (offEnd - offStart); }
  // counter (hold keys)
  var ctProp = counter.property("ADBE Text Properties").property("ADBE Text Document");
  var events = [];
  for (var k1 = 0; k1 < 9; k1++) { events.push([onAt(k1), 1]); if (k1 !== 4) events.push([offAt(k1), -1]); }
  events.sort(function (x, y) { return x[0] - y[0]; });
  var lit = 0;
  var tdBase = ctProp.value;
  tdBase.text = "0 / 9"; ctProp.setValueAtTime(0, tdBase);
  for (var e1 = 0; e1 < events.length; e1++) { lit += events[e1][1]; var td2 = ctProp.value; td2.text = lit + " / 9"; ctProp.setValueAtTime(events[e1][0], td2); }
  for (var tk = 1; tk <= ctProp.numKeys; tk++) ctProp.setInterpolationTypeAtKey(tk, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
  var tileW = 282, tileH = 190;
  for (var k2 = 0; k2 < 9; k2++) {
    var cx = 90 + tileW / 2 + (k2 % 3) * (tileW + 26);
    var cy = 170 + tileH / 2 + Math.floor(k2 / 3) * (tileH + 26);
    var tile = roundRect(h2, "tile " + EFFECTS[k2], tileW, tileH, 30, [cx, cy], COL.pureWhite, 100);
    addDropShadow(tile, 14, 16, 40);
    var tf = tile.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color");
    var ck = [[0, COL.pureWhite], [onAt(k2), COL.pureWhite], [onAt(k2) + 0.15, COL.blue]];
    if (k2 !== 4) { ck.push([offAt(k2), COL.blue]); ck.push([offAt(k2) + 0.18, COL.pureWhite]); }
    keys(tf, ck, "linear");
    var tl = addText(h2, EFFECTS[k2], FONT_SANS_MED, 32, COL.charcoal, [cx, cy + 30], ParagraphJustification.CENTER_JUSTIFY);
    var tlf = addFillFx(tl, COL.charcoal);
    if (tlf) {
      var lk2 = [[0, [COL.charcoal[0], COL.charcoal[1], COL.charcoal[2], 1]], [onAt(k2) + 0.08, [1, 1, 1, 1]]];
      if (k2 !== 4) lk2.push([offAt(k2) + 0.09, [COL.charcoal[0], COL.charcoal[1], COL.charcoal[2], 1]]);
      keys(fxColor(tlf), lk2, "hold");
    }
    var dot = ellipse(h2, "dot " + EFFECTS[k2], 22, [cx, cy - 34], hex("DCD8D1"), 100);
    popIn(tile, S.half2.start + 0.15 + k2 * 0.03); popIn(tl, S.half2.start + 0.15 + k2 * 0.03); popIn(dot, S.half2.start + 0.15 + k2 * 0.03);
    if (k2 === 4) {
      keys(scl(tile), [[ws(81), [100, 100]], [ws(81) + 0.4, [110, 110]]]);
      var gl = addGlow(tile, 40, 0.8);
      if (gl) keys(gl.property("ADBE Glo2-0004"), [[ws(81) - 0.01, 0], [ws(81) + 0.4, 0.9]]);
    }
  }
  var sp3 = image(h2, G.sparkle, "sparkle (special)", [680, 400], 80, 0);
  if (sp3) popIn(sp3, ws(81) + 0.05, scl(sp3).value[0]);
  var sp4 = image(h2, G.sparkle, "sparkle 2 (special)", [400, 580], 52, 0);
  if (sp4) popIn(sp4, ws(81) + 0.18, scl(sp4).value[0]);

  // ---- FULL 2: spotlight / grab attention ----
  var f2 = makeComp("SC_FULL2_spotlight", W, H, fScenes);
  paperBG(f2, H);
  var gcs = [[200, 760, -4], [880, 700, 3], [190, 1210, 2], [900, 1180, -3]];
  for (var g1 = 0; g1 < gcs.length; g1++) {
    var gc = ghostCard(f2, "depth card " + (g1 + 1), 350, 230, [gcs[g1][0], gcs[g1][1]], gcs[g1][2], 0);
    popIn(gc, S.full2.start + 0.1 + g1 * 0.06);
    keys(opa(gc), [[ws(95), 80], [ws(95) + 0.3, 40]]);
  }
  ghostCard(f2, "depth card edge TL", 320, 230, [20, 380], -8, 4);
  ghostCard(f2, "depth card edge BR", 340, 240, [1050, 1620], 7, 4);
  var dim = f2.layers.addSolid([0.08, 0.07, 0.06], "spotlight dim", W, H, 1, DUR);
  tryDo("dim mask", function () {
    var m = dim.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    var shp = new Shape();
    var cxm = 540, cym = 980, rx = 330, ry = 300, kk = 0.5523;
    shp.vertices = [[cxm, cym - ry], [cxm + rx, cym], [cxm, cym + ry], [cxm - rx, cym]];
    shp.inTangents = [[-rx * kk, 0], [0, -ry * kk], [rx * kk, 0], [0, ry * kk]];
    shp.outTangents = [[rx * kk, 0], [0, ry * kk], [-rx * kk, 0], [0, -ry * kk]];
    shp.closed = true;
    m.property("ADBE Mask Shape").setValue(shp);
    m.property("ADBE Mask Feather").setValue([260, 260]);
    m.inverted = true;
  });
  keys(opa(dim), [[S.full2.start + 0.25, 0], [S.full2.start + 0.65, 38], [ws(95), 38], [ws(95) + 0.3, 50]]);
  var beam = shapeLayer(f2, "spotlight beam");
  var bm = addGroup(beam, "Beam");
  var bp = bm.addProperty("ADBE Vector Shape - Group");
  var bshape = new Shape();
  bshape.vertices = [[-40, 0], [40, 0], [300, 800], [-300, 800]];
  bshape.closed = true;
  bp.property("ADBE Vector Shape").setValue(bshape);
  addFill(bm, hex("FFF8E8"), 100);
  pos(beam).setValue([260, 680]);
  keys(rot(beam), [[S.full2.start + 0.3, 15], [S.full2.start + 1.2, -60], [ws(95) - 0.4, -15], [ws(95), -41]]);
  opa(beam).setValue(45);
  addBlur(beam, 22);
  var lamp = image(f2, G.spotlight_lamp, "spotlight lamp", [150, 720], 230, 25);
  if (lamp) addDropShadow(lamp, 25, 16, 30);
  var eye = image(f2, G.eye, "HERO eye", [540, 980], 360, 0);
  if (eye) {
    var es = scl(eye).value[0];
    keys(scl(eye), [[S.full2.start + 0.2, [0, 0]], [S.full2.start + 0.45, [es * 1.06, es * 1.06]], [S.full2.start + 0.6, [es, es]], [ws(95), [es, es]], [ws(95) + 0.3, [es * 1.12, es * 1.12]]]);
    tryDo("eye tint", function () {
      var tfx = eye.property("ADBE Effect Parade").addProperty("ADBE Tint");
      keys(tfx.property("ADBE Tint-0003"), [[ws(95) - 0.01, 100], [ws(95) + 0.3, 0]]);
    });
    addDropShadow(eye, 25, 30, 60);
  }
  sceneSans(f2, [84, 85], [540, 230], 52);
  sceneScript(f2, [86, 87], [540, 352], 120);
  sceneSans(f2, [88, 89, 90, 91, 92, 93, 94], [540, 1560], 44);
  sceneScript(f2, [95, 96], [540, 1680], 112, null, (function () { var o = {}; o[96] = "attention."; return o; })());

  // ---- HALF 3: harsh palette ----
  var h3 = makeComp("SC_HALF3_harsh", W, SPLIT, fScenes);
  paperBG(h3, SPLIT);
  addText(h3, "THE BEGINNER PALETTE", FONT_SANS_MED, 22, COL.muted, [540, 120], ParagraphJustification.CENTER_JUSTIFY, 220);
  var tubes = [["tube_black", "HARSH BLACK", "#000000", 107], ["tube_white", "HARSH WHITE", "#FFFFFF", 109], ["tube_red", "BRIGHT RED", "#FF1E1E", 111]];
  for (var tb = 0; tb < 3; tb++) {
    var tx = 290 + tb * 250;
    var tim = image(h3, G[tubes[tb][0]], tubes[tb][1] + " tube", [tx, 450], 190, (tb - 1) * 6);
    var tt = ws(tubes[tb][3]) - 0.05;
    if (tim) { addDropShadow(tim, 25, 20, 40); popIn(tim, tt, scl(tim).value[0]); }
    var tn = addText(h3, tubes[tb][1], FONT_SANS_SEMI, 24, COL.charcoal, [tx, 790], ParagraphJustification.CENTER_JUSTIFY, 120);
    var th = addText(h3, tubes[tb][2], FONT_SANS, 22, COL.muted, [tx, 828], ParagraphJustification.CENTER_JUSTIFY, 40);
    popIn(tn, tt); popIn(th, tt);
  }
  var stampR = roundRect(h3, "TOO HARSH frame", 260, 64, 12, [800, 250], COL.pureWhite, 70, COL.red, 4, 100);
  var stampT = addText(h3, "TOO HARSH", FONT_SANS_SEMI, 30, COL.red, [800, 261], ParagraphJustification.CENTER_JUSTIFY, 120);
  stampT.parent = stampR; pos(stampT).setValue([0, 11]);
  rot(stampR).setValue(-10);
  popIn(stampR, we(112) - 0.1);

  // ---- FULL 3: luxury brands → more high-end ----
  var f3a = makeComp("SC_FULL3_A_brands", W, H, fScenes);
  var BR = [
    ["TIFFANY & CO.", 790, 360, FONT_SERIF, 30, 300, COL.charcoal],
    ["ROLEX", 820, 550, FONT_SERIF, 40, 600, hex("2F5A43")],
    ["Cartier", 220, 590, FONT_SCRIPT, 50, 0, COL.charcoal],
    ["CHANEL", 830, 1220, FONT_SANS_SEMI, 36, 700, COL.charcoal],
    ["Dior", 250, 1270, FONT_SERIF, 58, 0, COL.charcoal],
    ["HERMÈS", 250, 380, FONT_SERIF, 32, 600, hex("7A5B3E")],
    ["LOUIS VUITTON", 820, 1420, FONT_SANS_MED, 24, 400, COL.charcoal]
  ];
  for (var b1 = 0; b1 < BR.length; b1++) {
    var bt = addText(f3a, BR[b1][0], BR[b1][3], BR[b1][4], BR[b1][6], [BR[b1][1], BR[b1][2]], ParagraphJustification.CENTER_JUSTIFY, BR[b1][5]);
    bt.name = "brand " + BR[b1][0];
    var bc = roundRect(f3a, "card " + BR[b1][0], 200, 80, 18, [BR[b1][1], BR[b1][2]], COL.pureWhite, 100);
    bc.moveAfter(bt);
    addDropShadow(bc, 16, 16, 40);
    tryDo("card size expr", function () {
      bc.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size").expression =
        'var r = thisComp.layer("' + bt.name + '").sourceRectAtTime(time, false); [r.width + 68, r.height + 44];';
      pos(bc).expression = 'var l = thisComp.layer("' + bt.name + '"); var r = l.sourceRectAtTime(time, false); l.toComp([r.left + r.width / 2, r.top + r.height / 2]);';
    });
    var bAt = ws(114) + b1 * 0.17;
    popIn(bt, bAt); popIn(bc, bAt);
  }
  sceneSans(f3a, [113, 114], [540, 800], 50);
  sceneSans(f3a, [115, 116], [540, 862], 50);
  sceneScript(f3a, [117, 118], [540, 990], 124, null, (function () { var o = {}; o[118] = "colors"; return o; })(), COL.dullBlue);
  var perf = image(f3a, G.perfume, "HERO perfume (dull blue)", [540, 1270], 210, 0);
  if (perf) { addDropShadow(perf, 25, 24, 50); popIn(perf, ws(117), scl(perf).value[0]); }
  var DULL = [["DULL BLUE", "#5D6F8F", COL.dullBlue, 119, 360], ["SAGE GREEN", "#7D8C76", COL.sage, 122, 720]];
  for (var d1 = 0; d1 < DULL.length; d1++) {
    var chip = roundRect(f3a, "chip " + DULL[d1][0], 320, 102, 24, [DULL[d1][4], 1640], COL.pureWhite, 100);
    addDropShadow(chip, 16, 16, 40);
    var sw = roundRect(f3a, "swatch " + DULL[d1][0], 70, 70, 18, [DULL[d1][4] - 109, 1640], DULL[d1][2], 100);
    var cn = addText(f3a, DULL[d1][0], FONT_SANS_SEMI, 22, COL.charcoal, [DULL[d1][4] - 54, 1632], ParagraphJustification.LEFT_JUSTIFY, 120);
    var chx = addText(f3a, DULL[d1][1], FONT_SANS, 20, COL.muted, [DULL[d1][4] - 54, 1662], ParagraphJustification.LEFT_JUSTIFY);
    var cAt = ws(DULL[d1][3]);
    sw.parent = chip; cn.parent = chip; chx.parent = chip;
    popIn(chip, cAt);
  }
  var f3b = makeComp("SC_FULL3_B_high_end", W, H, fScenes);
  f3b.bgColor = COL.paper;
  var duller = addText(f3b, "Duller colors always look", FONT_SERIF, 70, COL.charcoal, [540, 880], ParagraphJustification.CENTER_JUSTIFY);
  wordReveal(duller, [ws(124) - 0.04, ws(125) - 0.04, ws(126) - 0.04, ws(127) - 0.04], 20, 10);
  sceneScript(f3b, [128, 129], [540, 1030], 140, null, null, COL.dullBlue);
  var f3 = makeComp("SC_FULL3_high_end", W, H, fScenes);
  paperBG(f3, H);
  var la = f3.layers.add(f3a); la.name = "phase A: brands + dull colors";
  var lbB = f3.layers.add(f3b); lbB.name = "phase B: text only";
  var pb = ws(124) - 0.35;
  keys(opa(la), [[pb, 100], [pb + 0.35, 0]]);
  keys(scl(la), [[pb, [100, 100]], [pb + 0.35, [112, 112]]]);
  lbB.inPoint = pb;

  // =================== GRAPHICS (all overlays, alpha) ===================
  var gfx = makeComp("GRAPHICS", W, H, fComps);
  gfx.bgColor = [0, 0, 0];

  // UI instances (rise + fade + unblur per window)
  function uiInstance(srcComp, name, a, b) {
    var l = gfx.layers.add(srcComp);
    l.name = name;
    l.inPoint = a; l.outPoint = b + 0.05;
    keys(opa(l), [[a, 0], [a + 0.3, 100], [b - 0.14, 100], [b, 0]]);
    keys(pos(l), [[a, [540, 994]], [a + 0.36, [540, 960]]]);
    var bl = addBlur(l, 0);
    if (bl) keys(bl.property("ADBE Gaussian Blur 2-0001"), [[a, 10], [a + 0.36, 0]]);
    return l;
  }
  uiInstance(stepper, "UI stepper (hook)", 0.22, S.hook.end);
  uiInstance(slider, "UI slider", S.slider.start, S.slider.end);
  uiInstance(stepper, "UI stepper (1)", S.n1.start, S.n1.end);
  uiInstance(stepper, "UI stepper (2)", S.n2.start, S.n2.end);
  uiInstance(stepper, "UI stepper (3)", S.n3.start, S.n3.end);
  uiInstance(stepper, "UI stepper (recap)", S.recap.start, 49.86);
  uiInstance(slider, "UI slider (recap)", 49.86, DUR);

  // Name tag (E1, lower-left)
  var nt1 = addText(gfx, "Joseph Eid", FONT_SANS_SEMI, 34, COL.white, [70, 1675], ParagraphJustification.LEFT_JUSTIFY, -10);
  var nt2 = addText(gfx, "Video Editor · Ultimate Editors", FONT_SANS, 22, [0.95, 0.95, 0.95], [70, 1710], ParagraphJustification.LEFT_JUSTIFY);
  fadeWindow(nt1, 0.15, S.hook.end, 0.3, 0.15); fadeWindow(nt2, 0.15, S.hook.end, 0.3, 0.15);
  opa(nt2).expression = "value * 0.62";

  // Half scenes: slide down from the top
  function halfInstance(c, name, a, b) {
    var l = gfx.layers.add(c);
    l.name = name;
    l.inPoint = a; l.outPoint = b;
    keys(pos(l), [[a, [540, -480]], [a + 0.28, [540, 480]], [b - 0.2, [540, 480]], [b, [540, -480]]]);
    addDropShadow(l, 35, 10, 40);
    return l;
  }
  halfInstance(h1, "HALF 1: 25% smaller", S.half1.start, S.half1.end);
  halfInstance(h2, "HALF 2: less is more", S.half2.start, S.half2.end);
  halfInstance(h3, "HALF 3: harsh palette", S.half3.start, S.half3.end);

  // Captions: Setup (sans) → Payoff (script + glow) → Tail
  function modeAt(t) {
    if ((t >= S.half1.start && t < S.half1.end) || (t >= S.half2.start && t < S.half2.end) || (t >= S.half3.start && t < S.half3.end)) return "half";
    return "speaker";
  }
  function capText(g, list) { var p = []; for (var m = 0; m < list.length; m++) { var ov = g.text && g.text[String(list[m])]; p.push(ov ? ov : W_(list[m]).w); } return p.join(" "); }
  function capTimes(list) { var p = []; for (var m = 0; m < list.length; m++) p.push(ws(list[m]) - 0.04); return p; }
  for (var ci = 0; ci < D.captions.length; ci++) {
    var g = D.captions[ci];
    var gStart = ws(g.from) - 0.04;
    var next = D.captions[ci + 1];
    var gEnd = g.end !== undefined ? g.end : Math.min(next ? ws(next.from) - 0.04 : we(g.to) + 1, we(g.to) + 1.2);
    var mode = modeAt(gStart);
    var setup = [], payoff = [], tail = [];
    var stage = 0;
    for (var wi = g.from; wi <= g.to; wi++) {
      var isS = false;
      if (g.script) for (var z = 0; z < g.script.length; z++) if (g.script[z] === wi) isS = true;
      if (isS && stage === 0) stage = 1;
      if (!isS && stage === 1) stage = 2;
      (stage === 0 ? setup : (stage === 1 ? payoff : tail)).push(wi);
    }
    var topY = mode === "half" ? 1010 : 940;
    var sc = mode === "half" ? 90 : 100;
    var scriptSize = payoff.length >= 4 ? 64 : (payoff.length === 3 ? 74 : 104);
    var y = topY;
    var made = [];
    if (setup.length) {
      y += 46;
      var ls = addText(gfx, capText(g, setup), FONT_SANS, 46, COL.white, [540, y], ParagraphJustification.CENTER_JUSTIFY, -10);
      wordReveal(ls, capTimes(setup), 20, 10); addDropShadow(ls, 28, 2, 6); made.push(ls);
    }
    if (payoff.length) {
      y += scriptSize * (setup.length ? 0.9 : 1);
      var lp = addText(gfx, capText(g, payoff), FONT_SCRIPT, scriptSize, COL.accent, [540, y], ParagraphJustification.CENTER_JUSTIFY, -10);
      wordReveal(lp, capTimes(payoff), 20, 10); addGlow(lp, 22, 0.7); made.push(lp);
    }
    if (tail.length) {
      y += 56;
      var lt = addText(gfx, capText(g, tail), FONT_SANS, 46, COL.white, [540, y], ParagraphJustification.CENTER_JUSTIFY, -10);
      wordReveal(lt, capTimes(tail), 20, 10); addDropShadow(lt, 28, 2, 6); made.push(lt);
    }
    for (var mi = 0; mi < made.length; mi++) {
      var L = made[mi];
      L.name = "CAP " + (ci + 1) + ": " + L.name;
      L.inPoint = gStart; L.outPoint = gEnd;
      keys(opa(L), [[gEnd - 0.1, 100], [gEnd, 0]], "linear");
      if (sc !== 100) {
        anc(L).setValue([0, 0]);
        scl(L).setValue([sc, sc]);
        pos(L).setValue([540, topY + (pos(L).value[1] - topY) * sc / 100]);
      }
    }
  }

  // Full scenes: scale 0.94 → 1 + fade, slow push-in, fade out
  function fullInstance(c, name, a, b) {
    var l = gfx.layers.add(c);
    l.name = name;
    l.inPoint = a; l.outPoint = b;
    keys(opa(l), [[a, 0], [a + 0.12, 100], [b - 0.2, 100], [b, 0]]);
    keys(scl(l), [[a, [94, 94]], [a + 0.28, [100, 100]], [b, [104.5, 104.5]]]);
    return l;
  }
  fullInstance(f1, "FULL 1: video-centric", S.full1.start, S.full1.end);
  fullInstance(f2, "FULL 2: spotlight", S.full2.start, S.full2.end);
  fullInstance(f3, "FULL 3: high-end", S.full3.start, S.full3.end);

  // =================== REEL_01 (final) ===================
  var reel = makeComp("REEL_01", W, H, root);
  reel.bgColor = [0, 0, 0];
  var spk = reel.layers.add(speaker);
  spk.name = "SPEAKER (cuts)";
  anc(spk).setValue(FACE);
  pos(spk).setValue(FACE);
  // half-screen shift + zoom punch-in
  var pk = [[0, FACE]];
  var halves = [S.half1, S.half2, S.half3];
  for (var hv = 0; hv < halves.length; hv++) {
    pk.push([halves[hv].start, FACE]);
    pk.push([halves[hv].start + 0.28, [FACE[0], FACE[1] + HALF_SHIFT]]);
    pk.push([halves[hv].end - 0.2, [FACE[0], FACE[1] + HALF_SHIFT]]);
    pk.push([halves[hv].end, FACE]);
  }
  keys(pos(spk), pk);
  var zs = S.zoom.start, ze = S.zoom.end;
  keys(scl(spk), [[zs + 0.12, [100, 100]], [zs + 0.42, [116, 116]], [ze - 0.05, [120, 120]], [ze, [100, 100]]]);
  tryDo("zoom hold", function () {
    var sp = scl(spk);
    sp.setInterpolationTypeAtKey(sp.numKeys - 1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
  });

  // UI ke peeche: blur + darken (mid-frame se neeche)
  var uiWin = [[S.hook.start, S.n1.end], [S.n2.start, S.n2.end], [S.n3.start, S.n3.end], [S.recap.start, DUR + 1]];
  function dimKeys(prop, maxVal) {
    var kk2 = [];
    for (var u = 0; u < uiWin.length; u++) {
      kk2.push([Math.max(0, uiWin[u][0] + 0.05), 0]);
      kk2.push([uiWin[u][0] + 0.35, maxVal]);
      if (uiWin[u][1] < DUR) { kk2.push([uiWin[u][1] - 0.12, maxVal]); kk2.push([uiWin[u][1], 0]); }
    }
    keys(prop, kk2);
  }
  function lowerMask(layer) {
    tryDo("lower mask", function () {
      var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
      var shp = new Shape();
      shp.vertices = [[-60, H * 0.44 + 200], [W + 60, H * 0.44 + 200], [W + 60, H + 60], [-60, H + 60]];
      shp.closed = true;
      m.property("ADBE Mask Shape").setValue(shp);
      m.property("ADBE Mask Feather").setValue([0, 330]);
    });
  }
  var blurAdj = reel.layers.addSolid([1, 1, 1], "UI dim: blur", W, H, 1, DUR);
  blurAdj.adjustmentLayer = true;
  addBlur(blurAdj, 16);
  lowerMask(blurAdj);
  dimKeys(opa(blurAdj), 100);
  var darkSolid = reel.layers.addSolid([0.016, 0.03, 0.055], "UI dim: darken", W, H, 1, DUR);
  lowerMask(darkSolid);
  dimKeys(opa(darkSolid), 58);
  // caption readability gradient (always)
  var readG = reel.layers.addSolid([0, 0, 0], "readability gradient", W, H, 1, DUR);
  tryDo("readability mask", function () {
    var m = readG.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    var shp = new Shape();
    shp.vertices = [[-60, H * 0.62], [W + 60, H * 0.62], [W + 60, H + 60], [-60, H + 60]];
    shp.closed = true;
    m.property("ADBE Mask Shape").setValue(shp);
    m.property("ADBE Mask Feather").setValue([0, 420]);
  });
  opa(readG).setValue(28);

  var gl2 = reel.layers.add(gfx);
  gl2.name = "GRAPHICS";

  // =================== SOUND DESIGN (Lesson 09) ===================
  var families = [["WHOOSHES", D.sfx.WHOOSHES, 9], ["TEXTURES", D.sfx.TEXTURES, 11], ["RISERS", D.sfx.RISERS, 1], ["HITS", D.sfx.HITS, 13]];
  for (var fa = families.length - 1; fa >= 0; fa--) {
    var list = families[fa][1];
    for (var cu = 0; cu < list.length; cu++) {
      var cue = list[cu];
      var item = SFX[cue.file];
      if (!item) continue;
      var al = reel.layers.add(item);
      al.name = families[fa][0] + ": " + cue.note;
      al.startTime = cue.at - (cue.offset || 0);
      al.label = families[fa][2];
      tryDo("audio level", function () { al.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([cue.db, cue.db]); });
      al.moveToEnd();
    }
  }

  // Markers (scene starts)
  var markerNames = [["hook", "HOOK (on-screen)"], ["slider", "On-screen: slider"], ["n1", "On-screen: Number 1"], ["full1", "FULL: video-centric"], ["zoom", "Zoom punch-in"], ["half1", "HALF: 25% smaller"], ["n2", "On-screen: Number 2"], ["half2", "HALF: less is more"], ["full2", "FULL: spotlight"], ["n3", "On-screen: Number 3"], ["half3", "HALF: harsh palette"], ["full3", "FULL: high-end"], ["recap", "Recap"]];
  tryDo("markers", function () {
    var mp = reel.markerProperty;
    for (var mk = 0; mk < markerNames.length; mk++) mp.setValueAtTime(S[markerNames[mk][0]].start, new MarkerValue(markerNames[mk][1]));
  });

  app.endUndoGroup();
  reel.openInViewer();

  var msg = "REEL_01 ban gaya!\n\nProject panel → REEL_01 folder.\nRender: Composition → Add to Render Queue (H.264 / ProRes).\nPremiere ke liye: GRAPHICS comp ko 'ProRes 4444 + Alpha' me render karo.";
  if (warnings.length) msg += "\n\nKuch warnings (" + warnings.length + "):\n" + warnings.slice(0, 12).join("\n");
  alert(msg);
})();
