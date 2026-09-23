/**
 * ينشئ مستودع GitHub ويرفع المشروع
 */
const { execSync } = require("child_process");

const TOKEN = process.env.GH_TOKEN;
const REPO_NAME = "ghazl";
const DESCRIPTION = "غَزْل — منصة متاجر إلكترونية متعددة المستأجرين (Multi-Tenant E-commerce SaaS) — بديل عربي لمنصة سلة، مبني بالكامل بـ Next.js + Prisma + MySQL";

async function main() {
  console.log("3️⃣ إنشاء مستودع GitHub...\n");

  const body = JSON.stringify({
    name: REPO_NAME,
    description: DESCRIPTION,
    private: false,
    has_issues: true,
    has_projects: false,
    has_wiki: true,
  });

  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body,
  });

  const data = await res.json();

  if (data.html_url) {
    console.log("  ✅ تم إنشاء المستودع");
    console.log("  🔗", data.html_url);
    console.log("  clone_url:", data.clone_url);
  } else if (data.message && data.message.includes("already exists")) {
    console.log("  ⚠️ المستودع موجود مسبقاً");
    console.log("  🔗 https://github.com/hrjapp/" + REPO_NAME);
  } else {
    console.log("  ❌ فشل:", data.message);
    if (data.errors) console.log(JSON.stringify(data.errors, null, 1));
    process.exit(1);
  }
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
