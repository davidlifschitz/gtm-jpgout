import { describe, it, expect } from "vitest";
import { load } from "./load.js";
import { stubCanvas, file, readZip } from "./stubs.js";

const flush = () => new Promise((r) => setTimeout(r, 0));

async function convert(w, files) {
  w.setFiles(files);
  w.document.getElementById("run").click();
  for (let i = 0; i < 20; i++) await flush();
}

describe("zip", () => {
  it("crc32 matches the standard check value", () => {
    const w = load();
    expect(w.crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
  it("writes a readable stored zip", () => {
    const w = load();
    const z = w.zipStore([{ name: "a.jpg", data: new Uint8Array([1, 2, 3]) }, { name: "b.jpg", data: new Uint8Array([4]) }]);
    expect(readZip(z).map((e) => [e.name, e.size])).toEqual([["a.jpg", 3], ["b.jpg", 1]]);
  });
});

describe("page", () => {
  it("converts one file to a single jpeg download", async () => {
    const w = load();
    const { downloads } = stubCanvas(w);
    await convert(w, [file(w, "cat.webp")]);
    expect(downloads.at(-1).type).toBe("image/jpeg");
    expect(downloads.at(-1).download).toBe("cat.jpg");
    expect(w.document.getElementById("log").textContent).toContain("cat.webp → cat.jpg (4×3)");
  });
  it("zips several files and logs the ones that fail", async () => {
    const w = load();
    const { downloads } = stubCanvas(w);
    await convert(w, [file(w, "a.webp"), file(w, "broken.heic"), file(w, "b.webp")]);
    expect(downloads.at(-1).download).toBe("jpgout.zip");
    expect(w.document.getElementById("log").textContent).toContain("broken.heic failed");
  });
  it("rejects files over 8 MB", () => {
    const w = load();
    stubCanvas(w);
    w.setFiles([file(w, "big.webp", 8 * 1024 * 1024 + 1), file(w, "ok.webp")]);
    expect(w.document.getElementById("warn").textContent).toContain("big.webp is over 8 MB");
    expect(w.document.getElementById("run").disabled).toBe(false);
  });
});
