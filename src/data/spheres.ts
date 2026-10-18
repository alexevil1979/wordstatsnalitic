/** ~100 in-demand analytics spheres for searchable select (IT / digital / business). */

export type SphereGroup =
  | "ai"
  | "dev"
  | "growth"
  | "ops"
  | "digital_products"
  | "commerce"
  | "content"
  | "vertical";

export type Sphere = {
  id: string;
  group: SphereGroup;
  nameRu: string;
  nameEn: string;
  /** Extra terms for search (ru/en). */
  aliases?: string[];
  /** Map to existing niche id when present in DB/watchlist. */
  nicheId?: string;
};

export const SPHERE_GROUPS: Record<
  SphereGroup,
  { nameRu: string; nameEn: string }
> = {
  ai: { nameRu: "AI и автоматизация", nameEn: "AI & automation" },
  dev: { nameRu: "Разработка и продукт", nameEn: "Dev & product" },
  growth: { nameRu: "Маркетинг и рост", nameEn: "Growth & marketing" },
  ops: { nameRu: "Инфра и безопасность", nameEn: "Infra & security" },
  digital_products: { nameRu: "Цифровые продукты", nameEn: "Digital products" },
  commerce: { nameRu: "Коммерция и продажи", nameEn: "Commerce & sales" },
  content: { nameRu: "Контент и медиа", nameEn: "Content & media" },
  vertical: { nameRu: "Отраслевые ниши", nameEn: "Vertical niches" },
};

export const SPHERES: Sphere[] = [
  // AI (12)
  { id: "ai-agents", group: "ai", nameRu: "AI-агенты для бизнеса", nameEn: "AI agents for business", nicheId: "ai-agents", aliases: ["агенты", "gpt", "llm"] },
  { id: "ai-chatbots", group: "ai", nameRu: "AI-чатботы и поддержка", nameEn: "AI chatbots & support", aliases: ["чатбот", "support bot"] },
  { id: "ai-voice", group: "ai", nameRu: "Голосовые AI-ассистенты", nameEn: "Voice AI assistants", aliases: ["voicebot", "телефония"] },
  { id: "ai-content", group: "ai", nameRu: "AI-контент и копирайт", nameEn: "AI content & copywriting", aliases: ["копирайтинг", "генерация текста"] },
  { id: "ai-image-video", group: "ai", nameRu: "AI-изображения и видео", nameEn: "AI image & video", aliases: ["midjourney", "runway", "sora"] },
  { id: "ai-coding", group: "ai", nameRu: "AI-coding и code review", nameEn: "AI coding & review", aliases: ["copilot", "cursor"] },
  { id: "ai-analytics", group: "ai", nameRu: "AI-аналитика данных", nameEn: "AI data analytics", aliases: ["bi", "прогнозы"] },
  { id: "rag-knowledge", group: "ai", nameRu: "RAG и базы знаний", nameEn: "RAG & knowledge bases", aliases: ["vector", "embeddings"] },
  { id: "prompt-engineering", group: "ai", nameRu: "Промпт-инжиниринг", nameEn: "Prompt engineering", nicheId: "prompts", aliases: ["промпты"] },
  { id: "ai-automation-agency", group: "ai", nameRu: "AI-automation агентства", nameEn: "AI automation agencies", aliases: ["n8n", "make"] },
  { id: "computer-vision", group: "ai", nameRu: "Computer vision", nameEn: "Computer vision", aliases: ["cv", "распознавание"] },
  { id: "ai-hr", group: "ai", nameRu: "AI в HR и рекрутинге", nameEn: "AI for HR & recruiting", aliases: ["рекрутинг", "ats"] },

  // Dev (14)
  { id: "web-dev", group: "dev", nameRu: "Веб-разработка под ключ", nameEn: "Full-stack web development", nicheId: "web-dev", aliases: ["next.js", "react"] },
  { id: "mobile-apps", group: "dev", nameRu: "Мобильные приложения", nameEn: "Mobile app development", aliases: ["ios", "android", "flutter"] },
  { id: "saas-dev", group: "dev", nameRu: "Разработка SaaS", nameEn: "SaaS product development", aliases: ["b2b saas"] },
  { id: "no-code", group: "dev", nameRu: "No-code / low-code", nameEn: "No-code / low-code", nicheId: "no-code", aliases: ["bubble", "webflow", "flutterflow"] },
  { id: "ui-ux", group: "dev", nameRu: "UI/UX и продуктовый дизайн", nameEn: "UI/UX & product design", nicheId: "ui-ux", aliases: ["figma", "дизайн"] },
  { id: "design-systems", group: "dev", nameRu: "Дизайн-системы", nameEn: "Design systems", aliases: ["ui kit", "токены"] },
  { id: "api-integrations", group: "dev", nameRu: "API и интеграции", nameEn: "API & integrations", aliases: ["webhook", "middleware"] },
  { id: "mvp-startup", group: "dev", nameRu: "MVP для стартапов", nameEn: "Startup MVP builds", aliases: ["прототип"] },
  { id: "legacy-modernization", group: "dev", nameRu: "Модернизация legacy", nameEn: "Legacy modernization", aliases: ["миграция"] },
  { id: "qa-testing", group: "dev", nameRu: "QA и автотесты", nameEn: "QA & test automation", aliases: ["selenium", "playwright"] },
  { id: "blockchain-web3", group: "dev", nameRu: "Blockchain / Web3", nameEn: "Blockchain / Web3", aliases: ["smart contracts", "nft"] },
  { id: "game-dev", group: "dev", nameRu: "Game development", nameEn: "Game development", aliases: ["unity", "unreal"] },
  { id: "wordpress-dev", group: "dev", nameRu: "WordPress / CMS", nameEn: "WordPress / CMS", aliases: ["woocommerce"] },
  { id: "shopify-dev", group: "dev", nameRu: "Shopify / e‑com платформы", nameEn: "Shopify & e‑com platforms", aliases: ["магазин"] },

  // Growth (14)
  { id: "seo-marketing", group: "growth", nameRu: "SEO и performance", nameEn: "SEO & performance marketing", nicheId: "seo-marketing", aliases: ["google ads", "реклама"] },
  { id: "content-marketing", group: "growth", nameRu: "Контент-маркетинг", nameEn: "Content marketing", aliases: ["блог", "smm"] },
  { id: "email-crm", group: "growth", nameRu: "Email / CRM-маркетинг", nameEn: "Email & CRM marketing", aliases: ["retention", "lifecycle"] },
  { id: "influencer", group: "growth", nameRu: "Influencer / UGC", nameEn: "Influencer & UGC", aliases: ["блогеры"] },
  { id: "affiliate", group: "growth", nameRu: "Партнёрский маркетинг", nameEn: "Affiliate marketing", aliases: ["cpa", "рефералка"] },
  { id: "cro", group: "growth", nameRu: "CRO и лендинги", nameEn: "CRO & landing pages", aliases: ["конверсия"] },
  { id: "product-led", group: "growth", nameRu: "Product-led growth", nameEn: "Product-led growth", aliases: ["plg", "onboarding"] },
  { id: "branding", group: "growth", nameRu: "Брендинг и айдентика", nameEn: "Branding & identity", aliases: ["логотип"] },
  { id: "pr-comms", group: "growth", nameRu: "PR и коммуникации", nameEn: "PR & communications", aliases: ["медиа"] },
  { id: "market-research", group: "growth", nameRu: "Маркетинговые исследования", nameEn: "Market research", aliases: ["опросы", "спрос"] },
  { id: "local-seo", group: "growth", nameRu: "Local SEO / карты", nameEn: "Local SEO & maps", aliases: ["gmb", "гео"] },
  { id: "aso", group: "growth", nameRu: "ASO приложений", nameEn: "App store optimization", aliases: ["app store"] },
  { id: "telegram-growth", group: "growth", nameRu: "Продвижение в Telegram", nameEn: "Telegram growth", aliases: ["каналы", "боты"] },
  { id: "short-video-ads", group: "growth", nameRu: "Short-form video ads", nameEn: "Short-form video ads", aliases: ["tiktok", "reels", "shorts"] },

  // Ops (12)
  { id: "devops", group: "ops", nameRu: "DevOps / SRE / FinOps", nameEn: "DevOps / SRE / FinOps", nicheId: "devops", aliases: ["kubernetes", "ci/cd"] },
  { id: "cybersecurity", group: "ops", nameRu: "Кибербезопасность", nameEn: "Cybersecurity", nicheId: "cybersecurity", aliases: ["pentest", "soc", "vciso"] },
  { id: "cloud-migration", group: "ops", nameRu: "Облачная миграция", nameEn: "Cloud migration", aliases: ["aws", "gcp", "azure"] },
  { id: "data-engineering", group: "ops", nameRu: "Data engineering", nameEn: "Data engineering", aliases: ["etl", "warehouse"] },
  { id: "mlops", group: "ops", nameRu: "MLOps", nameEn: "MLOps", aliases: ["модели", "деплой ml"] },
  { id: "observability", group: "ops", nameRu: "Мониторинг и observability", nameEn: "Monitoring & observability", aliases: ["prometheus", "grafana"] },
  { id: "it-outsourcing", group: "ops", nameRu: "IT-аутсорсинг", nameEn: "IT outsourcing", aliases: ["staff augmentation"] },
  { id: "helpdesk", group: "ops", nameRu: "Helpdesk / ITSM", nameEn: "Helpdesk / ITSM", aliases: ["service desk"] },
  { id: "compliance", group: "ops", nameRu: "Compliance (GDPR, 152-ФЗ)", nameEn: "Compliance (GDPR & local)", aliases: ["персональные данные"] },
  { id: "backup-dr", group: "ops", nameRu: "Backup и disaster recovery", nameEn: "Backup & DR", aliases: ["резервное копирование"] },
  { id: "network-security", group: "ops", nameRu: "Сетевая безопасность / VPN", nameEn: "Network security & VPN", aliases: ["firewall", "zero trust"] },
  { id: "iam", group: "ops", nameRu: "IAM и SSO", nameEn: "IAM & SSO", aliases: ["okta", "auth"] },

  // Digital products (14)
  { id: "micro-saas", group: "digital_products", nameRu: "Micro-SaaS", nameEn: "Micro-SaaS", nicheId: "micro-saas", aliases: ["wrapper", "b2b tool"] },
  { id: "notion-systems", group: "digital_products", nameRu: "Notion / OS-шаблоны", nameEn: "Notion systems & templates", nicheId: "notion-systems", aliases: ["шаблоны notion"] },
  { id: "courses", group: "digital_products", nameRu: "Онлайн-курсы", nameEn: "Online courses", nicheId: "courses", aliases: ["инфобиз", "обучение"] },
  { id: "plugins", group: "digital_products", nameRu: "Плагины и расширения", nameEn: "Plugins & extensions", nicheId: "plugins", aliases: ["chrome", "wordpress plugin"] },
  { id: "ui-kits", group: "digital_products", nameRu: "UI-киты и шаблоны", nameEn: "UI kits & templates", nicheId: "ui-kits", aliases: ["figma kit", "dashboard"] },
  { id: "make-zapier", group: "digital_products", nameRu: "Шаблоны Make / Zapier / n8n", nameEn: "Make / Zapier / n8n templates", nicheId: "make-zapier", aliases: ["автоматизация"] },
  { id: "stock-assets", group: "digital_products", nameRu: "Стоки: фото, иконки, 3D", nameEn: "Stock assets (photo, icons, 3D)", aliases: ["сток"] },
  { id: "fonts-graphics", group: "digital_products", nameRu: "Шрифты и графика", nameEn: "Fonts & graphics packs", aliases: ["typedesign"] },
  { id: "spreadsheet-tools", group: "digital_products", nameRu: "Таблицы и калькуляторы", nameEn: "Spreadsheets & calculators", aliases: ["excel", "google sheets"] },
  { id: "bot-templates", group: "digital_products", nameRu: "Шаблоны Telegram/Discord ботов", nameEn: "Bot templates", aliases: ["телеграм бот"] },
  { id: "prompt-packs", group: "digital_products", nameRu: "Пакеты промптов", nameEn: "Prompt packs", aliases: ["chatgpt packs"] },
  { id: "newsletter-products", group: "digital_products", nameRu: "Платные рассылки / media", nameEn: "Paid newsletters & media", aliases: ["substack"] },
  { id: "digital-downloads", group: "digital_products", nameRu: "Digital downloads / gumroad", nameEn: "Digital downloads", aliases: ["gumroad", "цифровые товары"] },
  { id: "white-label-saas", group: "digital_products", nameRu: "White-label SaaS", nameEn: "White-label SaaS", aliases: ["реселл"] },

  // Commerce (12)
  { id: "ecommerce-ops", group: "commerce", nameRu: "E‑commerce операции", nameEn: "E‑commerce operations", aliases: ["магазин", "fulfillment"] },
  { id: "marketplace-sellers", group: "commerce", nameRu: "Маркетплейсы (WB/Ozon/Amazon)", nameEn: "Marketplace selling", aliases: ["wildberries", "ozon"] },
  { id: "dropshipping", group: "commerce", nameRu: "Дропшиппинг", nameEn: "Dropshipping", aliases: ["поставщики"] },
  { id: "pricing-tools", group: "commerce", nameRu: "Ценообразование и мониторинг", nameEn: "Pricing & monitoring tools", aliases: ["парсинг цен"] },
  { id: "crm-sales", group: "commerce", nameRu: "CRM и продажи B2B", nameEn: "CRM & B2B sales", aliases: ["amocrm", "bitrix"] },
  { id: "payment-fintech", group: "commerce", nameRu: "Платежи и финтех-сервисы", nameEn: "Payments & fintech", aliases: ["эквайринг"] },
  { id: "subscription-billing", group: "commerce", nameRu: "Подписки и биллинг", nameEn: "Subscriptions & billing", aliases: ["recurring"] },
  { id: "customer-success", group: "commerce", nameRu: "Customer success", nameEn: "Customer success", aliases: ["churn", "retention"] },
  { id: "lead-gen", group: "commerce", nameRu: "Лидогенерация B2B", nameEn: "B2B lead generation", aliases: ["outbound", "холодные"] },
  { id: "sales-enablement", group: "commerce", nameRu: "Sales enablement", nameEn: "Sales enablement", aliases: ["презентации", "плейбуки"] },
  { id: "loyalty", group: "commerce", nameRu: "Программы лояльности", nameEn: "Loyalty programs", aliases: ["бонусы"] },
  { id: "franchise-saas", group: "commerce", nameRu: "Франшизы digital", nameEn: "Digital franchises", aliases: ["франшиза"] },

  // Content (10)
  { id: "youtube-production", group: "content", nameRu: "YouTube / видеопродакшн", nameEn: "YouTube & video production", aliases: ["монтаж"] },
  { id: "podcasting", group: "content", nameRu: "Подкасты", nameEn: "Podcasting", aliases: ["аудио"] },
  { id: "newsletter-media", group: "content", nameRu: "Медиа и ньюслеттеры", nameEn: "Media & newsletters", aliases: ["редакция"] },
  { id: "ugc-creators", group: "content", nameRu: "UGC-креаторы", nameEn: "UGC creators", aliases: ["креаторы"] },
  { id: "localization", group: "content", nameRu: "Локализация и перевод", nameEn: "Localization & translation", aliases: ["i18n", "перевод"] },
  { id: "documentation", group: "content", nameRu: "Техдок и knowledge base", nameEn: "Tech docs & knowledge base", aliases: ["документация"] },
  { id: "community", group: "content", nameRu: "Community management", nameEn: "Community management", aliases: ["сообщество"] },
  { id: "education-content", group: "content", nameRu: "Образовательный контент", nameEn: "Educational content", aliases: ["методички"] },
  { id: "stock-video", group: "content", nameRu: "Stock video / motion", nameEn: "Stock video & motion", aliases: ["моушн"] },
  { id: "ai-avatars", group: "content", nameRu: "AI-аватары и синтез речи", nameEn: "AI avatars & TTS", aliases: ["heygen", "elevenlabs"] },

  // Vertical (12) → total 100
  { id: "healthtech", group: "vertical", nameRu: "HealthTech / телемед", nameEn: "HealthTech & telemedicine", aliases: ["медицина"] },
  { id: "edtech", group: "vertical", nameRu: "EdTech", nameEn: "EdTech", aliases: ["образование"] },
  { id: "fintech-vertical", group: "vertical", nameRu: "FinTech продукты", nameEn: "FinTech products", aliases: ["банки", "кошельки"] },
  { id: "proptech", group: "vertical", nameRu: "PropTech / недвижимость", nameEn: "PropTech", aliases: ["недвижимость"] },
  { id: "legaltech", group: "vertical", nameRu: "LegalTech", nameEn: "LegalTech", aliases: ["юристы"] },
  { id: "hrtech", group: "vertical", nameRu: "HRTech", nameEn: "HRTech", aliases: ["кадры"] },
  { id: "logistics-tech", group: "vertical", nameRu: "LogisticsTech", nameEn: "LogisticsTech", aliases: ["логистика"] },
  { id: "agritech", group: "vertical", nameRu: "AgriTech", nameEn: "AgriTech", aliases: ["агро"] },
  { id: "traveltech", group: "vertical", nameRu: "TravelTech", nameEn: "TravelTech", aliases: ["туризм"] },
  { id: "foodtech", group: "vertical", nameRu: "FoodTech / dark kitchen", nameEn: "FoodTech", aliases: ["доставка еды"] },
  { id: "cleantech", group: "vertical", nameRu: "CleanTech / ESG", nameEn: "CleanTech & ESG", aliases: ["экология"] },
  { id: "govtech", group: "vertical", nameRu: "GovTech / B2G", nameEn: "GovTech / B2G", aliases: ["госзаказ"] },
];

export function sphereLabel(s: Sphere, locale: string): string {
  return locale === "ru" ? s.nameRu : s.nameEn;
}

export function groupLabel(group: SphereGroup, locale: string): string {
  return locale === "ru" ? SPHERE_GROUPS[group].nameRu : SPHERE_GROUPS[group].nameEn;
}

export function searchSpheres(query: string, locale = "en"): Sphere[] {
  const q = query.trim().toLowerCase();
  if (!q) return SPHERES;
  const primary = (s: Sphere) =>
    (locale === "ru" ? s.nameRu : s.nameEn).toLowerCase();
  return SPHERES.filter((s) => {
    const hay = [
      s.id,
      s.nameRu,
      s.nameEn,
      s.nicheId || "",
      ...(s.aliases || []),
      groupLabel(s.group, "ru"),
      groupLabel(s.group, "en"),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }).sort((a, b) => {
    const aHit = primary(a).includes(q) ? 0 : 1;
    const bHit = primary(b).includes(q) ? 0 : 1;
    return aHit - bHit || primary(a).localeCompare(primary(b));
  });
}

export function getSphere(id: string): Sphere | undefined {
  return SPHERES.find((s) => s.id === id);
}

/** Ensure catalog length stays at 100 for product copy. */
export const SPHERES_COUNT = SPHERES.length;
