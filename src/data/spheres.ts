/** Top-100 in-demand spheres of services & goods (not IT-only). */

export type SphereGroup =
  | "home"
  | "beauty"
  | "health"
  | "education"
  | "food"
  | "auto"
  | "retail"
  | "business"
  | "finance"
  | "leisure"
  | "logistics"
  | "personal"
  | "digital";

export type Sphere = {
  id: string;
  group: SphereGroup;
  nameRu: string;
  nameEn: string;
  aliases?: string[];
  /** Seed queries for Google Trends (EN + local where useful). */
  queries: string[];
};

export const SPHERE_GROUPS: Record<
  SphereGroup,
  { nameRu: string; nameEn: string }
> = {
  home: { nameRu: "Дом и ремонт", nameEn: "Home & repair" },
  beauty: { nameRu: "Красота и уход", nameEn: "Beauty & care" },
  health: { nameRu: "Здоровье и wellness", nameEn: "Health & wellness" },
  education: { nameRu: "Образование", nameEn: "Education" },
  food: { nameRu: "Еда и рестораны", nameEn: "Food & restaurants" },
  auto: { nameRu: "Авто и транспорт", nameEn: "Auto & transport" },
  retail: { nameRu: "Товары и ритейл", nameEn: "Goods & retail" },
  business: { nameRu: "Бизнес-услуги", nameEn: "Business services" },
  finance: { nameRu: "Финансы и страхование", nameEn: "Finance & insurance" },
  leisure: { nameRu: "Досуг и туризм", nameEn: "Leisure & travel" },
  logistics: { nameRu: "Логистика и доставка", nameEn: "Logistics & delivery" },
  personal: { nameRu: "Личные услуги", nameEn: "Personal services" },
  digital: { nameRu: "Цифровые и IT", nameEn: "Digital & IT" },
};

function s(
  id: string,
  group: SphereGroup,
  nameRu: string,
  nameEn: string,
  queries: string[],
  aliases?: string[]
): Sphere {
  return { id, group, nameRu, nameEn, queries, aliases };
}

export const SPHERES: Sphere[] = [
  // home (10)
  s("cleaning", "home", "Клининг квартир и офисов", "House & office cleaning", ["house cleaning service", "office cleaning company", "клининг квартир"], ["уборка"]),
  s("renovation", "home", "Ремонт квартир под ключ", "Apartment renovation", ["home renovation contractor", "apartment remodeling", "ремонт квартир под ключ"], ["отделка"]),
  s("plumbing", "home", "Сантехника", "Plumbing services", ["plumber near me", "emergency plumber", "сантехник вызов"], ["трубы"]),
  s("electrical", "home", "Электрика", "Electrical services", ["electrician near me", "electrical repair service", "электрик на дом"], ["проводка"]),
  s("furniture", "home", "Мебель на заказ", "Custom furniture", ["custom furniture maker", "bespoke furniture", "мебель на заказ"], ["шкафы"]),
  s("hvac", "home", "Климат и вентиляция", "HVAC & ventilation", ["hvac repair", "air conditioning installation", "кондиционеры установка"], ["кондиционер"]),
  s("pest-control", "home", "Дезинсекция / пест-контроль", "Pest control", ["pest control service", "termite treatment", "дезинсекция квартир"], ["тараканы"]),
  s("landscaping", "home", "Ландшафт и сад", "Landscaping & gardening", ["landscaping company", "lawn care service", "ландшафтный дизайн"], ["сад"]),
  s("moving", "home", "Переезды", "Moving services", ["moving company", "local movers", "квартирный переезд"], ["грузчики"]),
  s("smart-home", "home", "Умный дом", "Smart home install", ["smart home installation", "home automation installer", "умный дом установка"], ["iot home"]),

  // beauty (8)
  s("hair-salon", "beauty", "Парикмахерские / салоны", "Hair salons", ["hair salon near me", "hair coloring salon", "парикмахерская рядом"], ["стрижка"]),
  s("nail-salon", "beauty", "Маникюр и педикюр", "Nail salons", ["nail salon near me", "gel manicure", "маникюр педикюр"], ["ногти"]),
  s("barbershop", "beauty", "Барбершопы", "Barbershops", ["barbershop near me", "mens haircut", "барбершоп"], ["борода"]),
  s("cosmetology", "beauty", "Косметология", "Cosmetology clinics", ["cosmetic clinic", "facial treatment salon", "косметология лица"], ["чистка лица"]),
  s("lashes-brows", "beauty", "Ресницы и брови", "Lashes & brows", ["eyelash extensions", "brow lamination", "наращивание ресниц"], ["брови"]),
  s("tattoo-piercing", "beauty", "Тату и пирсинг", "Tattoo & piercing", ["tattoo studio near me", "piercing shop", "тату салон"], ["татуировка"]),
  s("spa-massage", "beauty", "SPA и массаж", "SPA & massage", ["spa massage near me", "thai massage", "массаж спа"], ["релакс"]),
  s("beauty-products", "beauty", "Косметика и уход (товары)", "Beauty products retail", ["skincare products store", "organic cosmetics shop", "магазин косметики"], ["уход"]),

  // health (8)
  s("dental", "health", "Стоматология", "Dental clinics", ["dental clinic near me", "teeth whitening cost", "стоматология рядом"], ["зубы"]),
  s("private-clinic", "health", "Частные клиники", "Private medical clinics", ["private clinic appointment", "walk in clinic", "частная клиника"], ["врач"]),
  s("physiotherapy", "health", "Физиотерапия / ЛФК", "Physiotherapy", ["physiotherapy near me", "physical therapy clinic", "физиотерапия"], ["реабилитация"]),
  s("optics", "health", "Оптика и очки", "Optics & eyewear", ["eyeglasses store", "contact lenses shop", "салон оптики"], ["линзы"]),
  s("pharmacy", "health", "Аптеки", "Pharmacies", ["pharmacy near me", "online pharmacy", "аптека рядом"], ["лекарства"]),
  s("vet", "health", "Ветеринария", "Veterinary clinics", ["vet clinic near me", "emergency vet", "ветеринарная клиника"], ["животные"]),
  s("fitness", "health", "Фитнес-клубы", "Fitness clubs", ["gym membership", "fitness club near me", "фитнес клуб"], ["зал"]),
  s("nutrition", "health", "Нутрициология / диеты", "Nutrition coaching", ["nutritionist near me", "diet meal plan", "нутрициолог"], ["похудение"]),

  // education (8)
  s("tutoring", "education", "Репетиторы", "Private tutoring", ["math tutor near me", "online tutoring service", "репетитор математика"], ["ЕГЭ"]),
  s("language-school", "education", "Языковые школы", "Language schools", ["english language school", "online english course", "курсы английского"], ["иностранные языки"]),
  s("driving-school", "education", "Автошколы", "Driving schools", ["driving school near me", "learn to drive", "автошкола"], ["права"]),
  s("kids-activities", "education", "Детские кружки", "Kids activities & clubs", ["kids after school activities", "children art classes", "детские кружки"], ["секции"]),
  s("music-lessons", "education", "Музыкальные школы", "Music lessons", ["piano lessons near me", "guitar teacher", "уроки музыки"], ["фортепиано"]),
  s("online-courses", "education", "Онлайн-курсы", "Online courses", ["online course platform", "best online courses", "онлайн курсы"], ["обучение"]),
  s("corporate-training", "education", "Корпоративное обучение", "Corporate training", ["corporate training company", "employee training program", "корпоративное обучение"], ["тренинги"]),
  s("exam-prep", "education", "Подготовка к экзаменам", "Exam preparation", ["sat prep course", "ielts preparation", "подготовка к экзаменам"], ["тесты"]),

  // food (8)
  s("restaurants", "food", "Рестораны", "Restaurants", ["restaurant near me", "fine dining restaurant", "ресторан рядом"], ["кафе"]),
  s("coffee-shops", "food", "Кофейни", "Coffee shops", ["coffee shop near me", "specialty coffee", "кофейня рядом"], ["кофе"]),
  s("delivery-food", "food", "Доставка еды", "Food delivery", ["food delivery service", "order food online", "доставка еды"], ["еда на дом"]),
  s("catering", "food", "Кейтеринг", "Catering", ["catering service", "event catering", "кейтеринг на мероприятие"], ["банкет"]),
  s("bakeries", "food", "Пекарни и кондитерские", "Bakeries & pastry", ["bakery near me", "custom cake shop", "пекарня кондитерская"], ["торты"]),
  s("meal-kits", "food", "Готовые рационы / meal kits", "Meal kits & diet boxes", ["meal kit delivery", "healthy meal delivery", "доставка рационов"], ["пп еда"]),
  s("grocery", "food", "Продуктовый ритейл", "Grocery retail", ["grocery delivery", "supermarket online", "доставка продуктов"], ["супермаркет"]),
  s("alcohol-retail", "food", "Алкогольный ритейл", "Alcohol retail", ["wine shop near me", "liquor store delivery", "винный магазин"], ["вино"]),

  // auto (7)
  s("auto-repair", "auto", "Автосервис", "Auto repair shops", ["auto repair near me", "car mechanic", "автосервис рядом"], ["СТО"]),
  s("car-wash", "auto", "Автомойки", "Car washes", ["car wash near me", "detailing car wash", "автомойка"], ["детейлинг"]),
  s("tire-service", "auto", "Шиномонтаж", "Tire services", ["tire shop near me", "tire change service", "шиномонтаж"], ["резина"]),
  s("car-rental", "auto", "Аренда авто", "Car rental", ["car rental near me", "rent a car cheap", "аренда авто"], ["прокат"]),
  s("ride-hailing", "auto", "Такси / ride-hailing", "Taxi & ride-hailing", ["taxi app", "ride hailing service", "вызвать такси"], ["uber"]),
  s("ev-charging", "auto", "Зарядки EV", "EV charging", ["ev charging station", "electric car charger install", "зарядка электромобиля"], ["электромобиль"]),
  s("auto-parts", "auto", "Автозапчасти", "Auto parts retail", ["auto parts store", "car spare parts online", "автозапчасти"], ["запчасти"]),

  // retail (9)
  s("fashion", "retail", "Одежда и fashion", "Fashion retail", ["clothing store online", "fashion boutique", "магазин одежды"], ["мода"]),
  s("shoes", "retail", "Обувь", "Footwear retail", ["shoe store near me", "sneakers shop", "магазин обуви"], ["кроссовки"]),
  s("electronics", "retail", "Электроника", "Electronics retail", ["electronics store", "buy smartphone online", "магазин электроники"], ["гаджеты"]),
  s("home-goods", "retail", "Товары для дома", "Home goods", ["home goods store", "home decor shop", "товары для дома"], ["декор"]),
  s("kids-goods", "retail", "Детские товары", "Kids & baby goods", ["baby store near me", "kids toys shop", "детские товары"], ["игрушки"]),
  s("pet-goods", "retail", "Зоотовары", "Pet supplies", ["pet store near me", "dog food delivery", "зоомагазин"], ["корм"]),
  s("sporting-goods", "retail", "Спорттовары", "Sporting goods", ["sporting goods store", "running shoes shop", "спортивный магазин"], ["спорт"]),
  s("marketplace-sellers", "retail", "Продажи на маркетплейсах", "Marketplace selling", ["sell on amazon", "wildberries seller", "продажа на маркетплейсах"], ["ozon", "wb"]),
  s("secondhand", "retail", "Секонд-хенд / ресейл", "Resale & thrift", ["thrift store near me", "resale marketplace", "секонд хенд"], ["комиссионка"]),

  // business (9)
  s("accounting", "business", "Бухгалтерия и учёт", "Accounting services", ["accounting firm", "bookkeeping service", "бухгалтерские услуги"], ["налоги"]),
  s("legal-b2b", "business", "Юридические услуги B2B", "B2B legal services", ["business lawyer", "corporate legal services", "юридические услуги бизнесу"], ["договоры"]),
  s("hr-recruiting", "business", "HR и рекрутинг", "HR & recruiting", ["recruitment agency", "hiring freelancers", "рекрутинговое агентство"], ["подбор персонала"]),
  s("marketing-agency", "business", "Маркетинговые агентства", "Marketing agencies", ["marketing agency", "digital marketing company", "маркетинговое агентство"], ["реклама"]),
  s("pr-agency", "business", "PR-агентства", "PR agencies", ["pr agency", "public relations firm", "пиар агентство"], ["медиа"]),
  s("consulting", "business", "Бизнес-консалтинг", "Business consulting", ["business consulting firm", "management consultant", "бизнес консалтинг"], ["стратегия"]),
  s("printing", "business", "Полиграфия и печать", "Printing services", ["printing company", "business cards printing", "полиграфия печать"], ["типография"]),
  s("coworking", "business", "Коворкинги", "Coworking spaces", ["coworking space near me", "shared office rental", "коворкинг"], ["офис"]),
  s("event-agency", "business", "Ивент-агентства", "Event agencies", ["event planning company", "corporate event agency", "организация мероприятий"], ["мероприятия"]),

  // finance (7)
  s("insurance", "finance", "Страхование", "Insurance", ["car insurance quote", "health insurance plans", "страхование осаго"], ["полис"]),
  s("banking", "finance", "Банковские услуги", "Banking services", ["open bank account", "business bank account", "открыть счет в банке"], ["банк"]),
  s("microfinance", "finance", "Микрозаймы / кредиты", "Loans & microfinance", ["personal loan online", "payday loan", "микрозайм онлайн"], ["кредит"]),
  s("investment", "finance", "Инвестиции и брокеры", "Investing & brokers", ["stock broker account", "investing app", "брокерский счет"], ["акции"]),
  s("crypto-exchange", "finance", "Криптобиржи / обмен", "Crypto exchanges", ["crypto exchange", "buy bitcoin", "криптобиржа"], ["биткоин"]),
  s("accounting-software", "finance", "Финсофт / учёт", "Accounting software", ["accounting software", "invoicing software", "программа для бухгалтерии"], ["1с"]),
  s("pawnshop", "finance", "Ломбарды", "Pawn shops", ["pawn shop near me", "gold pawn", "ломбард рядом"], ["залог"]),

  // leisure (8)
  s("hotels", "leisure", "Отели и гостиницы", "Hotels", ["hotel booking", "hotels near me", "забронировать отель"], ["гостиница"]),
  s("travel-agency", "leisure", "Турагентства", "Travel agencies", ["travel agency", "tour package deals", "турагентство"], ["туры"]),
  s("air-tickets", "leisure", "Авиабилеты", "Flight tickets", ["cheap flights", "book flight tickets", "авиабилеты дешево"], ["перелёты"]),
  s("cinema", "leisure", "Кинотеатры", "Cinemas", ["movies near me", "cinema tickets", "кинотеатр афиша"], ["фильм"]),
  s("gaming", "leisure", "Гейминг / клубы", "Gaming & game clubs", ["gaming cafe", "pc gaming club", "компьютерный клуб"], ["киберспорт"]),
  s("nightlife", "leisure", "Бары и ночная жизнь", "Bars & nightlife", ["bars near me", "nightclub tickets", "бар рядом"], ["клуб"]),
  s("sports-events", "leisure", "Спортсобытия / билеты", "Sports events tickets", ["sports tickets", "football tickets", "билеты на спорт"], ["матч"]),
  s("tourism-local", "leisure", "Экскурсии и локальный туризм", "Local tours & experiences", ["city tours", "guided walking tour", "экскурсии по городу"], ["гид"]),

  // logistics (6)
  s("courier", "logistics", "Курьерская доставка", "Courier delivery", ["courier service", "same day delivery", "курьерская доставка"], ["доставка"]),
  s("freight", "logistics", "Грузоперевозки", "Freight & trucking", ["freight shipping company", "truck transport", "грузоперевозки"], ["фура"]),
  s("warehouse", "logistics", "Склады и фулфилмент", "Warehousing & fulfillment", ["warehouse storage rental", "fulfillment center", "склад аренда"], ["фулфилмент"]),
  s("last-mile", "logistics", "Last-mile логистика", "Last-mile logistics", ["last mile delivery", "parcel delivery service", "доставка посылок"], ["посылки"]),
  s("customs", "logistics", "Таможня и ВЭД", "Customs & trade", ["customs brokerage", "import export agent", "таможенное оформление"], ["импорт"]),
  s("packaging", "logistics", "Упаковка и тара", "Packaging supplies", ["packaging supplies wholesale", "shipping boxes", "упаковочные материалы"], ["коробки"]),

  // personal (7)
  s("legal-personal", "personal", "Юристы для людей", "Personal legal help", ["lawyer near me", "divorce lawyer", "юрист консультация"], ["адвокат"]),
  s("notary", "personal", "Нотариусы", "Notary services", ["notary near me", "notary public", "нотариус рядом"], ["доверенность"]),
  s("real-estate", "personal", "Недвижимость / риелторы", "Real estate agents", ["real estate agent", "buy apartment", "риелтор квартиры"], ["продажа квартир"]),
  s("nanny", "personal", "Няни и сиделки", "Nannies & caregivers", ["nanny service", "elderly caregiver", "няня на дом"], ["сиделка"]),
  s("wedding", "personal", "Свадебные услуги", "Wedding services", ["wedding planner", "wedding photography", "организация свадьбы"], ["свадьба"]),
  s("photo-video", "personal", "Фото и видеосъёмка", "Photo & video services", ["photographer near me", "event videographer", "фотограф на мероприятие"], ["съёмка"]),
  s("funeral", "personal", "Ритуальные услуги", "Funeral services", ["funeral home", "funeral services", "ритуальные услуги"], ["похоронное бюро"]),

  // digital (5) — minority of catalog
  s("web-dev", "digital", "Веб-разработка", "Web development", ["web development agency", "website design company", "разработка сайта"], ["сайт"]),
  s("seo-marketing", "digital", "SEO и digital-маркетинг", "SEO & digital marketing", ["seo agency", "google ads management", "seo продвижение"], ["реклама"]),
  s("mobile-apps", "digital", "Мобильные приложения", "Mobile apps", ["mobile app development", "ios android app", "разработка приложений"], ["app"]),
  s("cybersecurity", "digital", "Кибербезопасность", "Cybersecurity", ["cybersecurity company", "penetration testing", "кибербезопасность услуги"], ["защита"]),
  s("ai-agents", "digital", "AI-агенты и автоматизация", "AI agents & automation", ["ai agent for business", "ai automation agency", "ai агент для бизнеса"], ["chatgpt business"]),
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
  const primary = (item: Sphere) =>
    (locale === "ru" ? item.nameRu : item.nameEn).toLowerCase();
  return SPHERES.filter((item) => {
    const hay = [
      item.id,
      item.nameRu,
      item.nameEn,
      ...item.queries,
      ...(item.aliases || []),
      groupLabel(item.group, "ru"),
      groupLabel(item.group, "en"),
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
  return SPHERES.find((item) => item.id === id);
}

export function queriesForSphere(id: string, limit = 4): string[] {
  const sphere = getSphere(id);
  if (!sphere) return [];
  return sphere.queries.slice(0, limit);
}

export const SPHERES_COUNT = SPHERES.length;
