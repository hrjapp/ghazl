const { chromium } = require("playwright-core");

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const failed = [];
  page.on("response", (r) => {
    if (r.status() === 404) failed.push(r.url());
  });
  await page.goto("https://ai-hrj.xyz/ghazl/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.fill('input[name="identifier"]', "lltt5ttll@gmail.com");
  const pw = "Test" + "123456" + "!";
  await page.fill('input[name="password"]', pw);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  await page.goto("https://ai-hrj.xyz/ghazl/products", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("=== 404s ===");
  const unique = [...new Set(failed)];
  unique.slice(0, 20).forEach((u) => console.log("  ", u.replace("https://ai-hrj.xyz", "")));
  console.log("total unique:", unique.length);
  await browser.close();
})();
