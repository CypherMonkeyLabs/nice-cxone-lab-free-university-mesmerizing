const STRINGS = {
  en: { greeting: "Welcome to the floor", hero: "Run the contact, not the brochure.", lede: "A free study lab for ACD, Studio, bullseye, WEM, Enlighten, APIs, and the bridges out of UCCE and Avaya.", note: "Menu labels can switch language. Lesson text stays English, next to its citation.", diagrams: "Diagrams", flows: "Flows", charts: "Charts", cheat: "Cheat Codes", play: "Play", ecosystem: "Ecosystem", downloads: "Downloads", careers: "Careers", regions: "Regions", search: "Search skills, Studio, Autopilot, UCCE…", audio: "Architect briefing" },
  es: { greeting: "Bienvenido al piso", hero: "Sigue el contacto, no el folleto.", lede: "Un laboratorio libre para ACD, Studio, bullseye, WEM, Enlighten, APIs y los puentes desde UCCE y Avaya.", note: "El menú cambia de idioma. Las lecciones siguen en inglés, junto a su cita.", diagrams: "Diagramas", flows: "Flujos", charts: "Gráficos", cheat: "Trucos", play: "Jugar", ecosystem: "Ecosistema", downloads: "Descargas", careers: "Carreras", regions: "Regiones", search: "Buscar skills, Studio, Autopilot, UCCE…", audio: "Charla de arquitectos" },
  hi: { greeting: "फ़्लोर पर स्वागत है", hero: "संपर्क को चलाओ, विवरणिका को नहीं।", lede: "ACD, Studio, bullseye, WEM, Enlighten, APIs और UCCE तथा Avaya से पुलों के लिए एक मुक्त प्रयोगशाला।", note: "मेनू की भाषा बदलती है। पाठ अंग्रेज़ी में रहता है, उद्धरण के साथ।", diagrams: "आरेख", flows: "प्रवाह", charts: "चार्ट", cheat: "चीट कोड", play: "खेल", ecosystem: "इकोसिस्टम", downloads: "डाउनलोड", careers: "करियर", regions: "क्षेत्र", search: "स्किल, Studio, Autopilot खोजें…", audio: "आर्किटेक्ट वार्ता" },
  te: { greeting: "ఫ్లోర్‌కు స్వాగతం", hero: "సంప్రదింపును నడపండి, బ్రోషర్‌ను కాదు.", lede: "ACD, Studio, bullseye, WEM, Enlighten, APIs మరియు UCCE, Avaya వంతెనల కోసం ఉచిత ప్రయోగశాల.", note: "మెనూ భాష మారుతుంది. పాఠాలు ఇంగ్లీషులోనే, మూలంతో ఉంటాయి.", diagrams: "రేఖాచిత్రాలు", flows: "ప్రవాహాలు", charts: "పటాలు", cheat: "చీట్ కోడ్స్", play: "ఆట", ecosystem: "వ్యవస్థ", downloads: "డౌన్‌లోడ్స్", careers: "వృత్తి", regions: "ప్రాంతాలు", search: "స్కిల్స్, Studio వెతకండి…", audio: "ఆర్కిటెక్ట్ సంభాషణ" },
  fr: { greeting: "Bienvenue sur le plateau", hero: "Suivez le contact, pas la brochure.", lede: "Un laboratoire gratuit pour l’ACD, Studio, le bullseye, WEM, Enlighten, les API et les ponts UCCE et Avaya.", note: "Le menu change de langue. Les leçons restent en anglais, avec leur source.", diagrams: "Schémas", flows: "Flux", charts: "Graphiques", cheat: "Antisèches", play: "Jouer", ecosystem: "Écosystème", downloads: "Téléchargements", careers: "Parcours", regions: "Régions", search: "Chercher skills, Studio, Autopilot…", audio: "Brief architectes" },
  de: { greeting: "Willkommen auf der Fläche", hero: "Folge dem Kontakt, nicht der Broschüre.", lede: "Ein freies Labor für ACD, Studio, Bullseye, WEM, Enlighten, APIs und die Brücken aus UCCE und Avaya.", note: "Die Menüsprache wechselt. Lektionen bleiben Englisch, mit Quelle.", diagrams: "Diagramme", flows: "Flüsse", charts: "Schaubilder", cheat: "Spickzettel", play: "Spielen", ecosystem: "Ökosystem", downloads: "Downloads", careers: "Laufbahn", regions: "Regionen", search: "Skills, Studio, Autopilot suchen…", audio: "Architektengespräch" },
  ja: { greeting: "フロアへようこそ", hero: "パンフレットではなく、コンタクトを追え。", lede: "ACD、Studio、bullseye、WEM、Enlighten、API、UCCE と Avaya からの橋を学ぶ無料ラボ。", note: "メニューだけ言語が変わります。本文は出典つきの英語のままです。", diagrams: "図", flows: "フロー", charts: "チャート", cheat: "チート", play: "プレイ", ecosystem: "エコシステム", downloads: "ダウンロード", careers: "キャリア", regions: "リージョン", search: "スキル、Studio、Autopilot を検索…", audio: "アーキテクト対話" },
  ar: { greeting: "أهلًا بك في الطابق", hero: "تتبّع جهة الاتصال، لا الكتيّب.", lede: "مختبر مجاني لـ ACD وStudio وbullseye وWEM وEnlighten وواجهات البرمجة وجسور UCCE وAvaya.", note: "لغة القائمة تتبدل. تبقى الدروس بالإنجليزية مع مصادرها.", diagrams: "مخططات", flows: "تدفقات", charts: "رسوم", cheat: "أوراق الغش", play: "لعب", ecosystem: "المنظومة", downloads: "تنزيلات", careers: "مسارات", regions: "مناطق", search: "ابحث في المهارات وStudio…", audio: "حوار المعماريين" },
};

const RTL = new Set(["ar"]);
let lang = "en";

export function currentLang() {
  return lang;
}

export function t(key) {
  const pack = STRINGS[lang] || STRINGS.en;
  return pack[key] || STRINGS.en[key] || key;
}

export function setLang(code) {
  lang = STRINGS[code] ? code : "en";
  try { localStorage.setItem("cxone-lab-lang", lang); } catch (error) { /* ignore */ }
  document.documentElement.lang = lang === "en" ? "en" : lang;
  document.documentElement.dir = RTL.has(lang) ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (STRINGS.en[key]) node.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  const select = document.getElementById("lang");
  if (select && select.value !== lang) select.value = lang;
}

export function bootLang() {
  let saved = "en";
  try { saved = localStorage.getItem("cxone-lab-lang") || "en"; } catch (error) { saved = "en"; }
  setLang(saved);
}
