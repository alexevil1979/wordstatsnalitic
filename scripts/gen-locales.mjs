import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));

function deepMerge(a, b) {
  const o = { ...a };
  for (const k of Object.keys(b)) {
    o[k] =
      b[k] &&
      typeof b[k] === "object" &&
      !Array.isArray(b[k]) &&
      a[k] &&
      typeof a[k] === "object"
        ? deepMerge(a[k], b[k])
        : b[k];
  }
  return o;
}

const authEn = {
  loginTitle: "Log in",
  loginSubtitle: "Access your cabinet, keys and plan",
  registerTitle: "Create account",
  registerSubtitle:
    "Free plan includes Google Trends. Upgrade for personal API keys.",
  email: "Email",
  password: "Password",
  name: "Name",
  submitLogin: "Log in",
  submitRegister: "Create account",
  noAccount: "No account?",
  haveAccount: "Already have an account?",
  toRegister: "Sign up",
  toLogin: "Log in",
  error: "Something went wrong",
  invalid: "Invalid email or password",
  exists: "Email already registered",
  weakPassword: "Password must be at least 8 characters",
  successRegister: "Account created — you are signed in",
};

const cabinetEn = {
  title: "Cabinet",
  subtitle: "Plan, usage, API keys and billing",
  overview: "Overview",
  keys: "API keys",
  history: "Research history",
  billing: "Billing",
  profile: "Profile",
  plan: "Plan",
  status: "Status",
  usageToday: "Usage today",
  research: "Research calls",
  xmlExport: "XML exports",
  freeHint: "Free = Google Trends only. Add paid provider keys on Pro.",
  proOnly: "Pro feature — upgrade to unlock",
  upgrade: "Upgrade to Pro",
  manageBilling: "Manage billing",
  saveKeys: "Save keys",
  keysSaved: "Keys saved",
  keysHint: "Pro only. Leave empty to keep current value.",
  configured: "(set)",
  provider: "Provider",
  serpapi: "SerpAPI",
  dataforseoLogin: "DataForSEO login",
  dataforseoPassword: "DataForSEO password",
  ahrefs: "Ahrefs token",
  noHistory: "No personal research yet",
  locale: "Language",
  changePassword: "New password",
  saveProfile: "Save profile",
  profileSaved: "Profile saved",
  signOut: "Sign out",
  periodEnd: "Renews",
  notSubscribed: "No active paid subscription",
};

const billingEn = {
  title: "Billing",
  free: "Free",
  pro: "Pro",
  price: "$29/mo",
  freeFeatures: "Shared Markets · Google Trends · daily caps",
  proFeatures: "Personal API keys · higher limits · personal history",
  checkout: "Start Pro checkout",
  portal: "Open customer portal",
  stripeMissing: "Stripe is not configured yet — ask admin.",
  success: "Payment successful — Pro is active",
  cancel: "Checkout canceled",
};

const adminSaaSEn = {
  shellTitle: "Admin",
  dashboard: "Dashboard",
  users: "Users",
  subscriptions: "Subscriptions",
  plans: "Plans",
  catalog: "Catalog",
  jobs: "Jobs",
  system: "System",
  mrr: "MRR (est.)",
  usersTotal: "Users",
  proActive: "Pro active",
  trendsToday: "Trends today",
  role: "Role",
  planCol: "Plan",
  created: "Created",
  actions: "Actions",
  makeAdmin: "Make admin",
  makeUser: "Make user",
  setPro: "Force Pro",
  setFree: "Force Free",
  ban: "Disable",
  unban: "Enable",
  priceCents: "Price (cents/mo)",
  dailyResearch: "Daily research cap",
  dailyXml: "Daily XML cap",
  allowPaidKeys: "Allow paid keys",
  savePlan: "Save plan",
  planSaved: "Plan saved",
};

function withSaaS(base, patch = {}) {
  const merged = deepMerge(base, {
    nav: {
      cabinet: "Cabinet",
      login: "Log in",
      logout: "Log out",
      register: "Sign up",
      billing: "Billing",
      admin: "Admin",
    },
    auth: authEn,
    cabinet: cabinetEn,
    billing: billingEn,
    adminSaaS: adminSaaSEn,
  });
  return deepMerge(merged, patch);
}

const zh = withSaaS(en, {
  meta: {
    title: "Wordstat — 市场需求情报",
    description:
      "按国家分析 IT 服务与数字产品的需求、竞争与利润潜力",
  },
  nav: {
    dashboard: "概览",
    markets: "市场",
    research: "自定义查询",
    opportunities: "机会",
    insights: "洞察",
    admin: "管理",
    settings: "设置",
    cabinet: "控制台",
    login: "登录",
    logout: "退出",
    register: "注册",
    billing: "账单",
  },
  brand: { name: "Wordstat", tagline: "市场需求情报" },
  markets: {
    title: "IT 与数字产品市场分析",
    subtitle:
      "覆盖所有细分与主要国家的现成概览。无需选择 — 数据自动采集。",
    reload: "刷新页面",
    downloadXml: "下载分析 XML",
    refreshAll: "重建全部 Trends",
    error: "加载失败",
  },
  auth: {
    loginTitle: "登录",
    loginSubtitle: "访问控制台、密钥与套餐",
    registerTitle: "创建账户",
    registerSubtitle:
      "免费套餐含 Google Trends。升级后可使用个人 API 密钥。",
    email: "邮箱",
    password: "密码",
    name: "名称",
    submitLogin: "登录",
    submitRegister: "创建账户",
    noAccount: "没有账户？",
    haveAccount: "已有账户？",
    toRegister: "注册",
    toLogin: "登录",
    error: "出错了",
    invalid: "邮箱或密码无效",
    exists: "该邮箱已注册",
    weakPassword: "密码至少 8 位",
    successRegister: "账户已创建 — 已登录",
  },
  cabinet: {
    title: "控制台",
    subtitle: "套餐、用量、API 密钥与账单",
    overview: "概览",
    keys: "API 密钥",
    history: "研究历史",
    billing: "账单",
    profile: "资料",
    plan: "套餐",
    upgrade: "升级到 Pro",
    saveKeys: "保存密钥",
    signOut: "退出",
    proOnly: "Pro 功能 — 请升级",
    freeHint: "Free = 仅 Google Trends。付费密钥需 Pro。",
  },
  billing: {
    title: "账单",
    checkout: "开始 Pro 结账",
    portal: "打开客户门户",
    price: "$29/月",
  },
  adminSaaS: {
    shellTitle: "管理",
    dashboard: "仪表盘",
    users: "用户",
    subscriptions: "订阅",
    plans: "套餐",
    catalog: "目录",
    jobs: "任务",
    system: "系统",
  },
});

const tr = withSaaS(en, {
  meta: {
    title: "Wordstat — Pazar Talep Analitiği",
    description:
      "Ülkelere göre IT hizmetleri ve dijital ürünlerde talep, rekabet ve marj potansiyeli",
  },
  nav: {
    dashboard: "Özet",
    markets: "Pazarlar",
    research: "Özel sorgu",
    opportunities: "Fırsatlar",
    insights: "İçgörüler",
    admin: "Yönetim",
    settings: "Ayarlar",
    cabinet: "Kabinet",
    login: "Giriş",
    logout: "Çıkış",
    register: "Kayıt",
    billing: "Ödeme",
  },
  brand: { name: "Wordstat", tagline: "Pazar Talep Analitiği" },
  markets: {
    title: "IT ve dijital ürün pazar analitiği",
    subtitle:
      "Tüm nişler ve büyük ülkeler için hazır özet. Seçim gerekmez — veri otomatik toplanır.",
    reload: "Ekranı yenile",
    downloadXml: "Analitik XML indir",
    refreshAll: "Tüm Trends yenile",
    error: "Yükleme başarısız",
  },
  auth: {
    loginTitle: "Giriş yap",
    registerTitle: "Hesap oluştur",
    email: "E-posta",
    password: "Şifre",
    name: "Ad",
    submitLogin: "Giriş",
    submitRegister: "Hesap oluştur",
    toRegister: "Kayıt ol",
    toLogin: "Giriş yap",
    invalid: "Geçersiz e-posta veya şifre",
    exists: "E-posta zaten kayıtlı",
    weakPassword: "Şifre en az 8 karakter olmalı",
  },
  cabinet: {
    title: "Kabinet",
    subtitle: "Plan, kullanım, API anahtarları ve faturalama",
    overview: "Özet",
    keys: "API anahtarları",
    billing: "Ödeme",
    upgrade: "Pro’ya yükselt",
    saveKeys: "Anahtarları kaydet",
    signOut: "Çıkış",
  },
  billing: { title: "Ödeme", checkout: "Pro ödeme başlat", price: "$29/ay" },
  adminSaaS: {
    shellTitle: "Yönetim",
    users: "Kullanıcılar",
    plans: "Planlar",
    catalog: "Katalog",
  },
});

const fa = withSaaS(en, {
  meta: {
    title: "Wordstat — هوش تقاضای بازار",
    description:
      "تقاضا، رقابت و پتانسیل حاشیه برای خدمات IT و محصولات دیجیتال بر اساس کشور",
  },
  nav: {
    dashboard: "داشبورد",
    markets: "بازارها",
    research: "پرس‌وجوی سفارشی",
    opportunities: "فرصت‌ها",
    insights: "بینش‌ها",
    admin: "مدیریت",
    settings: "تنظیمات",
    cabinet: "کابینت",
    login: "ورود",
    logout: "خروج",
    register: "ثبت‌نام",
    billing: "صورتحساب",
  },
  brand: { name: "Wordstat", tagline: "هوش تقاضای بازار" },
  markets: {
    title: "تحلیل بازار IT و محصولات دیجیتال",
    subtitle:
      "نمای آماده برای همه نیچ‌ها و کشورهای اصلی. نیازی به انتخاب نیست — داده‌ها خودکار جمع می‌شوند.",
    reload: "بازخوانی صفحه",
    downloadXml: "دانلود XML تحلیل",
    refreshAll: "بازسازی Trends برای همه نیچ‌ها",
    error: "بارگذاری ناموفق",
  },
  auth: {
    loginTitle: "ورود",
    registerTitle: "ایجاد حساب",
    email: "ایمیل",
    password: "رمز عبور",
    name: "نام",
    submitLogin: "ورود",
    submitRegister: "ایجاد حساب",
    toRegister: "ثبت‌نام",
    toLogin: "ورود",
    invalid: "ایمیل یا رمز عبور نامعتبر",
    exists: "ایمیل قبلاً ثبت شده",
    weakPassword: "رمز عبور حداقل ۸ کاراکتر",
  },
  cabinet: {
    title: "کابینت",
    subtitle: "پلن، مصرف، کلیدهای API و صورتحساب",
    overview: "نمای کلی",
    keys: "کلیدهای API",
    billing: "صورتحساب",
    upgrade: "ارتقا به Pro",
    saveKeys: "ذخیره کلیدها",
    signOut: "خروج",
  },
  billing: { title: "صورتحساب", checkout: "شروع پرداخت Pro", price: "$۲۹/ماه" },
  adminSaaS: {
    shellTitle: "مدیریت",
    users: "کاربران",
    plans: "پلن‌ها",
    catalog: "کاتالوگ",
  },
});

const ar = withSaaS(en, {
  meta: {
    title: "Wordstat — ذكاء طلب السوق",
    description:
      "الطلب والمنافسة وإمكانات الهامش لخدمات تقنية المعلومات والمنتجات الرقمية حسب الدولة",
  },
  nav: {
    dashboard: "لوحة التحكم",
    markets: "الأسواق",
    research: "استعلام مخصص",
    opportunities: "الفرص",
    insights: "رؤى",
    admin: "الإدارة",
    settings: "الإعدادات",
    cabinet: "الحساب",
    login: "تسجيل الدخول",
    logout: "خروج",
    register: "تسجيل",
    billing: "الفوترة",
  },
  brand: { name: "Wordstat", tagline: "ذكاء طلب السوق" },
  markets: {
    title: "تحليل أسواق تقنية المعلومات والمنتجات الرقمية",
    subtitle:
      "نظرة جاهزة على كل المجالات والدول الرئيسية. لا حاجة للاختيار — تُجمع البيانات تلقائياً.",
    reload: "تحديث الشاشة",
    downloadXml: "تنزيل تحليل XML",
    refreshAll: "إعادة بناء Trends لكل المجالات",
    error: "فشل التحميل",
  },
  auth: {
    loginTitle: "تسجيل الدخول",
    registerTitle: "إنشاء حساب",
    email: "البريد",
    password: "كلمة المرور",
    name: "الاسم",
    submitLogin: "دخول",
    submitRegister: "إنشاء حساب",
    toRegister: "تسجيل",
    toLogin: "دخول",
    invalid: "بريد أو كلمة مرور غير صحيحة",
    exists: "البريد مسجّل مسبقاً",
    weakPassword: "كلمة المرور ٨ أحرف على الأقل",
  },
  cabinet: {
    title: "الحساب",
    subtitle: "الخطة والاستخدام ومفاتيح API والفوترة",
    overview: "نظرة عامة",
    keys: "مفاتيح API",
    billing: "الفوترة",
    upgrade: "الترقية إلى Pro",
    saveKeys: "حفظ المفاتيح",
    signOut: "خروج",
  },
  billing: { title: "الفوترة", checkout: "بدء دفع Pro", price: "$29/شهر" },
  adminSaaS: {
    shellTitle: "الإدارة",
    users: "المستخدمون",
    plans: "الخطط",
    catalog: "الكتالوج",
  },
});

const ruPatch = {
  nav: {
    cabinet: "Кабинет",
    login: "Вход",
    logout: "Выход",
    register: "Регистрация",
    billing: "Оплата",
    admin: "Админ",
  },
  auth: {
    loginTitle: "Вход",
    loginSubtitle: "Кабинет, ключи и тариф",
    registerTitle: "Создать аккаунт",
    registerSubtitle:
      "Free включает Google Trends. Pro — личные API-ключи.",
    email: "Email",
    password: "Пароль",
    name: "Имя",
    submitLogin: "Войти",
    submitRegister: "Создать аккаунт",
    noAccount: "Нет аккаунта?",
    haveAccount: "Уже есть аккаунт?",
    toRegister: "Регистрация",
    toLogin: "Войти",
    error: "Ошибка",
    invalid: "Неверный email или пароль",
    exists: "Email уже зарегистрирован",
    weakPassword: "Пароль не менее 8 символов",
    successRegister: "Аккаунт создан — вы вошли",
  },
  cabinet: {
    title: "Кабинет",
    subtitle: "Тариф, лимиты, API-ключи и оплата",
    overview: "Обзор",
    keys: "API-ключи",
    history: "История исследований",
    billing: "Оплата",
    profile: "Профиль",
    plan: "Тариф",
    status: "Статус",
    usageToday: "Использование сегодня",
    research: "Запросы research",
    xmlExport: "XML-экспорт",
    freeHint: "Free = только Google Trends. Платные ключи — на Pro.",
    proOnly: "Только Pro — оформите подписку",
    upgrade: "Перейти на Pro",
    manageBilling: "Управление подпиской",
    saveKeys: "Сохранить ключи",
    keysSaved: "Ключи сохранены",
    keysHint: "Только Pro. Пустое поле — не менять значение.",
    configured: "(задан)",
    noHistory: "Личных исследований пока нет",
    locale: "Язык",
    changePassword: "Новый пароль",
    saveProfile: "Сохранить профиль",
    profileSaved: "Профиль сохранён",
    signOut: "Выйти",
    periodEnd: "Продление",
    notSubscribed: "Нет активной платной подписки",
  },
  billing: {
    title: "Оплата",
    free: "Free",
    pro: "Pro",
    price: "$29/мес",
    freeFeatures: "Общие Markets · Google Trends · дневные лимиты",
    proFeatures: "Личные API-ключи · выше лимиты · личная история",
    checkout: "Оформить Pro",
    portal: "Портал Stripe",
    stripeMissing: "Stripe ещё не настроен — напишите админу.",
    success: "Оплата прошла — Pro активен",
    cancel: "Оплата отменена",
  },
  adminSaaS: {
    shellTitle: "Админ",
    dashboard: "Дашборд",
    users: "Пользователи",
    subscriptions: "Подписки",
    plans: "Тарифы",
    catalog: "Каталог",
    jobs: "Задачи",
    system: "Система",
    mrr: "MRR (оценка)",
    usersTotal: "Пользователи",
    proActive: "Pro активны",
    trendsToday: "Trends сегодня",
    role: "Роль",
    planCol: "Тариф",
    created: "Создан",
    actions: "Действия",
    makeAdmin: "Сделать admin",
    makeUser: "Сделать user",
    setPro: "Force Pro",
    setFree: "Force Free",
    ban: "Отключить",
    unban: "Включить",
    priceCents: "Цена (центов/мес)",
    dailyResearch: "Лимит research/день",
    dailyXml: "Лимит XML/день",
    allowPaidKeys: "Платные ключи",
    savePlan: "Сохранить тариф",
    planSaved: "Тариф сохранён",
  },
};

const ruBase = JSON.parse(fs.readFileSync(path.join(dir, "ru.json"), "utf8"));

const out = {
  en: withSaaS(en),
  ru: withSaaS(ruBase, ruPatch),
  zh,
  tr,
  fa,
  ar,
};

for (const [loc, data] of Object.entries(out)) {
  fs.writeFileSync(path.join(dir, `${loc}.json`), JSON.stringify(data, null, 2) + "\n");
  console.log("wrote", loc);
}
