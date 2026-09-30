// jsdom has no image decoder or canvas; stub just enough to exercise the page.
export function stubCanvas(w) {
  const ops = [];
  w.createImageBitmap = async (f) => {
    if (f.name.includes("broken")) throw new Error("decode");
    return { width: 4, height: 3, close() {} };
  };
  w.HTMLCanvasElement.prototype.getContext = function () {
    return new Proxy({}, {
      get: (t, k) => (k in t ? t[k] : (...a) => ops.push([k, ...a])),
      set: (t, k, v) => { ops.push(["set:" + String(k), v]); t[k] = v; return true; },
    });
  };
  w.HTMLCanvasElement.prototype.toBlob = function (cb, type) {
    cb({ type, arrayBuffer: async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9]).buffer });
  };
  const B = w.Blob;
  w.Blob = class extends B { constructor(p, o) { super(p, o); this.parts = p; } };
  const downloads = [];
  w.URL.createObjectURL = (b) => { downloads.push(b); return "blob:x"; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () { downloads.at(-1).download = this.download; };
  return { ops, downloads };
}

export function file(w, name, size = 10) {
  return new w.File([new Uint8Array(size)], name, { type: "image/webp" });
}

// Minimal stored-zip reader for checking our own output.
export function readZip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let e = u8.length - 22;
  while (dv.getUint32(e, true) !== 0x06054b50) e--;
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const out = [];
  for (let i = 0; i < n; i++) {
    const flags = dv.getUint16(p + 8, true), nl = dv.getUint16(p + 28, true);
    const el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    const nameBytes = u8.slice(p + 46, p + 46 + nl);
    out.push({ name: new TextDecoder().decode(nameBytes), flags, size: dv.getUint32(p + 24, true) });
    p += 46 + nl + el + cl;
  }
  return out;
}
