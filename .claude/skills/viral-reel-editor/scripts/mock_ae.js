// Mock After Effects host: AE script ko node me shuru se ant tak chalata hai.
// Reference / data errors pakadta hai (AE ke asli parameter indices nahi — wo script me try/catch me hain).
// Usage: node mock_ae.js <path/to/build.jsx>     (//@include "x" wali files same folder se inline hoti hain)
const fs = require("fs"), vm = require("vm"), path = require("path");
const jsx = process.argv[2];
if (!jsx) { console.error("usage: node mock_ae.js <build.jsx>"); process.exit(2); }
let calls = 0;
const handler = {
  get(t, k) {
    if (k === Symbol.toPrimitive) return (hint) => (hint === "string" ? "mock" : 1);
    if (k === "numKeys" || k === "numProperties" || k === "width" || k === "height") return 1;
    if (k === "propertyValueType") return "COLOR";
    if (k === "exists") return true;
    if (k === "fsName") return "/kit";
    if (k === "length") return 0;
    if (k === "then") return undefined;
    if (!(k in t)) t[k] = mk();
    return t[k];
  },
  set(t, k, v) { t[k] = v; return true; },
  apply() { calls++; return mk(); },
  construct() { return mk(); },
};
function mk() { return new Proxy(function () {}, handler); }
const ctx = {
  app: mk(), $: { fileName: "/kit/after-effects/" + path.basename(jsx) },
  File: function () { return mk(); }, ImportOptions: function () { return mk(); },
  KeyframeEase: function () {}, Shape: function () {}, MarkerValue: function () {},
  PropertyValueType: { TwoD_SPATIAL: "2DS", ThreeD_SPATIAL: "3DS", COLOR: "COLOR" },
  KeyframeInterpolationType: { HOLD: 1, LINEAR: 2 },
  ParagraphJustification: { CENTER_JUSTIFY: 1, LEFT_JUSTIFY: 2, RIGHT_JUSTIFY: 3 },
  BlendingMode: { MULTIPLY: 1, OVERLAY: 2 }, TrackMatteType: { ALPHA: 1 },
  alert: (m) => console.log("ALERT:\n" + m), console,
};
ctx.File.openDialog = () => null;
let src = fs.readFileSync(jsx, "utf8").replace(/\/\/@include "([^"]+)"/g, (_, f) => fs.readFileSync(path.join(path.dirname(jsx), f), "utf8"));
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: path.basename(jsx) });
console.log("mock AE run OK, host calls:", calls);
