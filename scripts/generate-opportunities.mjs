/**
 * Generates realistic expert-estimate opportunity rows for MVP seed.
 * Run: node scripts/generate-opportunities.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const templates = [
  {
    nicheId: "ai-agents",
    clusters: [
      ["AI business automation agency", "AI agent for customer support", "custom GPT for sales team"],
      ["hire AI automation consultant", "LangChain agency", "AI workflow automation services"],
      ["AI receptionist for clinics", "voice AI agent for real estate", "WhatsApp AI chatbot agency"],
    ],
    offer: "Vertical AI agent + integration (CRM/helpdesk)",
    prices: { default: "$2,500–$12,000 setup + $500–$2,000/mo", cis: "150–800k ₽ / 800k–4M ₸" },
    base: { volume: 4200, trend: "growing", competition: "medium", intent: "high", margin: "high", entry: "medium", rec: "launch" },
  },
  {
    nicheId: "cybersecurity",
    clusters: [
      ["vCISO for SMB", "SOC 2 compliance consultant", "ISO 27001 implementation services"],
      ["penetration testing company", "cloud security assessment", "ransomware recovery consultant"],
      ["cybersecurity audit for startups", "GDPR security consulting", "MSSP for mid-market"],
    ],
    offer: "vCISO retainer or compliance readiness package",
    prices: { default: "$3,000–$15,000 / engagement; $2k–$8k/mo retainer", cis: "200–1.2M ₽" },
    base: { volume: 3600, trend: "growing", competition: "medium", intent: "high", margin: "high", entry: "high", rec: "launch" },
  },
  {
    nicheId: "nocode",
    clusters: [
      ["Bubble.io developer for hire", "no-code MVP agency", "FlutterFlow app development"],
      ["Airtable consultant", "Glide app developer", "no-code internal tools agency"],
      ["Webflow enterprise partner", "Softr portal development", "no-code CRM setup"],
    ],
    offer: "No-code MVP or internal tool in 2–6 weeks",
    prices: { default: "$1,500–$8,000 / project", cis: "80–450k ₽" },
    base: { volume: 5100, trend: "stable", competition: "medium", intent: "high", margin: "medium", entry: "low", rec: "test" },
  },
  {
    nicheId: "devops",
    clusters: [
      ["FinOps consulting AWS", "Kubernetes managed services", "CI/CD pipeline setup agency"],
      ["Terraform consulting", "SRE fractional hire", "cloud cost optimization consultant"],
      ["platform engineering agency", "GitOps implementation", "observability stack setup"],
    ],
    offer: "Cloud cost + reliability sprint or fractional SRE",
    prices: { default: "$4,000–$20,000 / sprint; $5k–$12k/mo", cis: "250–1.5M ₽" },
    base: { volume: 2800, trend: "growing", competition: "medium", intent: "high", margin: "high", entry: "high", rec: "launch" },
  },
  {
    nicheId: "seo-marketing",
    clusters: [
      ["CRO audit agency", "performance marketing for SaaS", "Shopify conversion rate optimization"],
      ["technical SEO audit services", "B2B lead gen agency", "Google Ads management for agencies"],
      ["landing page CRO consultant", "paid social agency for DTC", "SEO content strategy retainer"],
    ],
    offer: "CRO audit + 90-day growth sprint",
    prices: { default: "$1,200–$6,000 audit; $2k–$10k/mo", cis: "60–350k ₽" },
    base: { volume: 6200, trend: "stable", competition: "high", intent: "high", margin: "medium", entry: "medium", rec: "test" },
  },
  {
    nicheId: "web-dev",
    clusters: [
      ["Next.js agency", "SaaS product development company", "hire React developers agency"],
      ["mobile app development cost", "Flutter agency near me", "headless Shopify development"],
      ["custom CRM development", "API integration agency", "white-label software development"],
    ],
    offer: "Product squad for SaaS MVP or redesign",
    prices: { default: "$15,000–$80,000 / MVP", cis: "500k–4M ₽" },
    base: { volume: 8900, trend: "stable", competition: "high", intent: "high", margin: "medium", entry: "medium", rec: "not_now" },
  },
  {
    nicheId: "design",
    clusters: [
      ["design system agency", "UI UX redesign SaaS", "product design sprint"],
      ["Figma design system kit custom", "UX audit for marketplace", "branding for SaaS startups"],
      ["mobile app UI design agency", "conversion-focused landing design", "design ops consulting"],
    ],
    offer: "Design system + key product flows",
    prices: { default: "$3,000–$18,000", cis: "120–700k ₽" },
    base: { volume: 3400, trend: "stable", competition: "medium", intent: "medium", margin: "medium", entry: "medium", rec: "test" },
  },
  {
    nicheId: "notion-systems",
    clusters: [
      ["Notion template for agencies", "Notion CRM template", "Notion project management system"],
      ["Notion OS for freelancers", "company wiki Notion template", "Notion second brain template"],
      ["Notion client portal template", "content calendar Notion", "HR OS Notion template"],
    ],
    offer: "Niche Notion OS + setup call",
    prices: { default: "$29–$199 template; $300–$1,500 setup", cis: "990–6,990 ₽; 15–60k ₽ setup" },
    base: { volume: 7200, trend: "stable", competition: "high", intent: "medium", margin: "high", entry: "low", rec: "test" },
  },
  {
    nicheId: "prompts",
    clusters: [
      ["ChatGPT prompts for marketing", "custom GPT for real estate", "AI prompt pack for lawyers"],
      ["Claude prompts for coding", "AI agent templates Gumroad", "prompt engineering pack sales"],
      ["GPT store agent for ecom", "AI writing prompts bundle", "industry GPT chatbot template"],
    ],
    offer: "Vertical prompt pack / custom GPT",
    prices: { default: "$17–$97; premium $149–$499", cis: "490–4,990 ₽" },
    base: { volume: 9800, trend: "declining", competition: "high", intent: "medium", margin: "medium", entry: "low", rec: "not_now" },
  },
  {
    nicheId: "courses",
    clusters: [
      ["AI automation course for agencies", "no-code SaaS course", "ChatGPT for business course"],
      ["cybersecurity bootcamp online", "FinOps training for engineers", "make.com course for freelancers"],
      ["SEO course for SaaS founders", "prompt engineering certification", "DevOps career switch course"],
    ],
    offer: "Cohort or evergreen course + community",
    prices: { default: "$97–$997; cohort $1,500–$4,000", cis: "4,990–79,990 ₽" },
    base: { volume: 5500, trend: "stable", competition: "high", intent: "medium", margin: "high", entry: "medium", rec: "test" },
  },
  {
    nicheId: "plugins",
    clusters: [
      ["Figma plugin marketplace", "Chrome extension for productivity", "WordPress plugin for SEO"],
      ["Notion API integration plugin", "VS Code extension SaaS", "Shopify app development"],
      ["Obsidian plugin paid", "Webflow app marketplace", "Slack app for agencies"],
    ],
    offer: "Niche plugin with subscription tier",
    prices: { default: "$5–$29 one-time or $8–$49/mo", cis: "299–2,990 ₽ / $8–$29/mo" },
    base: { volume: 4100, trend: "growing", competition: "medium", intent: "medium", margin: "high", entry: "medium", rec: "launch" },
  },
  {
    nicheId: "micro-saas",
    clusters: [
      ["micro SaaS ideas 2026", "AI wrapper SaaS for niche", "billing portal micro SaaS"],
      ["SEO reporting SaaS", "client portal SaaS for agencies", "screenshot API micro SaaS"],
      ["PDF tool SaaS", "form builder for freelancers", "uptime monitoring white label"],
    ],
    offer: "Single-feature B2B SaaS (MRR model)",
    prices: { default: "$19–$99/mo seats", cis: "$9–$49/mo or 990–4,990 ₽/mo" },
    base: { volume: 6400, trend: "growing", competition: "medium", intent: "high", margin: "high", entry: "medium", rec: "launch" },
  },
  {
    nicheId: "ui-kits",
    clusters: [
      ["SaaS UI kit Figma", "Next.js dashboard template", "Tailwind UI kit marketplace"],
      ["Framer template SaaS landing", "shadcn dashboard template", "admin dashboard React template"],
      ["mobile UI kit Flutter", "design system starter kit", "e-commerce UI kit Figma"],
    ],
    offer: "Premium UI kit + Next.js starter",
    prices: { default: "$49–$299", cis: "2,490–14,990 ₽" },
    base: { volume: 8700, trend: "stable", competition: "high", intent: "medium", margin: "high", entry: "low", rec: "test" },
  },
  {
    nicheId: "automation-packs",
    clusters: [
      ["Make.com templates marketplace", "Zapier templates for real estate", "n8n workflow templates"],
      ["Shopify Zapier automation pack", "CRM automation templates HubSpot", "invoice automation Make scenario"],
      ["lead enrichment Zapier", "WhatsApp automation Make", "Google Sheets automation pack"],
    ],
    offer: "Industry automation pack + install guide",
    prices: { default: "$29–$199; setup $200–$800", cis: "1,490–9,990 ₽" },
    base: { volume: 3900, trend: "growing", competition: "low", intent: "high", margin: "high", entry: "low", rec: "launch" },
  },
];

/** Country-specific volume / competition / recommendation overrides */
const countryMods = {
  US: { vol: 1.35, compShift: 0, conf: 0.78 },
  GB: { vol: 0.55, compShift: 0, conf: 0.76 },
  DE: { vol: 0.48, compShift: -1, conf: 0.74 },
  CA: { vol: 0.42, compShift: 0, conf: 0.75 },
  AU: { vol: 0.38, compShift: -1, conf: 0.74 },
  AE: { vol: 0.22, compShift: -1, conf: 0.68 },
  SA: { vol: 0.2, compShift: -1, conf: 0.66 },
  RU: { vol: 0.7, compShift: 0, conf: 0.72 },
  KZ: { vol: 0.18, compShift: -1, conf: 0.65 },
  UZ: { vol: 0.12, compShift: -1, conf: 0.62 },
  NL: { vol: 0.28, compShift: -1, conf: 0.73 },
  SG: { vol: 0.25, compShift: 0, conf: 0.74 },
};

const cis = new Set(["RU", "KZ", "UZ"]);
const levels = ["low", "medium", "high"];

function shiftLevel(level, delta) {
  const i = Math.max(0, Math.min(2, levels.indexOf(level) + delta));
  return levels[i];
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const opportunities = [];
let n = 0;

for (const t of templates) {
  for (const [code, mod] of Object.entries(countryMods)) {
    const clusterIdx = hash(t.nicheId + code) % t.clusters.length;
    const cluster = t.clusters[clusterIdx];
    const queryCluster = cluster.join(" / ");
    const jitter = ((hash(queryCluster + code) % 40) - 20) / 100;
    const volume = Math.max(80, Math.round(t.base.volume * mod.vol * (1 + jitter)));

    let competition = shiftLevel(t.base.competition, mod.compShift);
    let recommendation = t.base.rec;
    let trend = t.base.trend;
    let entry = t.base.entry;
    let margin = t.base.margin;
    let intent = t.base.intent;

    // Market-specific analytical tweaks
    if (t.nicheId === "ai-agents" && ["US", "GB", "AE", "SA", "SG"].includes(code)) {
      recommendation = "launch";
      competition = code === "US" ? "medium" : "low";
    }
    if (t.nicheId === "cybersecurity" && ["DE", "GB", "US", "NL"].includes(code)) {
      recommendation = "launch";
      intent = "high";
      margin = "high";
    }
    if (t.nicheId === "automation-packs" && ["US", "AU", "CA", "GB"].includes(code)) {
      recommendation = "launch";
      competition = "low";
    }
    if (t.nicheId === "prompts" && !cis.has(code)) {
      recommendation = "not_now";
      trend = "declining";
    }
    if (t.nicheId === "web-dev" && !cis.has(code)) {
      recommendation = volume > 5000 ? "not_now" : "test";
      competition = "high";
    }
    if (cis.has(code) && ["ai-agents", "automation-packs", "nocode", "micro-saas"].includes(t.nicheId)) {
      recommendation = "launch";
      competition = shiftLevel(competition, -1);
      entry = "low";
    }
    if (cis.has(code) && t.nicheId === "cybersecurity") {
      recommendation = "test";
      competition = "medium";
    }
    if (["AE", "SA"].includes(code) && ["ai-agents", "web-dev", "seo-marketing"].includes(t.nicheId)) {
      recommendation = "launch";
      margin = "high";
      competition = "low";
    }
    if (t.nicheId === "notion-systems" && ["US", "GB", "AU"].includes(code)) {
      recommendation = competition === "high" ? "test" : "launch";
    }
    if (t.nicheId === "devops" && ["DE", "NL", "US"].includes(code)) {
      recommendation = "launch";
    }
    if (t.nicheId === "plugins" && ["US", "DE", "SG"].includes(code)) {
      recommendation = "launch";
    }
    if (t.nicheId === "micro-saas" && ["US", "GB", "CA", "AU", "NL", "SG"].includes(code)) {
      recommendation = "launch";
    }

    n += 1;
    opportunities.push({
      id: `opp_${String(n).padStart(3, "0")}`,
      countryCode: code,
      nicheId: t.nicheId,
      queryCluster,
      searchVolume: volume,
      trend,
      competition,
      commercialIntent: intent,
      marginPotential: margin,
      entryDifficulty: entry,
      recommendation,
      exampleOffer: t.offer,
      priceRange: cis.has(code) ? t.prices.cis : t.prices.default,
      source: "expert_estimate",
      confidence: Math.round(mod.conf * 100) / 100,
    });
  }
}

const out = join(__dirname, "..", "data", "seed", "opportunities.json");
writeFileSync(out, JSON.stringify(opportunities, null, 2), "utf8");
console.log(`Wrote ${opportunities.length} opportunities to ${out}`);
