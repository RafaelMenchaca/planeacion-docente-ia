const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const readProjectFile = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

describe("Batch compatibility redirect", () => {
  test("keeps the compatibility page as a self-contained Dashboard redirect", () => {
    const batchHtml = readProjectFile("pages/batch.html");

    expect(batchHtml).toMatch(
      /<meta\s+http-equiv="refresh"\s+content="0; url=dashboard\.html"\s*\/?>/i,
    );
    expect(batchHtml).toContain('window.location.replace("dashboard.html")');
    expect(batchHtml).toContain('href="dashboard.html"');
    expect(batchHtml).not.toMatch(/location\.(?:search|hash)/);
    expect(batchHtml).not.toMatch(/dashboard\.html[?#]/);
    expect(batchHtml).not.toMatch(/batch\.(?:page|ui)\.js|batch\.css/i);
  });

  test("removes the unreachable Batch implementation and dispatch", () => {
    expect(fs.existsSync(path.join(rootDir, "js/pages/batch.page.js"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, "js/ui/batch.ui.js"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, "css/batch.css"))).toBe(false);

    const mainJs = readProjectFile("js/main.js");
    expect(mainJs).not.toMatch(/initBatchPage/);
    expect(mainJs).not.toMatch(/["']batch\.html["']\s*:/);
  });
});
