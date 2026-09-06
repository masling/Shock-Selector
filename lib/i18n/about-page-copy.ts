import type { Locale } from "@/lib/i18n/config";

type EvidenceStatus = "current" | "documented" | "historical";

type AboutPageCopy = {
  location: string;
  capabilitiesTitle: string;
  capabilitiesDescription: string;
  capabilities: Array<{ title: string; description: string }>;
  evidenceTitle: string;
  evidenceDescription: string;
  evidence: Array<{ title: string; scope: string; status: EvidenceStatus; statusText: string }>;
  disclosure: string;
  contactTitle: string;
  contactDescription: string;
  contactAction: string;
};

const english: AboutPageCopy = {
  location: "Wuxi, Jiangsu, China",
  capabilitiesTitle: "Products and engineering support",
  capabilitiesDescription: "The company combines industrial component supply with practical application review and model-selection support.",
  capabilities: [
    { title: "Shock absorption", description: "Adjustable, non-adjustable, heavy-duty and long-life shock-absorber ranges for industrial motion protection." },
    { title: "Vibration isolation", description: "Wire-rope and special isolator families for equipment protection and demanding environmental conditions." },
    { title: "Selection and documentation", description: "Application review, model comparison, sizing guidance and controlled access to approved technical drawings." },
  ],
  evidenceTitle: "Compliance and intellectual-property evidence",
  evidenceDescription: "A concise view of the quality, compliance and intellectual-property records supporting EKD products.",
  evidence: [
    { title: "EKD trademark registration", scope: "Class 7 machinery components; registration document valid through 27 May 2030.", status: "current", statusText: "Current record" },
    { title: "RoHS 2 test documentation", scope: "Test records for the EK, EN, ES, EI and ED shock-absorber series, using IEC 62321 methods.", status: "documented", statusText: "On file" },
    { title: "Design patent documentation", scope: "Design documentation for a metal vibration-isolation support.", status: "documented", statusText: "On file" },
    { title: "CE conformity documentation", scope: "Conformity documentation covering the EK, EN, ES, EI and ED shock-absorber series.", status: "documented", statusText: "On file" },
    { title: "ISO 9001 quality-management documentation", scope: "Quality-management system documentation referencing ISO 9001:2015.", status: "documented", statusText: "On file" },
  ],
  disclosure: "The latest applicable certificates and supporting files are confirmed and shared during supplier qualification.",
  contactTitle: "Need supplier-qualification documents?",
  contactDescription: "Tell us the product family, destination market and documentation required for your review.",
  contactAction: "Request documentation",
};

const copies: Partial<Record<Locale, AboutPageCopy>> = {
  "zh-cn": {
    location: "中国江苏无锡",
    capabilitiesTitle: "产品与工程支持",
    capabilitiesDescription: "公司提供工业部件，并结合实际工况开展应用复核和型号选择支持。",
    capabilities: [
      { title: "工业缓冲", description: "覆盖可调式、不可调式、重载与长寿命缓冲器，用于工业运动防护。" },
      { title: "振动隔离", description: "提供钢丝绳隔振器和特殊隔振器系列，服务设备防护与严苛环境需求。" },
      { title: "选型与资料", description: "提供应用复核、型号对比、选型指引和经审核技术图纸的受控下载。" },
    ],
    evidenceTitle: "合规与知识产权资料",
    evidenceDescription: "简要展示支撑 EKD 产品的质量、合规与知识产权资料。",
    evidence: [
      { title: "EKD 商标注册", scope: "第7类机械部件，注册文件有效期至 2030 年 5 月 27 日。", status: "current", statusText: "当前有效记录" },
      { title: "RoHS 2 检测资料", scope: "覆盖 EK、EN、ES、EI、ED 缓冲器系列，采用 IEC 62321 检测方法。", status: "documented", statusText: "资料存档" },
      { title: "外观设计专利资料", scope: "金属减振支座外观设计资料。", status: "documented", statusText: "资料存档" },
      { title: "CE 符合性资料", scope: "覆盖 EK、EN、ES、EI、ED 缓冲器系列的符合性资料。", status: "documented", statusText: "资料存档" },
      { title: "ISO 9001 质量管理资料", scope: "采用 ISO 9001:2015 标准的质量管理体系资料。", status: "documented", statusText: "资料存档" },
    ],
    disclosure: "最新适用证书及配套文件将在供应商准入阶段核验并提供。",
    contactTitle: "需要供应商准入资料？",
    contactDescription: "请告知产品系列、目标市场以及审核所需文件。",
    contactAction: "申请相关资料",
  },
  de: {
    ...english,
    location: "Wuxi, Jiangsu, China",
    capabilitiesTitle: "Produkte und technische Unterstützung",
    capabilitiesDescription: "Das Unternehmen verbindet industrielle Komponenten mit anwendungsbezogener Prüfung und Unterstützung bei der Modellauswahl.",
    capabilities: [
      { title: "Stoßdämpfung", description: "Einstellbare, nicht einstellbare, hochbelastbare und langlebige Industriestoßdämpfer zum Schutz von Bewegungsabläufen." },
      { title: "Schwingungsisolierung", description: "Drahtseil- und Spezialschwingungsisolatoren zum Schutz von Anlagen unter anspruchsvollen Umgebungsbedingungen." },
      { title: "Auslegung und Dokumentation", description: "Anwendungsprüfung, Modellvergleich, Dimensionierungshilfe und kontrollierter Zugriff auf freigegebene technische Zeichnungen." },
    ],
    evidenceTitle: "Nachweise zu Konformität und Schutzrechten",
    evidenceDescription: "Ein kompakter Überblick über Qualitäts-, Konformitäts- und Schutzrechtsunterlagen für EKD-Produkte.",
    evidence: [
      { title: "EKD-Markenregistrierung", scope: "Klasse 7 für Maschinenbauteile; die Registrierungsurkunde ist bis zum 27. Mai 2030 gültig.", status: "current", statusText: "Aktueller Nachweis" },
      { title: "RoHS-2-Prüfdokumentation", scope: "Prüfnachweise für die Baureihen EK, EN, ES, EI und ED nach IEC-62321-Verfahren.", status: "documented", statusText: "Archiviert" },
      { title: "Designpatent-Unterlagen", scope: "Designunterlagen für einen metallischen Schwingungsisolator.", status: "documented", statusText: "Archiviert" },
      { title: "CE-Konformitätsunterlagen", scope: "Konformitätsunterlagen für die Stoßdämpfer-Baureihen EK, EN, ES, EI und ED.", status: "documented", statusText: "Archiviert" },
      { title: "ISO-9001-Qualitätsmanagement", scope: "Unterlagen zum Qualitätsmanagementsystem nach ISO 9001:2015.", status: "documented", statusText: "Archiviert" },
    ],
    disclosure: "Die neuesten zutreffenden Zertifikate und Nachweise werden bei der Lieferantenqualifizierung bestätigt und bereitgestellt.",
    contactTitle: "Benötigen Sie Unterlagen zur Lieferantenqualifizierung?",
    contactDescription: "Nennen Sie Produktfamilie, Zielmarkt und die für Ihre Prüfung erforderlichen Dokumente.",
    contactAction: "Unterlagen anfordern",
  },
  fr: {
    ...english,
    location: "Wuxi, Jiangsu, Chine",
    capabilitiesTitle: "Produits et assistance technique",
    capabilitiesDescription: "L'entreprise associe la fourniture de composants industriels à l'étude des applications et à l'aide au choix des modèles.",
    capabilities: [
      { title: "Amortissement des chocs", description: "Gammes d'amortisseurs réglables, non réglables, renforcés et longue durée pour la protection des mouvements industriels." },
      { title: "Isolation vibratoire", description: "Isolateurs à câble métallique et spéciaux pour protéger les équipements dans des environnements exigeants." },
      { title: "Sélection et documentation", description: "Étude d'application, comparaison des modèles, aide au dimensionnement et accès contrôlé aux plans techniques approuvés." },
    ],
    evidenceTitle: "Éléments de conformité et de propriété intellectuelle",
    evidenceDescription: "Un aperçu concis des dossiers qualité, conformité et propriété intellectuelle liés aux produits EKD.",
    evidence: [
      { title: "Enregistrement de la marque EKD", scope: "Classe 7 pour composants mécaniques ; document d'enregistrement valable jusqu'au 27 mai 2030.", status: "current", statusText: "Dossier en vigueur" },
      { title: "Documentation d'essai RoHS 2", scope: "Dossiers d'essai des séries EK, EN, ES, EI et ED selon les méthodes IEC 62321.", status: "documented", statusText: "Archivé" },
      { title: "Documentation de brevet de dessin", scope: "Documentation de dessin pour un support métallique antivibratoire.", status: "documented", statusText: "Archivé" },
      { title: "Documentation de conformité CE", scope: "Documentation de conformité couvrant les séries d'amortisseurs EK, EN, ES, EI et ED.", status: "documented", statusText: "Archivé" },
      { title: "Système qualité ISO 9001", scope: "Documentation du système de management de la qualité selon ISO 9001:2015.", status: "documented", statusText: "Archivé" },
    ],
    disclosure: "Les certificats et justificatifs applicables les plus récents sont confirmés et fournis lors de la qualification fournisseur.",
    contactTitle: "Besoin de documents de qualification fournisseur ?",
    contactDescription: "Indiquez la famille de produits, le marché de destination et les documents nécessaires à votre examen.",
    contactAction: "Demander les documents",
  },
  it: {
    ...english,
    location: "Wuxi, Jiangsu, Cina",
    capabilitiesTitle: "Prodotti e supporto tecnico",
    capabilitiesDescription: "L'azienda abbina la fornitura di componenti industriali alla verifica applicativa e al supporto nella scelta del modello.",
    capabilities: [
      { title: "Assorbimento degli urti", description: "Gamme di ammortizzatori regolabili, non regolabili, per carichi elevati e a lunga durata per la protezione dei movimenti industriali." },
      { title: "Isolamento delle vibrazioni", description: "Isolatori a fune metallica e speciali per proteggere le apparecchiature in condizioni ambientali impegnative." },
      { title: "Selezione e documentazione", description: "Verifica dell'applicazione, confronto dei modelli, supporto al dimensionamento e accesso controllato ai disegni tecnici approvati." },
    ],
    evidenceTitle: "Evidenze di conformità e proprietà intellettuale",
    evidenceDescription: "Una sintesi della documentazione su qualità, conformità e proprietà intellettuale a supporto dei prodotti EKD.",
    evidence: [
      { title: "Registrazione del marchio EKD", scope: "Classe 7 per componenti meccanici; documento di registrazione valido fino al 27 maggio 2030.", status: "current", statusText: "Documento attuale" },
      { title: "Documentazione di prova RoHS 2", scope: "Registrazioni di prova per le serie EK, EN, ES, EI ed ED secondo i metodi IEC 62321.", status: "documented", statusText: "In archivio" },
      { title: "Documentazione del brevetto di design", scope: "Documentazione di design per un supporto antivibrante metallico.", status: "documented", statusText: "In archivio" },
      { title: "Documentazione di conformità CE", scope: "Documentazione di conformità per le serie di ammortizzatori EK, EN, ES, EI ed ED.", status: "documented", statusText: "In archivio" },
      { title: "Sistema qualità ISO 9001", scope: "Documentazione del sistema di gestione della qualità secondo ISO 9001:2015.", status: "documented", statusText: "In archivio" },
    ],
    disclosure: "I certificati e i documenti applicabili più recenti vengono confermati e forniti durante la qualifica del fornitore.",
    contactTitle: "Servono documenti per la qualifica del fornitore?",
    contactDescription: "Indicate la famiglia di prodotti, il mercato di destinazione e i documenti richiesti.",
    contactAction: "Richiedi i documenti",
  },
};

export function getAboutPageCopy(locale: Locale) {
  return copies[locale] ?? english;
}
