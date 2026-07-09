import type { Locale } from "@/lib/i18n/config";

type ProductCenterCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  familyFallbackTag: string;
  familyFallbackSummary: string;
  technicalSeriesLabel: string;
  productsBreadcrumb: string;
  workingPrinciple: string;
  construction: string;
  applications: string;
  seriesInFamily: string;
  availableForSelector: string;
  catalogInquiryProduct: string;
  seriesSuffix: string;
  selectorEligibleSeries: string;
  catalogInquirySeries: string;
  technicalModelTable: string;
  catalogModelsImported: string;
  model: string;
  selectorStatus: string;
};

type KnowledgeCenterCopy = {
  navLabel: string;
  calculationsLabel: string;
  openSizingTool: string;
  sendApplicationData: string;
  openBuyerFilter: string;
  browseProducts: string;
  readRelatedAnswer: string;
  metadataTitle: string;
  metadataDescription: string;
  jsonName: string;
  jsonDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  browseCalculations: string;
  priorityBadge: string;
  priorityTitle: string;
  priorityDescription: string;
  sectionsBadge: string;
  sectionsTitle: string;
  openSection: string;
  featuredBadge: string;
  featuredTitle: string;
  viewAll: string;
  readAnswer: string;
  calculationsMetadataTitle: string;
  calculationsMetadataDescription: string;
  calculationsJsonName: string;
  calculationsJsonDescription: string;
  calculationsHeroEyebrow: string;
  calculationsHeroTitle: string;
  calculationsHeroDescription: string;
  answerToInquiryTitle: string;
  answerToInquiryDescription: string;
  completeDataTitle: string;
  completeDataDescription: string;
  articleSectionName: string;
  directAnswer: string;
  questionsAnswered: string;
  requiredInputs: string;
  formulaLogic: string;
  unit: string;
  calculationSteps: string;
  reviewSteps: string;
  commonMistakes: string;
  catalogSourceNotes: string;
  technicalNotes: string;
  moveToShortlistTitle: string;
  moveToShortlistDescription: string;
  categories: Record<string, { title: string; description: string }>;
  intentLabels: Record<string, string>;
};

const productCenterCopyByLocale: Record<Locale, ProductCenterCopy> = {
  en: {
    metadataTitle: "Shock absorber and vibration isolation products",
    metadataDescription:
      "Browse product families, technical series, model specifications, product features and application notes.",
    eyebrow: "Product catalog",
    title: "Shock absorber and vibration isolation products",
    description:
      "Browse product families, technical series, model specifications, product features and application notes.",
    familyFallbackTag: "Product family",
    familyFallbackSummary: "Browse technical series and catalog models.",
    technicalSeriesLabel: "technical series",
    productsBreadcrumb: "Products",
    workingPrinciple: "Working principle",
    construction: "Construction",
    applications: "Applications",
    seriesInFamily: "Series in this family",
    availableForSelector: "Available for absorber selector",
    catalogInquiryProduct: "Catalog / inquiry product",
    seriesSuffix: "Series",
    selectorEligibleSeries: "Selector eligible absorber series",
    catalogInquirySeries: "Catalog and inquiry series",
    technicalModelTable: "Technical model table",
    catalogModelsImported: "catalog models imported for this series.",
    model: "Model",
    selectorStatus: "Selector status",
  },
  "zh-cn": {
    metadataTitle: "工业缓冲器与隔振产品中心",
    metadataDescription: "浏览产品族、技术系列、型号参数、产品特点和应用说明。",
    eyebrow: "产品目录",
    title: "工业缓冲器、液压缓冲器与隔振产品",
    description: "浏览产品族、技术系列、型号参数、产品特点和应用说明。",
    familyFallbackTag: "产品族",
    familyFallbackSummary: "查看技术系列与目录型号。",
    technicalSeriesLabel: "个技术系列",
    productsBreadcrumb: "产品中心",
    workingPrinciple: "工作原理",
    construction: "结构说明",
    applications: "应用场景",
    seriesInFamily: "该产品族下的系列",
    availableForSelector: "可用于在线选型",
    catalogInquiryProduct: "目录 / 询盘产品",
    seriesSuffix: "系列",
    selectorEligibleSeries: "可参与选型的缓冲器系列",
    catalogInquirySeries: "目录与询盘系列",
    technicalModelTable: "技术型号表",
    catalogModelsImported: "个目录型号已导入该系列。",
    model: "型号",
    selectorStatus: "选型状态",
  },
  de: {
    metadataTitle: "Stoßdämpfer- und Schwingungsisolationsprodukte",
    metadataDescription:
      "Produktfamilien, technische Serien, Modelldaten, Produktmerkmale und Anwendungshinweise durchsuchen.",
    eyebrow: "Produktkatalog",
    title: "Stoßdämpfer- und Schwingungsisolationsprodukte",
    description:
      "Produktfamilien, technische Serien, Modelldaten, Produktmerkmale und Anwendungshinweise durchsuchen.",
    familyFallbackTag: "Produktfamilie",
    familyFallbackSummary: "Technische Serien und Katalogmodelle ansehen.",
    technicalSeriesLabel: "technische Serien",
    productsBreadcrumb: "Produkte",
    workingPrinciple: "Funktionsprinzip",
    construction: "Aufbau",
    applications: "Anwendungen",
    seriesInFamily: "Serien in dieser Familie",
    availableForSelector: "Für den Stoßdämpfer-Selektor verfügbar",
    catalogInquiryProduct: "Katalog- / Anfrageprodukt",
    seriesSuffix: "Serie",
    selectorEligibleSeries: "Für die Auslegung geeignete Stoßdämpferserie",
    catalogInquirySeries: "Katalog- und Anfrageserie",
    technicalModelTable: "Technische Modelltabelle",
    catalogModelsImported: "Katalogmodelle für diese Serie importiert.",
    model: "Modell",
    selectorStatus: "Selektorstatus",
  },
  fr: {
    metadataTitle: "Produits amortisseurs et isolation vibratoire",
    metadataDescription:
      "Parcourez les familles de produits, séries techniques, spécifications modèles, caractéristiques et notes d'application.",
    eyebrow: "Catalogue produits",
    title: "Produits amortisseurs et isolation vibratoire",
    description:
      "Parcourez les familles de produits, séries techniques, spécifications modèles, caractéristiques et notes d'application.",
    familyFallbackTag: "Famille produit",
    familyFallbackSummary: "Parcourir les séries techniques et modèles catalogue.",
    technicalSeriesLabel: "séries techniques",
    productsBreadcrumb: "Produits",
    workingPrinciple: "Principe de fonctionnement",
    construction: "Construction",
    applications: "Applications",
    seriesInFamily: "Séries dans cette famille",
    availableForSelector: "Disponible pour le sélecteur d'amortisseur",
    catalogInquiryProduct: "Produit catalogue / demande",
    seriesSuffix: "Série",
    selectorEligibleSeries: "Série compatible avec le sélecteur",
    catalogInquirySeries: "Série catalogue et demande",
    technicalModelTable: "Tableau technique des modèles",
    catalogModelsImported: "modèles catalogue importés pour cette série.",
    model: "Modèle",
    selectorStatus: "Statut sélecteur",
  },
  it: {
    metadataTitle: "Prodotti ammortizzatori e isolamento antivibrante",
    metadataDescription:
      "Sfoglia famiglie prodotto, serie tecniche, specifiche modello, caratteristiche e note applicative.",
    eyebrow: "Catalogo prodotti",
    title: "Prodotti ammortizzatori e isolamento antivibrante",
    description:
      "Sfoglia famiglie prodotto, serie tecniche, specifiche modello, caratteristiche e note applicative.",
    familyFallbackTag: "Famiglia prodotto",
    familyFallbackSummary: "Consulta serie tecniche e modelli a catalogo.",
    technicalSeriesLabel: "serie tecniche",
    productsBreadcrumb: "Prodotti",
    workingPrinciple: "Principio di funzionamento",
    construction: "Costruzione",
    applications: "Applicazioni",
    seriesInFamily: "Serie in questa famiglia",
    availableForSelector: "Disponibile per il selettore ammortizzatori",
    catalogInquiryProduct: "Prodotto a catalogo / richiesta",
    seriesSuffix: "Serie",
    selectorEligibleSeries: "Serie ammortizzatore selezionabile",
    catalogInquirySeries: "Serie catalogo e richiesta",
    technicalModelTable: "Tabella tecnica modelli",
    catalogModelsImported: "modelli a catalogo importati per questa serie.",
    model: "Modello",
    selectorStatus: "Stato selettore",
  },
};

const knowledgeCategoriesEn = {
  calculations: {
    title: "Shock Absorber Calculations",
    description:
      "Sizing questions that can be answered now using application data, energy checks and catalog rating logic.",
  },
  "selection-guides": {
    title: "Selection Guides",
    description:
      "Guides for narrowing product families by motion type, drive source and installation constraints.",
  },
  applications: {
    title: "Application Notes",
    description:
      "Application-led guidance for conveyors, packaging machines, rotary tables, cylinders and heavy equipment.",
  },
  "replacement-cross-reference": {
    title: "Replacement & Cross Reference",
    description:
      "Content for buyers replacing existing industrial shock absorbers or comparing alternatives to known brands.",
  },
  "installation-troubleshooting": {
    title: "Installation & Troubleshooting",
    description:
      "Installation checks, failure symptoms and field issues such as side load, bottoming out, oil leakage and overheating.",
  },
  "buyer-faq": {
    title: "Buyer FAQ",
    description:
      "Procurement-oriented answers for RFQs, samples, lead time, customization, CAD, datasheets and export supply.",
  },
};

const intentLabelsEn: Record<string, string> = {
  engineering_calculation: "engineering calculation",
  selection_guidance: "selection guidance",
  application_research: "application research",
  replacement_inquiry: "replacement inquiry",
  technical_support: "technical support",
  buyer_procurement: "buyer procurement",
  pre_calculation_requirements: "pre-calculation requirements",
  impact_energy_calculation: "impact energy calculation",
  energy_per_hour_calculation: "energy per hour calculation",
  impact_force_calculation: "impact force calculation",
  horizontal_motion_sizing: "horizontal motion sizing",
  vertical_motion_sizing: "vertical motion sizing",
  rotary_motion_sizing: "rotary motion sizing",
  selection_curve_explanation: "selection curve explanation",
};

const knowledgeCenterCopyByLocale: Record<Locale, KnowledgeCenterCopy> = {
  en: {
    navLabel: "Knowledge Center",
    calculationsLabel: "Calculations",
    openSizingTool: "Open sizing tool",
    sendApplicationData: "Send application data",
    openBuyerFilter: "Open buyer quick filter",
    browseProducts: "Browse products",
    readRelatedAnswer: "Read related answer",
    metadataTitle: "Industrial Shock Absorber Knowledge Center",
    metadataDescription:
      "Calculation guides, selection notes, applications and buyer FAQ for industrial shock absorber projects.",
    jsonName: "Industrial Shock Absorber Knowledge Center",
    jsonDescription:
      "Structured engineering resources for industrial shock absorber calculation, selection and inquiry preparation.",
    heroEyebrow: "Knowledge Center",
    heroTitle: "Industrial shock absorber knowledge built for engineering search.",
    heroDescription:
      "Use this center to answer calculation, selection, application, replacement and buyer questions with structured product knowledge that can lead directly to sizing or RFQ.",
    browseCalculations: "Browse calculations",
    priorityBadge: "Calculation priority",
    priorityTitle: "Calculation answers are ready first.",
    priorityDescription:
      "The product catalog already defines the core rating language: stroke, impact velocity, energy per cycle, energy per hour and maximum impact force. These topics are mapped into answer pages and structured JSON-LD.",
    sectionsBadge: "Sections",
    sectionsTitle: "Knowledge Center sections",
    openSection: "Open section",
    featuredBadge: "Featured calculation answers",
    featuredTitle: "Start with questions buyers ask before sending an inquiry.",
    viewAll: "View all",
    readAnswer: "Read answer",
    calculationsMetadataTitle: "Shock Absorber Calculations",
    calculationsMetadataDescription:
      "Industrial shock absorber calculation questions for impact energy, hourly energy, force, horizontal motion, vertical motion and rotary motion.",
    calculationsJsonName: "Shock Absorber Calculation Questions",
    calculationsJsonDescription:
      "Calculation topics that can be answered from product catalog rating logic and site calculator formulas.",
    calculationsHeroEyebrow: "Shock Absorber Calculations",
    calculationsHeroTitle: "Calculation questions we can answer directly from product knowledge.",
    calculationsHeroDescription:
      "These pages turn catalog calculation language into direct answers for engineers: required inputs, formulas, checks, common mistakes and the next action toward sizing or RFQ.",
    answerToInquiryTitle: "From answer to inquiry",
    answerToInquiryDescription:
      "Each answer page links to the engineer sizing tool, buyer filter or contact form so technical visitors have a clear conversion path.",
    completeDataTitle: "Have complete application data?",
    completeDataDescription:
      "Move from article guidance to a calculated shortlist, or send the application data for an engineering review.",
    articleSectionName: "Shock Absorber Calculations",
    directAnswer: "Direct answer",
    questionsAnswered: "Questions this page answers",
    requiredInputs: "Required inputs",
    formulaLogic: "Formula logic",
    unit: "Unit",
    calculationSteps: "Calculation steps",
    reviewSteps: "Review steps",
    commonMistakes: "Common mistakes",
    catalogSourceNotes: "Catalog source notes",
    technicalNotes: "Technical notes",
    moveToShortlistTitle: "Move from answer to model shortlist.",
    moveToShortlistDescription:
      "Use the sizing tool when you have the inputs, or send the application data for engineering review.",
    categories: knowledgeCategoriesEn,
    intentLabels: intentLabelsEn,
  },
  "zh-cn": {
    navLabel: "知识中心",
    calculationsLabel: "计算选型",
    openSizingTool: "打开选型工具",
    sendApplicationData: "发送应用数据",
    openBuyerFilter: "打开采购快速筛选",
    browseProducts: "浏览产品",
    readRelatedAnswer: "查看相关回答",
    metadataTitle: "工业缓冲器知识中心",
    metadataDescription: "面向工业缓冲器项目的计算指南、选型说明、应用场景和采购 FAQ。",
    jsonName: "工业缓冲器知识中心",
    jsonDescription: "用于工业缓冲器计算、选型和询盘准备的结构化工程资料。",
    heroEyebrow: "知识中心",
    heroTitle: "围绕工程选型建立工业缓冲器知识内容。",
    heroDescription:
      "集中回答计算、选型、应用、替换和采购问题，并把技术内容导向在线选型、型号 shortlist 或询盘。",
    browseCalculations: "浏览计算内容",
    priorityBadge: "计算内容优先",
    priorityTitle: "计算类回答先完成。",
    priorityDescription:
      "产品目录已经定义了核心参数语言：行程、撞击速度、单次能量、每小时能量和最大冲击力。这些主题已整理为回答页面和结构化 JSON-LD。",
    sectionsBadge: "栏目",
    sectionsTitle: "知识中心栏目",
    openSection: "打开栏目",
    featuredBadge: "重点计算回答",
    featuredTitle: "先回答买家发起询盘前最常问的问题。",
    viewAll: "查看全部",
    readAnswer: "阅读回答",
    calculationsMetadataTitle: "工业缓冲器计算选型",
    calculationsMetadataDescription:
      "工业缓冲器关于冲击能量、每小时能量、力值、水平运动、垂直运动和旋转运动的计算问题。",
    calculationsJsonName: "工业缓冲器计算问题",
    calculationsJsonDescription: "基于产品目录额定值逻辑和网站计算公式可直接回答的计算主题。",
    calculationsHeroEyebrow: "工业缓冲器计算",
    calculationsHeroTitle: "这些计算问题可以直接基于产品知识回答。",
    calculationsHeroDescription:
      "这些页面把目录中的计算语言转为工程师可用的直接回答：所需输入、公式、校核点、常见错误以及下一步选型或询盘动作。",
    answerToInquiryTitle: "从回答到询盘",
    answerToInquiryDescription:
      "每个回答页面都连接工程师选型、采购筛选或联系表单，让技术访问者有清晰的转化路径。",
    completeDataTitle: "应用数据已经准备好？",
    completeDataDescription: "从文章说明进入计算 shortlist，或发送应用数据做工程复核。",
    articleSectionName: "工业缓冲器计算选型",
    directAnswer: "直接回答",
    questionsAnswered: "本页回答的问题",
    requiredInputs: "所需输入",
    formulaLogic: "公式逻辑",
    unit: "单位",
    calculationSteps: "计算步骤",
    reviewSteps: "判断步骤",
    commonMistakes: "常见错误",
    catalogSourceNotes: "目录来源说明",
    technicalNotes: "技术说明",
    moveToShortlistTitle: "从答案进入型号 shortlist。",
    moveToShortlistDescription: "已有输入参数时可使用选型工具，也可以发送应用数据做工程复核。",
    categories: {
      calculations: {
        title: "缓冲器计算选型",
        description: "基于应用数据、能量校核和目录额定值逻辑，现在即可回答的计算问题。",
      },
      "selection-guides": {
        title: "选型指南",
        description: "按运动形式、驱动方式和安装限制收敛产品族的指南。",
      },
      applications: {
        title: "应用说明",
        description: "围绕输送线、包装机、旋转台、气缸和重型设备的应用型内容。",
      },
      "replacement-cross-reference": {
        title: "替换与交叉参考",
        description: "面向替换既有工业缓冲器或对比已知品牌替代方案的采购内容。",
      },
      "installation-troubleshooting": {
        title: "安装与故障排查",
        description: "安装检查、失效现象以及侧向力、触底、漏油和过热等现场问题。",
      },
      "buyer-faq": {
        title: "采购 FAQ",
        description: "围绕询价、样品、交期、定制、CAD、数据表和出口供应的采购回答。",
      },
    },
    intentLabels: {
      engineering_calculation: "工程计算",
      selection_guidance: "选型指导",
      application_research: "应用调研",
      replacement_inquiry: "替换询盘",
      technical_support: "技术支持",
      buyer_procurement: "采购问题",
      pre_calculation_requirements: "计算前数据要求",
      impact_energy_calculation: "冲击能量计算",
      energy_per_hour_calculation: "每小时能量计算",
      impact_force_calculation: "冲击力计算",
      horizontal_motion_sizing: "水平运动选型",
      vertical_motion_sizing: "垂直运动选型",
      rotary_motion_sizing: "旋转运动选型",
      selection_curve_explanation: "选型曲线说明",
    },
  },
  de: {
    navLabel: "Wissenszentrum",
    calculationsLabel: "Berechnungen",
    openSizingTool: "Auslegungstool öffnen",
    sendApplicationData: "Anwendungsdaten senden",
    openBuyerFilter: "Schnellfilter öffnen",
    browseProducts: "Produkte ansehen",
    readRelatedAnswer: "Verwandte Antwort lesen",
    metadataTitle: "Wissenszentrum für industrielle Stoßdämpfer",
    metadataDescription:
      "Berechnungsleitfäden, Auswahlhinweise, Anwendungen und Einkaufs-FAQ für Stoßdämpferprojekte.",
    jsonName: "Wissenszentrum für industrielle Stoßdämpfer",
    jsonDescription:
      "Strukturierte technische Ressourcen für Berechnung, Auswahl und Anfragevorbereitung.",
    heroEyebrow: "Wissenszentrum",
    heroTitle: "Technisches Wissen für die Auswahl industrieller Stoßdämpfer.",
    heroDescription:
      "Antworten auf Berechnung, Auswahl, Anwendung, Ersatz und Einkauf führen direkt zur Auslegung, Modell-Shortlist oder Anfrage.",
    browseCalculations: "Berechnungen ansehen",
    priorityBadge: "Berechnung zuerst",
    priorityTitle: "Berechnungsantworten stehen zuerst bereit.",
    priorityDescription:
      "Der Produktkatalog definiert bereits die Kernwerte: Hub, Aufprallgeschwindigkeit, Energie pro Hub, Energie pro Stunde und maximale Stoßkraft. Diese Themen sind als Antwortseiten und JSON-LD strukturiert.",
    sectionsBadge: "Bereiche",
    sectionsTitle: "Bereiche im Wissenszentrum",
    openSection: "Bereich öffnen",
    featuredBadge: "Wichtige Berechnungsantworten",
    featuredTitle: "Starten Sie mit Fragen, die vor einer Anfrage häufig gestellt werden.",
    viewAll: "Alle ansehen",
    readAnswer: "Antwort lesen",
    calculationsMetadataTitle: "Stoßdämpfer-Berechnungen",
    calculationsMetadataDescription:
      "Berechnungsfragen zu Energie, Stundenleistung, Kraft, horizontaler, vertikaler und rotierender Bewegung.",
    calculationsJsonName: "Berechnungsfragen für Stoßdämpfer",
    calculationsJsonDescription:
      "Berechnungsthemen, die sich aus Kataloglogik und Rechnerformeln beantworten lassen.",
    calculationsHeroEyebrow: "Stoßdämpfer-Berechnungen",
    calculationsHeroTitle: "Berechnungsfragen, die direkt aus Produktwissen beantwortet werden können.",
    calculationsHeroDescription:
      "Diese Seiten übersetzen Kataloglogik in direkte Antworten: Eingaben, Formeln, Prüfungen, typische Fehler und nächste Schritte Richtung Auslegung oder Anfrage.",
    answerToInquiryTitle: "Von der Antwort zur Anfrage",
    answerToInquiryDescription:
      "Jede Antwortseite verlinkt auf Auslegung, Schnellfilter oder Kontaktformular, damit technische Besucher einen klaren nächsten Schritt haben.",
    completeDataTitle: "Anwendungsdaten vollständig?",
    completeDataDescription:
      "Wechseln Sie von der Anleitung zur berechneten Shortlist oder senden Sie die Daten zur technischen Prüfung.",
    articleSectionName: "Stoßdämpfer-Berechnungen",
    directAnswer: "Direkte Antwort",
    questionsAnswered: "Fragen, die diese Seite beantwortet",
    requiredInputs: "Erforderliche Eingaben",
    formulaLogic: "Formellogik",
    unit: "Einheit",
    calculationSteps: "Berechnungsschritte",
    reviewSteps: "Prüfschritte",
    commonMistakes: "Typische Fehler",
    catalogSourceNotes: "Kataloghinweise",
    technicalNotes: "Technische Hinweise",
    moveToShortlistTitle: "Von der Antwort zur Modell-Shortlist.",
    moveToShortlistDescription:
      "Nutzen Sie das Auslegungstool, wenn die Eingaben vorliegen, oder senden Sie die Anwendungsdaten zur technischen Prüfung.",
    categories: {
      calculations: {
        title: "Stoßdämpfer-Berechnungen",
        description:
          "Auslegungsfragen, die jetzt mit Anwendungsdaten, Energieprüfung und Kataloglogik beantwortet werden können.",
      },
      "selection-guides": {
        title: "Auswahlleitfäden",
        description:
          "Leitfäden zur Eingrenzung von Produktfamilien nach Bewegung, Antrieb und Einbaubedingungen.",
      },
      applications: {
        title: "Anwendungshinweise",
        description: "Anwendungsorientierte Hinweise für Förderer, Verpackungsmaschinen, Rundtische, Zylinder und schwere Anlagen.",
      },
      "replacement-cross-reference": {
        title: "Ersatz & Vergleich",
        description: "Inhalte für Einkäufer, die vorhandene Stoßdämpfer ersetzen oder Alternativen vergleichen.",
      },
      "installation-troubleshooting": {
        title: "Installation & Fehlersuche",
        description: "Einbauprüfungen, Ausfallsymptome und Feldprobleme wie Seitenlast, Durchschlagen, Ölleckage und Überhitzung.",
      },
      "buyer-faq": {
        title: "Einkaufs-FAQ",
        description: "Antworten zu Anfrage, Muster, Lieferzeit, Anpassung, CAD, Datenblättern und Exportlieferung.",
      },
    },
    intentLabels: {
      ...intentLabelsEn,
      engineering_calculation: "technische Berechnung",
      selection_guidance: "Auswahlhilfe",
      application_research: "Anwendungsrecherche",
      replacement_inquiry: "Ersatzanfrage",
      technical_support: "technischer Support",
      buyer_procurement: "Einkauf",
    },
  },
  fr: {
    navLabel: "Centre de connaissances",
    calculationsLabel: "Calculs",
    openSizingTool: "Ouvrir l'outil de dimensionnement",
    sendApplicationData: "Envoyer les données d'application",
    openBuyerFilter: "Ouvrir le filtre acheteur",
    browseProducts: "Voir les produits",
    readRelatedAnswer: "Lire la réponse liée",
    metadataTitle: "Centre de connaissances amortisseurs industriels",
    metadataDescription:
      "Guides de calcul, notes de sélection, applications et FAQ achat pour les projets d'amortisseurs industriels.",
    jsonName: "Centre de connaissances amortisseurs industriels",
    jsonDescription:
      "Ressources techniques structurées pour le calcul, la sélection et la préparation de demande.",
    heroEyebrow: "Centre de connaissances",
    heroTitle: "Connaissances techniques pour sélectionner un amortisseur industriel.",
    heroDescription:
      "Répondez aux questions de calcul, sélection, application, remplacement et achat, puis passez au dimensionnement, à la shortlist ou à la demande.",
    browseCalculations: "Voir les calculs",
    priorityBadge: "Calculs prioritaires",
    priorityTitle: "Les réponses de calcul sont prêtes en premier.",
    priorityDescription:
      "Le catalogue définit déjà les valeurs clés : course, vitesse d'impact, énergie par cycle, énergie par heure et force d'impact maximale. Ces thèmes sont structurés en pages de réponse et JSON-LD.",
    sectionsBadge: "Rubriques",
    sectionsTitle: "Rubriques du centre de connaissances",
    openSection: "Ouvrir la rubrique",
    featuredBadge: "Réponses de calcul clés",
    featuredTitle: "Commencez par les questions posées avant une demande.",
    viewAll: "Tout voir",
    readAnswer: "Lire la réponse",
    calculationsMetadataTitle: "Calculs d'amortisseurs industriels",
    calculationsMetadataDescription:
      "Questions de calcul sur l'énergie d'impact, l'énergie horaire, la force et les mouvements horizontal, vertical et rotatif.",
    calculationsJsonName: "Questions de calcul amortisseur",
    calculationsJsonDescription:
      "Thèmes de calcul répondus à partir de la logique catalogue et des formules du site.",
    calculationsHeroEyebrow: "Calculs amortisseur",
    calculationsHeroTitle: "Questions de calcul auxquelles le savoir produit répond directement.",
    calculationsHeroDescription:
      "Ces pages transforment le langage catalogue en réponses directes : données requises, formules, contrôles, erreurs fréquentes et prochaine action vers dimensionnement ou demande.",
    answerToInquiryTitle: "De la réponse à la demande",
    answerToInquiryDescription:
      "Chaque page relie l'outil de dimensionnement, le filtre acheteur ou le formulaire de contact pour donner une étape claire.",
    completeDataTitle: "Données d'application complètes ?",
    completeDataDescription:
      "Passez du guide à une shortlist calculée, ou envoyez les données pour une revue technique.",
    articleSectionName: "Calculs amortisseur",
    directAnswer: "Réponse directe",
    questionsAnswered: "Questions traitées par cette page",
    requiredInputs: "Données requises",
    formulaLogic: "Logique de formule",
    unit: "Unité",
    calculationSteps: "Étapes de calcul",
    reviewSteps: "Étapes de revue",
    commonMistakes: "Erreurs fréquentes",
    catalogSourceNotes: "Notes source catalogue",
    technicalNotes: "Notes techniques",
    moveToShortlistTitle: "Passer de la réponse à la shortlist modèle.",
    moveToShortlistDescription:
      "Utilisez l'outil de dimensionnement si vous avez les données, ou envoyez-les pour une revue technique.",
    categories: {
      calculations: {
        title: "Calculs amortisseur",
        description: "Questions de dimensionnement répondables avec données d'application, contrôles énergie et logique catalogue.",
      },
      "selection-guides": {
        title: "Guides de sélection",
        description: "Guides pour réduire les familles de produits selon mouvement, entraînement et contraintes d'installation.",
      },
      applications: {
        title: "Notes d'application",
        description: "Conseils par application pour convoyeurs, machines d'emballage, tables rotatives, vérins et équipements lourds.",
      },
      "replacement-cross-reference": {
        title: "Remplacement & équivalence",
        description: "Contenu pour remplacer des amortisseurs existants ou comparer des alternatives à des marques connues.",
      },
      "installation-troubleshooting": {
        title: "Installation & dépannage",
        description: "Contrôles d'installation, symptômes de panne et problèmes terrain : charge latérale, talonnage, fuite d'huile, surchauffe.",
      },
      "buyer-faq": {
        title: "FAQ acheteur",
        description: "Réponses sur RFQ, échantillons, délais, personnalisation, CAD, fiches techniques et export.",
      },
    },
    intentLabels: {
      ...intentLabelsEn,
      engineering_calculation: "calcul technique",
      selection_guidance: "aide à la sélection",
      application_research: "recherche d'application",
      replacement_inquiry: "demande de remplacement",
      technical_support: "support technique",
      buyer_procurement: "achat",
    },
  },
  it: {
    navLabel: "Centro conoscenze",
    calculationsLabel: "Calcoli",
    openSizingTool: "Apri strumento di dimensionamento",
    sendApplicationData: "Invia dati applicativi",
    openBuyerFilter: "Apri filtro rapido acquisti",
    browseProducts: "Sfoglia prodotti",
    readRelatedAnswer: "Leggi risposta correlata",
    metadataTitle: "Centro conoscenze per ammortizzatori industriali",
    metadataDescription:
      "Guide di calcolo, note di selezione, applicazioni e FAQ acquisti per progetti con ammortizzatori industriali.",
    jsonName: "Centro conoscenze per ammortizzatori industriali",
    jsonDescription:
      "Risorse tecniche strutturate per calcolo, selezione e preparazione della richiesta.",
    heroEyebrow: "Centro conoscenze",
    heroTitle: "Conoscenza tecnica per selezionare ammortizzatori industriali.",
    heroDescription:
      "Rispondi a domande su calcolo, selezione, applicazione, sostituzione e acquisto, poi passa a dimensionamento, shortlist o richiesta.",
    browseCalculations: "Vedi calcoli",
    priorityBadge: "Priorità calcoli",
    priorityTitle: "Le risposte di calcolo sono pronte per prime.",
    priorityDescription:
      "Il catalogo definisce già i parametri chiave: corsa, velocità d'impatto, energia per ciclo, energia per ora e forza massima. Questi temi sono mappati in pagine risposta e JSON-LD.",
    sectionsBadge: "Sezioni",
    sectionsTitle: "Sezioni del Centro conoscenze",
    openSection: "Apri sezione",
    featuredBadge: "Risposte di calcolo in evidenza",
    featuredTitle: "Parti dalle domande poste prima di inviare una richiesta.",
    viewAll: "Vedi tutto",
    readAnswer: "Leggi risposta",
    calculationsMetadataTitle: "Calcoli per ammortizzatori industriali",
    calculationsMetadataDescription:
      "Domande di calcolo su energia d'impatto, energia oraria, forza e moto orizzontale, verticale e rotativo.",
    calculationsJsonName: "Domande di calcolo ammortizzatore",
    calculationsJsonDescription:
      "Temi di calcolo risolvibili dalla logica del catalogo e dalle formule del sito.",
    calculationsHeroEyebrow: "Calcoli ammortizzatore",
    calculationsHeroTitle: "Domande di calcolo a cui possiamo rispondere dal know-how prodotto.",
    calculationsHeroDescription:
      "Queste pagine trasformano il linguaggio del catalogo in risposte dirette: dati richiesti, formule, controlli, errori comuni e prossimo passo verso dimensionamento o richiesta.",
    answerToInquiryTitle: "Dalla risposta alla richiesta",
    answerToInquiryDescription:
      "Ogni risposta collega strumento tecnico, filtro acquisti o modulo contatto, offrendo un percorso chiaro.",
    completeDataTitle: "Hai già tutti i dati applicativi?",
    completeDataDescription:
      "Passa dalla guida a una shortlist calcolata, oppure invia i dati per una revisione tecnica.",
    articleSectionName: "Calcoli ammortizzatore",
    directAnswer: "Risposta diretta",
    questionsAnswered: "Domande a cui risponde questa pagina",
    requiredInputs: "Dati richiesti",
    formulaLogic: "Logica della formula",
    unit: "Unità",
    calculationSteps: "Passaggi di calcolo",
    reviewSteps: "Passaggi di verifica",
    commonMistakes: "Errori comuni",
    catalogSourceNotes: "Note fonte catalogo",
    technicalNotes: "Note tecniche",
    moveToShortlistTitle: "Dalla risposta alla shortlist dei modelli.",
    moveToShortlistDescription:
      "Usa lo strumento di dimensionamento quando hai i dati, oppure inviali per una revisione tecnica.",
    categories: {
      calculations: {
        title: "Calcoli ammortizzatore",
        description: "Domande di dimensionamento risolvibili con dati applicativi, controlli energia e logica catalogo.",
      },
      "selection-guides": {
        title: "Guide alla selezione",
        description: "Guide per restringere le famiglie prodotto in base a movimento, azionamento e vincoli di installazione.",
      },
      applications: {
        title: "Note applicative",
        description: "Indicazioni per trasportatori, macchine packaging, tavole rotanti, cilindri e attrezzature heavy-duty.",
      },
      "replacement-cross-reference": {
        title: "Sostituzione e confronto",
        description: "Contenuti per sostituire ammortizzatori esistenti o confrontare alternative a marchi noti.",
      },
      "installation-troubleshooting": {
        title: "Installazione e risoluzione problemi",
        description: "Controlli di installazione e problemi in campo: carico laterale, fine corsa, perdite d'olio e surriscaldamento.",
      },
      "buyer-faq": {
        title: "FAQ acquisti",
        description: "Risposte su RFQ, campioni, tempi, personalizzazione, CAD, schede tecniche e fornitura export.",
      },
    },
    intentLabels: {
      ...intentLabelsEn,
      engineering_calculation: "calcolo tecnico",
      selection_guidance: "guida alla selezione",
      application_research: "ricerca applicativa",
      replacement_inquiry: "richiesta sostituzione",
      technical_support: "supporto tecnico",
      buyer_procurement: "acquisti",
    },
  },
};

export function getProductCenterCopy(locale: Locale) {
  return productCenterCopyByLocale[locale] ?? productCenterCopyByLocale.en;
}

export function getKnowledgeCenterCopy(locale: Locale) {
  return knowledgeCenterCopyByLocale[locale] ?? knowledgeCenterCopyByLocale.en;
}

export function getIntentLabel(locale: Locale, intent: string) {
  const copy = getKnowledgeCenterCopy(locale);
  return copy.intentLabels[intent] ?? intent.replaceAll("_", " ");
}

export function getKnowledgeRelatedLinkLabel(locale: Locale, href: string) {
  const copy = getKnowledgeCenterCopy(locale);

  if (href.startsWith("/selector/engineer")) {
    return copy.openSizingTool;
  }

  if (href.startsWith("/selector/buyer")) {
    return copy.openBuyerFilter;
  }

  if (href.startsWith("/products")) {
    return copy.browseProducts;
  }

  if (href.startsWith("/knowledge-center/calculations")) {
    return copy.readRelatedAnswer;
  }

  if (href.startsWith("/contact")) {
    return copy.sendApplicationData;
  }

  return copy.readRelatedAnswer;
}
