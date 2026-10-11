// Mock Photoshop host: build_psd_scenes.jsx ko node me shuru se ant tak chalata hai (asli kit folder ke saath).
// Reference / data / missing-file errors pakadta hai; asli Photoshop rendering nahi.
// Usage: node mock_ps.js <build_psd_scenes.jsx> <kit_dir>
const fs = require("fs"), vm = require("vm"), path = require("path");
const [jsx, kit] = process.argv.slice(2);
if (!jsx || !kit) { console.error("usage: node mock_ps.js <build_psd_scenes.jsx> <kit_dir>"); process.exit(2); }
let calls = 0;
const handler = {
  get(t, k) {
    if (k === Symbol.toPrimitive) return (hint) => (hint === "string" ? "mock" : 1);
    if (k === "length") return 0;
    if (k === "then") return undefined;
    if (k === "bounds") return [0, 0, 100, 100].map((v) => ({ as: () => v }));
    if (!(k in t)) t[k] = mk();
    return t[k];
  },
  set(t, k, v) { t[k] = v; return true; },
  apply() { calls++; return mk(); },
  construct() { return mk(); },
};
function mk() { return new Proxy(function () {}, handler); }
function MockFile(p) {
  p = String(p).replace(/^\/kit/, path.resolve(kit));
  const f = { fsName: p, exists: fs.existsSync(p), encoding: "", open() { return true; }, close() {},
    read() { return fs.readFileSync(p, "utf8"); } };
  Object.defineProperty(f, "parent", { get: () => MockFile(path.dirname(p)) });
  return f;
}
const enums = new Proxy({}, { get: (t, k) => k });
const ctx = {
  app: mk(), $: { fileName: "/kit/photoshop/" + path.basename(jsx) },
  File: MockFile, Folder: function (p) { const f = MockFile(p); f.create = () => true; return f; },
  SolidColor: function () { return { rgb: {} }; }, ActionDescriptor: mk, ActionReference: mk,
  charIDToTypeID: () => 1, stringIDToTypeID: () => 1, executeAction: () => { calls++; },
  PhotoshopSaveOptions: function () {}, PNGSaveOptions: function () {},
  Units: enums, TypeUnits: enums, DialogModes: enums, NewDocumentMode: enums, DocumentFill: enums,
  ElementPlacement: enums, AnchorPosition: enums, SelectionType: enums, RasterizeType: enums,
  BlendMode: enums, NoiseDistribution: enums, LayerKind: enums, Justification: enums,
  alert: (m) => console.log("ALERT:\n" + m), console,
};
ctx.File.openDialog = () => null;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(jsx, "utf8"), ctx, { filename: path.basename(jsx) });
console.log("mock PS run OK, host calls:", calls);
