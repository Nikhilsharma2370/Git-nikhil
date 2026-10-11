/*
  build_psd_scenes.jsx — Photoshop me har scene ka LAYERED PSD banata hai (house style).
  Chalana: Photoshop → File → Scripts → Browse… → ye file.

  Kit folder (is script ke parent ka parent):
    scene-spec.json     scenes ki list (neeche format)
    graphics/*.png      Gemini cutouts
    psd/                output: <scene>.psd + <scene>.png preview (khud banta hai)

  Har PSD me groups:
    BACKGROUND  paper · grid · casted shadow · vignette · grain
    DEPTH       edge par kate hue objects / ghost cards (halka blur)
    HERO        main object (Smart Object, drop shadow)
    SUPPORT     supporting objects
    TEXT        editable text layers (Inter / EB Garamond Bold Italic)
  Sab kuch EDITABLE rehta hai: text = live text layer, graphics = Smart Object, shadow = Layer Style.
  After Effects: File → Import → <scene>.psd → Import As: "Composition - Retain Layer Sizes",
  Layer Options: "Editable Layer Styles" → har layer alag milta hai, animate karo.
  AE me text editable banana: text layer select → Layer → Create → Convert to Editable Text.

  scene-spec.json format:
  { "scenes": [ { "name": "SC_FULL2_spotlight", "width": 1080, "height": 1920, "accent": "3D7BFF",
      "layers": [
        { "group": "HERO", "type": "image", "file": "eye.png", "x": 540, "y": 980, "w": 360, "rot": 0, "shadow": true },
        { "group": "TEXT", "type": "text", "text": "Reserve your", "font": "Inter-Regular", "size": 52,
          "color": "2E2C2A", "x": 540, "y": 230, "justify": "center" },
        { "group": "SUPPORT", "type": "rect", "x": 540, "y": 1400, "w": 300, "h": 8, "color": "3D7BFF" },
        { "group": "DEPTH", "type": "card", "x": 200, "y": 760, "w": 350, "h": 230, "rot": -4, "blur": 3 } ] } ] }
  x / y = center (image, card) ya baseline anchor (text). Colors hex bina "#".
*/
(function () {
  var KIT = File($.fileName).parent.parent;
  var warnings = [];
  var ACCENT = "3D7BFF";
  function tryDo(label, fn) { try { return fn(); } catch (e) { warnings.push(label + ": " + e.toString()); return null; } }

  function readJSON(f) {
    f.encoding = "UTF-8";
    f.open("r");
    var s = f.read();
    f.close();
    return eval("(" + s + ")");
  }
  var specFile = new File(KIT.fsName + "/scene-spec.json");
  if (!specFile.exists) specFile = File.openDialog("scene-spec.json chuno");
  if (!specFile) { alert("scene-spec.json nahi mili."); return; }
  var SPEC = readJSON(specFile);
  var outDir = new Folder(KIT.fsName + "/psd");
  if (!outDir.exists) outDir.create();

  var oldRuler = app.preferences.rulerUnits, oldType = app.preferences.typeUnits;
  app.preferences.rulerUnits = Units.PIXELS;
  app.preferences.typeUnits = TypeUnits.PIXELS;
  app.displayDialogs = DialogModes.NO;

  function color(hex) { var c = new SolidColor(); c.rgb.hexValue = hex.replace("#", ""); return c; }
  function rectSel(doc, x, y, w, h) { doc.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); }
  function rotatedRect(doc, cx, cy, w, h, deg) {
    var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), pts = [], corners = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    for (var i = 0; i < 4; i++) pts.push([cx + corners[i][0] * c - corners[i][1] * s, cy + corners[i][0] * s + corners[i][1] * c]);
    return pts;
  }
  function group(doc, name) {
    for (var i = 0; i < doc.layerSets.length; i++) if (doc.layerSets[i].name === name) return doc.layerSets[i];
    var g = doc.layerSets.add(); g.name = name; return g;
  }
  function newLayer(doc, name, grp) {
    var l = doc.artLayers.add(); l.name = name;
    if (grp) l.move(grp, ElementPlacement.INSIDE);
    return l;
  }
  function dropShadow(opacityPct, distance, size) {
    // Layer Style → Drop Shadow (active layer)
    var d = new ActionDescriptor(), r = new ActionReference();
    r.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Lefx"));
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    d.putReference(charIDToTypeID("null"), r);
    var fx = new ActionDescriptor(), ds = new ActionDescriptor();
    ds.putBoolean(charIDToTypeID("enab"), true);
    ds.putEnumerated(charIDToTypeID("Md  "), charIDToTypeID("BlnM"), charIDToTypeID("Mltp"));
    var c = new ActionDescriptor();
    c.putDouble(charIDToTypeID("Rd  "), 40); c.putDouble(charIDToTypeID("Grn "), 34); c.putDouble(charIDToTypeID("Bl  "), 26);
    ds.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), c);
    ds.putUnitDouble(charIDToTypeID("Opct"), charIDToTypeID("#Prc"), opacityPct);
    ds.putBoolean(charIDToTypeID("uglg"), false);
    ds.putUnitDouble(charIDToTypeID("lagl"), charIDToTypeID("#Ang"), 90);
    ds.putUnitDouble(charIDToTypeID("Dstn"), charIDToTypeID("#Pxl"), distance);
    ds.putUnitDouble(charIDToTypeID("Ckmt"), charIDToTypeID("#Pxl"), 0);
    ds.putUnitDouble(charIDToTypeID("blur"), charIDToTypeID("#Pxl"), size);
    fx.putUnitDouble(charIDToTypeID("Scl "), charIDToTypeID("#Prc"), 100);
    fx.putObject(charIDToTypeID("DrSh"), charIDToTypeID("DrSh"), ds);
    d.putObject(charIDToTypeID("T   "), charIDToTypeID("Lefx"), fx);
    executeAction(charIDToTypeID("setd"), d, DialogModes.NO);
  }
  function placeSmart(file) {
    var d = new ActionDescriptor();
    d.putPath(charIDToTypeID("null"), file);
    d.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
    executeAction(charIDToTypeID("Plc "), d, DialogModes.NO);
  }
  function boundsPx(l) { var b = l.bounds; return [b[0].as("px"), b[1].as("px"), b[2].as("px"), b[3].as("px")]; }

  // ---------- Lesson 06 step 1: background ----------
  function background(doc, W, H) {
    var g = group(doc, "BACKGROUND");
    var paper = doc.artLayers[doc.artLayers.length - 1]; // document background
    tryDo("paper", function () { doc.activeLayer = paper; doc.selection.selectAll(); doc.selection.fill(color("F1EFEA")); doc.selection.deselect(); });
    var grid = newLayer(doc, "grid (90px)", g);
    doc.activeLayer = grid;
    for (var x = 0; x <= W; x += 90) { rectSel(doc, x - 0.75, 0, 1.5, H); doc.selection.fill(color("2E2C2A")); }
    for (var y = 0; y <= H; y += 90) { rectSel(doc, 0, y - 0.75, W, 1.5); doc.selection.fill(color("2E2C2A")); }
    doc.selection.deselect();
    grid.opacity = 6.5;
    var sh = newLayer(doc, "casted shadow (window blinds)", g);
    doc.activeLayer = sh;
    for (var k = 0; k < 8; k++) {
      doc.selection.select(rotatedRect(doc, -200 + k * 230, H / 2, 80, H * 2.2, 28));
      doc.selection.fill(color("3D3328"));
    }
    doc.selection.deselect();
    tryDo("shadow blur", function () { sh.applyGaussianBlur(40); });
    sh.opacity = 7;
    var vg = newLayer(doc, "vignette", g);
    doc.activeLayer = vg;
    tryDo("vignette", function () {
      doc.selection.selectAll();
      doc.selection.select([[W * 0.1, H * 0.12], [W * 0.9, H * 0.12], [W * 0.9, H * 0.72], [W * 0.1, H * 0.72]], SelectionType.DIMINISH, 0, false);
      doc.selection.feather(260); doc.selection.fill(color("5A4E42")); doc.selection.deselect();
    });
    vg.blendMode = BlendMode.MULTIPLY; vg.opacity = 14;
    var gr = newLayer(doc, "grain", g);
    doc.activeLayer = gr;
    doc.selection.selectAll(); doc.selection.fill(color("808080")); doc.selection.deselect();
    tryDo("grain noise", function () { gr.applyAddNoise(8, NoiseDistribution.GAUSSIAN, true); });
    gr.blendMode = BlendMode.OVERLAY; gr.opacity = 12;
  }

  function addImage(doc, L) {
    var f = new File(KIT.fsName + "/graphics/" + L.file);
    if (!f.exists) { warnings.push("missing graphic: " + L.file); return; }
    placeSmart(f);
    var l = doc.activeLayer;
    l.name = (L.name || L.file.replace(".png", ""));
    var b = boundsPx(l), w = b[2] - b[0];
    if (L.w && w > 0) l.resize(L.w / w * 100, L.w / w * 100, AnchorPosition.MIDDLECENTER);
    if (L.rot) l.rotate(L.rot, AnchorPosition.MIDDLECENTER);
    b = boundsPx(l);
    l.translate(L.x - (b[0] + b[2]) / 2, L.y - (b[1] + b[3]) / 2);
    l.move(group(doc, L.group || "HERO"), ElementPlacement.INSIDE);
    if (L.shadow !== false) tryDo("drop shadow " + l.name, function () { doc.activeLayer = l; dropShadow(26, 22, 40); });
    if (L.blur) tryDo("blur " + l.name, function () { l.rasterize(RasterizeType.ENTIRELAYER); l.applyGaussianBlur(L.blur); });
    if (L.opacity) l.opacity = L.opacity;
  }
  function addCard(doc, L) {
    var l = newLayer(doc, L.name || "ghost card", group(doc, L.group || "DEPTH"));
    doc.activeLayer = l;
    doc.selection.select(rotatedRect(doc, L.x, L.y, L.w, L.h, L.rot || 0));
    doc.selection.fill(color(L.color || "FFFFFF"));
    doc.selection.deselect();
    tryDo("card shadow", function () { dropShadow(16, 14, 36); });
    if (L.blur) tryDo("card blur", function () { l.applyGaussianBlur(L.blur); });
    l.opacity = L.opacity || 80;
  }
  function addRect(doc, L) {
    var l = newLayer(doc, L.name || "shape", group(doc, L.group || "SUPPORT"));
    doc.activeLayer = l;
    doc.selection.select(rotatedRect(doc, L.x, L.y, L.w, L.h, L.rot || 0));
    doc.selection.fill(color(L.color || ACCENT));
    doc.selection.deselect();
    if (L.opacity) l.opacity = L.opacity;
  }
  function addText(doc, L) {
    var l = doc.artLayers.add();
    l.kind = LayerKind.TEXT;
    var t = l.textItem;
    t.contents = L.text;
    tryDo("font " + L.font, function () { t.font = L.font; });
    t.size = L.size;
    t.color = color(L.color || "2E2C2A");
    t.justification = L.justify === "left" ? Justification.LEFT : (L.justify === "right" ? Justification.RIGHT : Justification.CENTER);
    if (L.tracking !== undefined) t.tracking = L.tracking;
    t.position = [L.x, L.y];
    l.name = L.name || L.text;
    l.move(group(doc, L.group || "TEXT"), ElementPlacement.INSIDE);
  }

  for (var i = 0; i < SPEC.scenes.length; i++) {
    var S = SPEC.scenes[i];
    var W = S.width || 1080, H = S.height || 1920;
    var doc = app.documents.add(W, H, 72, S.name, NewDocumentMode.RGB, DocumentFill.WHITE);
    background(doc, W, H);
    ACCENT = (S.accent || "3D7BFF").replace("#", "");
    var order = ["DEPTH", "SUPPORT", "HERO", "TEXT"]; // neeche se upar
    for (var o = 0; o < order.length; o++) group(doc, order[o]).move(doc, ElementPlacement.PLACEATBEGINNING);
    for (var j = 0; j < S.layers.length; j++) {
      var L = S.layers[j];
      tryDo(S.name + " layer " + j, function () {
        if (L.type === "image") addImage(doc, L);
        else if (L.type === "card") addCard(doc, L);
        else if (L.type === "rect") addRect(doc, L);
        else if (L.type === "text") addText(doc, L);
      });
    }
    tryDo("save psd " + S.name, function () { doc.saveAs(new File(outDir.fsName + "/" + S.name + ".psd"), new PhotoshopSaveOptions(), false); });
    tryDo("save png " + S.name, function () { var o2 = new PNGSaveOptions(); doc.saveAs(new File(outDir.fsName + "/" + S.name + ".png"), o2, true); });
  }

  app.preferences.rulerUnits = oldRuler;
  app.preferences.typeUnits = oldType;
  var msg = SPEC.scenes.length + " scene PSD ban gaye: " + outDir.fsName + "\nAfter Effects: File → Import → PSD → Composition - Retain Layer Sizes.";
  if (warnings.length) msg += "\n\nWarnings (" + warnings.length + "):\n" + warnings.slice(0, 12).join("\n");
  alert(msg);
})();
