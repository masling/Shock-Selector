import type {
  ProductCenterLink,
  ProductFamily,
  ProductFamilyGroup,
  ProductModel,
} from "@/lib/content/site";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";
import type { Locale } from "@/lib/i18n/config";
import {
  getLocalizedCanonicalFamilySeedTranslation,
  getLocalizedTypeCodeLabel,
} from "@/lib/products/catalog-master-data";

const familyNameByLocale: Partial<Record<ProductFamilySlug, Record<Locale, string>>> = {
  "adjustable-shock-absorbers": {
    en: "Adjustable Shock Absorbers",
    "zh-cn": "可调式缓冲器",
    de: "Einstellbare Stoßdämpfer",
    fr: "Amortisseurs réglables",
    it: "Ammortizzatori regolabili",
  },
  "non-adjustable-shock-absorbers": {
    en: "Non-adjustable Shock Absorbers",
    "zh-cn": "自补偿 / 不可调缓冲器",
    de: "Selbstkompensierende Stoßdämpfer",
    fr: "Amortisseurs auto-compensés",
    it: "Ammortizzatori auto-compensanti",
  },
  "super-long-life-shock-absorbers": {
    en: "Super Long Life Shock Absorbers",
    "zh-cn": "超长寿命缓冲器",
    de: "Stoßdämpfer mit sehr langer Lebensdauer",
    fr: "Amortisseurs longue durée",
    it: "Ammortizzatori a lunghissima durata",
  },
  "heavy-duty-shock-absorbers": {
    en: "Heavy Duty Shock Absorbers",
    "zh-cn": "重载缓冲器",
    de: "Schwerlast-Stoßdämpfer",
    fr: "Amortisseurs heavy-duty",
    it: "Ammortizzatori heavy-duty",
  },
  "heavy-industry-buffers": {
    en: "Heavy Industry Buffers",
    "zh-cn": "重工业液压缓冲器",
    de: "Schwerindustrie-Puffer",
    fr: "Buffers pour industrie lourde",
    it: "Buffer per industria pesante",
  },
  "wire-rope-vibration-isolators": {
    en: "Wire Rope Vibration Isolators",
    "zh-cn": "钢丝绳隔振器",
    de: "Drahtseil-Schwingungsisolatoren",
    fr: "Isolateurs antivibratoires à câble",
    it: "Isolatori antivibranti a fune metallica",
  },
};

const featuredFamilyCopy: Partial<
  Record<
    ProductFamilySlug,
    {
      name: Record<Locale, string>;
      tag: Record<Locale, string>;
      summary: Record<Locale, string>;
      supportingLabel?: Partial<Record<Locale, string>>;
      fitFor?: Partial<Record<Locale, string[]>>;
      notFitFor?: Partial<Record<Locale, string[]>>;
      highlights?: Partial<Record<Locale, string[]>>;
      applications?: Partial<Record<Locale, string[]>>;
      specRange?: Partial<
        Record<
          Locale,
          {
            stroke: string;
            energy: string;
            force: string;
          }
        >
      >;
    }
  >
> = {
  "adjustable-shock-absorbers": {
    name: familyNameByLocale["adjustable-shock-absorbers"] as Record<Locale, string>,
    tag: {
      en: "Tunable deceleration",
      "zh-cn": "可调减速",
      de: "Einstellbare Verzögerung",
      fr: "Décélération réglable",
      it: "Decelerazione regolabile",
    },
    summary: {
      en: "Tunable hydraulic shock absorbers for lines where payload, speed or mounting conditions change from one machine setup to the next.",
      "zh-cn": "适用于负载、速度或安装条件会变化的设备工况，可通过调节阻尼来优化减速过程。",
      de: "Einstellbare hydraulische Stoßdämpfer für Anlagen, bei denen Last, Geschwindigkeit oder Einbaubedingungen zwischen Maschinenzuständen variieren.",
      fr: "Amortisseurs hydrauliques réglables pour installations où charge, vitesse ou conditions de montage varient d'un réglage machine à l'autre.",
      it: "Ammortizzatori idraulici regolabili per linee in cui carico, velocità o condizioni di montaggio cambiano da una configurazione macchina all'altra.",
    },
    supportingLabel: {
      de: "Für Maschinenstopps mit wechselnder Last",
      fr: "Pour arrêts machine à charge variable",
      it: "Per arresti macchina con carico variabile",
    },
    fitFor: {
      de: [
        "Automationsstopps mit wechselnden Lasten",
        "Motor- oder zylindergetriebene Achsen",
        "Maschinen mit Bedarf an Feinabstimmung vor Ort",
      ],
      fr: [
        "Arrêts d'automatisation avec charges variables",
        "Axes entraînés par moteur ou vérin",
        "Machines nécessitant un réglage sur site après installation",
      ],
      it: [
        "Arresti di automazione con carichi variabili",
        "Assi azionati da motore o cilindro",
        "Macchine che richiedono taratura in loco dopo l'installazione",
      ],
    },
    notFitFor: {
      de: [
        "Sehr hohe Stoßenergie in heavy-duty Einsätzen",
        "Anwendungen mit sicherheitskritischem Kran-Endanschlagschutz",
      ],
      fr: [
        "Impacts heavy-duty à très haute énergie",
        "Applications nécessitant une protection fail-safe type fin de course de grue",
      ],
      it: [
        "Impatti heavy-duty a energia molto elevata",
        "Applicazioni che richiedono protezione fail-safe tipo fine corsa gru",
      ],
    },
    highlights: {
      de: ["Einstellbare Dämpfung", "Stabile Verzögerung", "Geringere Endanschlagbelastung"],
      fr: ["Amortissement réglable", "Décélération stable", "Réduction du choc en butée"],
      it: ["Smorzamento regolabile", "Decelerazione stabile", "Riduzione dell'urto a fine corsa"],
    },
    applications: {
      de: ["Automationsanlagen", "Fördertechnik", "Montagemaschinen"],
      fr: ["Équipements d'automatisation", "Convoyeurs", "Machines d'assemblage"],
      it: ["Apparecchiature di automazione", "Convogliatori", "Macchine di assemblaggio"],
    },
    specRange: {
      de: {
        stroke: "12 bis 50 mm",
        energy: "leichte bis mittlere wiederholte Stöße",
        force: "für kontrollierte Maschinenbewegung",
      },
      fr: {
        stroke: "12 à 50 mm",
        energy: "impacts répétés légers à moyens",
        force: "pour mouvement machine contrôlé",
      },
      it: {
        stroke: "da 12 a 50 mm",
        energy: "impatti ripetuti da leggeri a medi",
        force: "per moto macchina controllato",
      },
    },
  },
  "non-adjustable-shock-absorbers": {
    name: familyNameByLocale["non-adjustable-shock-absorbers"] as Record<Locale, string>,
    tag: {
      en: "Fast deployment",
      "zh-cn": "快速选型",
      de: "Schneller Einsatz",
      fr: "Mise en service rapide",
      it: "Messa in servizio rapida",
    },
    summary: {
      en: "Self-compensating shock absorbers for repeatable machine motion where quick installation and dependable daily operation matter more than manual tuning.",
      "zh-cn": "适用于重复性高的设备运动场景，重点是安装简便、运行稳定，而不是现场手动调节。",
      de: "Selbstkompensierende Stoßdämpfer für wiederholbare Maschinenbewegungen, bei denen schnelle Installation und zuverlässiger Betrieb wichtiger sind als manuelle Einstellung.",
      fr: "Amortisseurs auto-compensés pour mouvements machine répétitifs où l'installation rapide et la fiabilité quotidienne priment sur le réglage manuel.",
      it: "Ammortizzatori auto-compensanti per movimenti macchina ripetitivi, dove installazione rapida e affidabilità quotidiana contano più della regolazione manuale.",
    },
    supportingLabel: {
      de: "Selbstkompensierende / nicht einstellbare Modelle",
      fr: "Modèles auto-compensés / non réglables",
      it: "Modelli auto-compensanti / non regolabili",
    },
    highlights: {
      de: ["Schnelle Auswahl", "Konstante Leistung", "Einfache Installation"],
      fr: ["Sélection rapide", "Performance constante", "Installation simple"],
      it: ["Selezione rapida", "Prestazioni costanti", "Installazione semplice"],
    },
    applications: {
      de: ["Verpackung", "Transfereinheiten", "Endanschläge an Führungsschienen"],
      fr: ["Emballage", "Unités de transfert", "Butées de rails de guidage"],
      it: ["Packaging", "Unità di trasferimento", "Fine corsa di guide lineari"],
    },
  },
  "super-long-life-shock-absorbers": {
    name: familyNameByLocale["super-long-life-shock-absorbers"] as Record<Locale, string>,
    tag: {
      en: "High cycle life",
      "zh-cn": "高循环寿命",
      de: "Hohe Lebensdauer",
      fr: "Longue durée de vie",
      it: "Lunga durata ciclica",
    },
    summary: {
      en: "Long-life hydraulic shock absorbers for high-frequency equipment where uptime, repeatability and service interval planning directly affect output.",
      "zh-cn": "面向高频运行设备，强调寿命、重复一致性和维护周期可控，适合持续产线工况。",
      de: "Hydraulische Stoßdämpfer mit langer Lebensdauer für Hochfrequenzanlagen, bei denen Verfügbarkeit, Wiederholgenauigkeit und Wartungsplanung direkt die Leistung beeinflussen.",
      fr: "Amortisseurs hydrauliques longue durée pour équipements à haute fréquence où disponibilité, répétabilité et planification de maintenance influencent directement la production.",
      it: "Ammortizzatori idraulici di lunga durata per apparecchiature ad alta frequenza, dove uptime, ripetibilità e pianificazione della manutenzione influenzano direttamente la produttività.",
    },
    supportingLabel: {
      de: "Für häufige Maschinenbewegungen ausgelegt",
      fr: "Conçus pour mouvements machine fréquents",
      it: "Progettati per movimenti macchina frequenti",
    },
    highlights: {
      de: ["Lange Lebensdauer", "Für hohe Frequenzen geeignet", "Stabile Wiederholbarkeit"],
      fr: ["Longue durée de vie", "Adapté aux hautes fréquences", "Répétabilité stable"],
      it: ["Lunga durata", "Adatto ad alta frequenza", "Ripetibilità stabile"],
    },
    applications: {
      de: ["PET-Blasmaschinen", "Hochgeschwindigkeitsautomation", "Verpackung"],
      fr: ["Machines de soufflage PET", "Automatisation haute vitesse", "Emballage"],
      it: ["Macchine di soffiaggio PET", "Automazione ad alta velocità", "Packaging"],
    },
  },
  "heavy-duty-shock-absorbers": {
    name: familyNameByLocale["heavy-duty-shock-absorbers"] as Record<Locale, string>,
    tag: {
      en: "Extreme-duty protection",
      "zh-cn": "重载防护",
      de: "Schutz für Extrembelastung",
      fr: "Protection heavy-duty",
      it: "Protezione per impieghi gravosi",
    },
    summary: {
      en: "Heavy-duty hydraulic shock absorbers for crane travel, rail systems, stacker cranes and other severe impact conditions where energy absorption is safety-critical.",
      "zh-cn": "面向起重、轨道、堆垛机等高冲击场景，强调大能量吸收和安全性优先的终端防护。",
      de: "Schwerlast-Hydraulikstoßdämpfer für Kranfahrt, Schienensysteme, Regalbediengeräte und andere harte Stoßfälle, bei denen Energieaufnahme sicherheitskritisch ist.",
      fr: "Amortisseurs hydrauliques heavy-duty pour translation de grues, systèmes ferroviaires, transstockeurs et autres chocs sévères où l'absorption d'énergie est critique pour la sécurité.",
      it: "Ammortizzatori idraulici heavy-duty per traslazione gru, sistemi su rotaia, trasloelevatori e altri impatti severi in cui l'assorbimento di energia è critico per la sicurezza.",
    },
    supportingLabel: {
      de: "Für Krane, Schienen und Lagertechnik",
      fr: "Pour grues, rails et systèmes d'entrepôt",
      it: "Per gru, rotaie e movimentazione magazzino",
    },
    highlights: {
      de: ["Hohe Energieaufnahme", "Heavy-duty Konstruktion", "Sicherheitsorientiertes Stoppen"],
      fr: ["Absorption d'impact élevée", "Construction heavy-duty", "Arrêt orienté sécurité"],
      it: ["Elevato assorbimento d'urto", "Costruzione heavy-duty", "Arresto orientato alla sicurezza"],
    },
    applications: {
      de: ["Hafentechnik", "Bahn", "Automatisierte Lager"],
      fr: ["Machines portuaires", "Rail", "Entrepôts automatisés"],
      it: ["Macchine portuali", "Ferrovia", "Magazzini automatizzati"],
    },
  },
  "heavy-industry-buffers": {
    name: familyNameByLocale["heavy-industry-buffers"] as Record<Locale, string>,
    tag: {
      en: "Large-scale impact control",
      "zh-cn": "大质量冲击控制",
      de: "Stoßkontrolle für große Massen",
      fr: "Contrôle d'impact grande échelle",
      it: "Controllo d'impatto su larga scala",
    },
    summary: {
      en: "Industrial hydraulic buffer lines for large machines and transported structures where stopping envelope, mass and ruggedness are the first design constraints.",
      "zh-cn": "适用于大型设备和重载移动结构，重点考虑停止包络、运动质量和整体耐用性。",
      de: "Industrielle Hydraulikpuffer für große Maschinen und bewegte Strukturen, bei denen Stoppräume, Masse und Robustheit die primären Auslegungskriterien sind.",
      fr: "Lignes de buffers hydrauliques industriels pour grandes machines et structures transportées où enveloppe d'arrêt, masse et robustesse sont les contraintes principales.",
      it: "Linee di buffer idraulici industriali per grandi macchine e strutture movimentate, in cui ingombro di arresto, massa e robustezza sono i primi vincoli di progetto.",
    },
    supportingLabel: {
      de: "Für Anlagen mit großer bewegter Masse",
      fr: "Pour équipements à masse mobile élevée",
      it: "Per apparecchiature con grande massa in movimento",
    },
    highlights: {
      de: ["Große Energieaufnahme", "Industrielle Robustheit", "Schutzorientiertes Design"],
      fr: ["Grande enveloppe d'énergie", "Robustesse industrielle", "Conception orientée protection"],
      it: ["Ampio inviluppo energetico", "Robustezza industriale", "Design orientato alla protezione"],
    },
    applications: {
      de: ["Papiermaschinen", "Stahlanlagen", "Materialtransport"],
      fr: ["Machines à papier", "Équipements sidérurgiques", "Manutention"],
      it: ["Macchine per carta", "Impianti siderurgici", "Movimentazione materiali"],
    },
  },
  "wire-rope-vibration-isolators": {
    name: familyNameByLocale["wire-rope-vibration-isolators"] as Record<Locale, string>,
    tag: {
      en: "Multi-axis isolation",
      "zh-cn": "多方向隔振",
      de: "Mehrachsen-Isolation",
      fr: "Isolation multi-axes",
      it: "Isolamento multiassiale",
    },
    summary: {
      en: "Wire rope isolators for equipment protection where shock resistance, vibration isolation and corrosion resistance need to work together.",
      "zh-cn": "适用于同时关注抗冲击、隔振和耐腐蚀的设备保护场景，尤其适合复杂环境。",
      de: "Drahtseil-Isolatoren für Geräteschutz, wenn Stoßfestigkeit, Schwingungsisolation und Korrosionsbeständigkeit zusammenwirken müssen.",
      fr: "Isolateurs à câble pour protection d'équipements quand résistance aux chocs, isolation vibratoire et tenue à la corrosion doivent fonctionner ensemble.",
      it: "Isolatori a fune metallica per protezione apparecchiature, quando resistenza agli urti, isolamento dalle vibrazioni e resistenza alla corrosione devono lavorare insieme.",
    },
    supportingLabel: {
      de: "Für Stoß, Vibration und raue Umgebungen",
      fr: "Pour choc, vibration et environnements sévères",
      it: "Per urti, vibrazioni e ambienti gravosi",
    },
    highlights: {
      de: ["Stoß- und Vibrationskontrolle", "Für raue Umgebungen", "Hohe Montageflexibilität"],
      fr: ["Choc + vibration", "Adapté aux environnements sévères", "Grande flexibilité de montage"],
      it: ["Controllo urti + vibrazioni", "Adatto ad ambienti gravosi", "Ampia flessibilità di montaggio"],
    },
    applications: {
      de: ["Marine", "Geräteschutz", "Transportsysteme"],
      fr: ["Marine", "Protection d'équipements", "Systèmes de transport"],
      it: ["Settore navale", "Protezione apparecchiature", "Sistemi di trasporto"],
    },
  },
};

export function getLocalizedProductFamilyName(
  locale: Locale,
  slug: ProductFamilySlug | null,
  fallback?: string,
) {
  if (!slug) {
    return fallback ?? "—";
  }

  return (
    familyNameByLocale[slug]?.[locale] ??
    getLocalizedCanonicalFamilySeedTranslation(locale, slug)?.name ??
    fallback ??
    slug
  );
}

export function formatProductTypeLabel(locale: Locale, type: string | null) {
  if (!type) {
    return locale === "zh-cn" ? "其他" : "Other";
  }

  const normalized = type.trim().toLowerCase();

  if (
    normalized.includes("可调") ||
    normalized.includes("adjustable")
  ) {
    return locale === "zh-cn" ? "可调型" : "Adjustable";
  }

  if (
    normalized.includes("固定") ||
    normalized.includes("non-adjustable") ||
    normalized.includes("non adjustable") ||
    normalized.includes("self-compensating")
  ) {
    return getLocalizedTypeCodeLabel(locale, "NON_ADJUSTABLE");
  }

  if (normalized.includes("heavy duty") || normalized.includes("heavy-duty")) {
    return getLocalizedTypeCodeLabel(locale, "HEAVY_DUTY");
  }

  if (normalized.includes("buffer")) {
    return getLocalizedTypeCodeLabel(locale, "BUFFER");
  }

  if (normalized.includes("isolator")) {
    return getLocalizedTypeCodeLabel(locale, "ISOLATOR");
  }

  return type;
}

export function localizeFeaturedProductFamily(locale: Locale, family: ProductFamily) {
  const localized = featuredFamilyCopy[family.slug];

  if (!localized) {
    return family;
  }

  return {
    ...family,
    name: localized.name[locale] ?? family.name,
    tag: localized.tag[locale] ?? family.tag,
    summary: localized.summary[locale] ?? family.summary,
    supportingLabel: localized.supportingLabel?.[locale] ?? family.supportingLabel,
    fitFor: localized.fitFor?.[locale] ?? family.fitFor,
    notFitFor: localized.notFitFor?.[locale] ?? family.notFitFor,
    highlights: localized.highlights?.[locale] ?? family.highlights,
    applications: localized.applications?.[locale] ?? family.applications,
    specRange: localized.specRange?.[locale] ?? family.specRange,
  };
}

const groupCopyByLocale: Record<
  ProductFamilyGroup["key"],
  Partial<
    Record<
      Locale,
      {
        name: string;
        summary: string;
        description: string;
      }
    >
  >
> = {
  "shock-absorbers": {
    "zh-cn": {
      name: "工业缓冲器",
      summary: "面向重复运动停止控制与设备保护的液压缓冲器产品系列。",
      description: "适用于自动化、包装、移载和高频机械防护等核心设备场景。",
    },
    de: {
      name: "Stoßdämpfer",
      summary: "Hydraulische Stoßdämpfer für wiederholte Stopps und Maschinenschutz.",
      description: "Geeignet für Automation, Verpackung, Transfer und hochfrequenten Maschinenschutz.",
    },
    fr: {
      name: "Amortisseurs",
      summary: "Amortisseurs hydrauliques pour arrêts répétitifs et protection machine.",
      description: "Adaptés à l'automatisation, l'emballage, le transfert et les machines à haute fréquence.",
    },
    it: {
      name: "Ammortizzatori",
      summary: "Ammortizzatori idraulici per arresti ripetitivi e protezione macchina.",
      description: "Adatti ad automazione, packaging, trasferimento e protezione di macchine ad alta frequenza.",
    },
  },
  buffers: {
    "zh-cn": {
      name: "液压缓冲器",
      summary: "偏重防护与重载停止的液压缓冲器产品线。",
      description: "适合大质量、高冲击和终端安全要求更高的设备停止工况。",
    },
    de: {
      name: "Hydraulikpuffer",
      summary: "Pufferlinien mit Fokus auf Schutz und Schwerlast-Stopp.",
      description: "Für große Massen, hohe Stoßlasten und hohe Sicherheitsanforderungen am Endanschlag.",
    },
    fr: {
      name: "Buffers hydrauliques",
      summary: "Lignes orientées protection et arrêts lourds.",
      description: "Pour grandes masses, impacts élevés et exigences renforcées en sécurité d'arrêt.",
    },
    it: {
      name: "Buffer idraulici",
      summary: "Linee orientate alla protezione e agli arresti gravosi.",
      description: "Per grandi masse, impatti elevati ed esigenze di sicurezza più severe al fine corsa.",
    },
  },
  "vibration-isolators": {
    "zh-cn": {
      name: "隔振产品",
      summary: "用于冲击隔离、振动控制和设备保护的隔振产品系列。",
      description: "覆盖运输、机械安装和复杂环境下的设备振动与冲击控制需求。",
    },
  },
  "advanced-damping-systems": {
    "zh-cn": {
      name: "高级阻尼系统",
      summary: "面向结构和专项工程的阻尼系统与能量管理产品。",
      description: "适用于土木、工业和重载能量管理类项目，购买路径不同于标准机械缓冲器。",
    },
  },
  "mechanical-components": {
    "zh-cn": {
      name: "机械零部件",
      summary: "与阻尼和隔振产品配套的辅助机械传动部件。",
      description: "适合更广义的机械成套采购，但与缓冲器的选型路径不同。",
    },
  },
};

const productCenterLinkCopyByLocale: Record<
  string,
  Partial<
    Record<
      Locale,
      {
        title: string;
        tag: string;
        description: string;
      }
    >
  >
> = {
  "Vibration Isolation Solutions": {
    "zh-cn": {
      title: "隔振解决方案",
      tag: "方案入口",
      description: "当需求更偏向设备布局、支撑条件和扰动形式时，可先从应用导向的隔振路线进入。",
    },
    de: {
      title: "Lösungen zur Schwingungsisolierung",
      tag: "Lösungsweg",
      description: "Starten Sie von Layout, Lagerung und Störform aus, wenn eine isolationsorientierte Empfehlung wichtiger ist.",
    },
    fr: {
      title: "Solutions d'isolation vibratoire",
      tag: "Parcours solution",
      description: "Commencez par l'implantation machine, les appuis et le type de perturbation pour une recommandation orientée isolation.",
    },
    it: {
      title: "Soluzioni di isolamento vibrazionale",
      tag: "Percorso soluzione",
      description: "Parti da layout macchina, condizioni di supporto e tipo di disturbo quando serve una raccomandazione orientata all'isolamento.",
    },
  },
  "Import Replacement Support": {
    "zh-cn": {
      title: "进口替代支持",
      tag: "工程支持",
      description: "当老的进口型号需要本地替代或重新评估时，可从这里进入应用支持路径。",
    },
    de: {
      title: "Unterstützung für Importersatz",
      tag: "Technische Unterstützung",
      description: "Nutzen Sie EKD als lokalen Ersatzpartner, wenn ein importiertes Altmodell ersetzt oder neu bewertet werden muss.",
    },
    fr: {
      title: "Support de remplacement import",
      tag: "Support technique",
      description: "Utilisez EKD comme alternative locale lorsqu'un modèle importé existant doit être remplacé ou réévalué.",
    },
    it: {
      title: "Supporto per sostituzione import",
      tag: "Supporto tecnico",
      description: "Usa EKD come partner locale quando un modello importato esistente deve essere sostituito o rivalutato.",
    },
  },
  "Metal Working & Manufacturing Services": {
    "zh-cn": {
      title: "金工与制造服务",
      tag: "生产能力",
      description: "查看可与产品供货一起协同的加工、制造和配套能力。",
    },
    de: {
      title: "Metallbearbeitung und Fertigungsservice",
      tag: "Fertigungskompetenz",
      description: "Prüfen Sie Bearbeitung, Fertigung und unterstützende Produktionskompetenz ergänzend zum Produktsortiment.",
    },
    fr: {
      title: "Services d'usinage et de fabrication",
      tag: "Capacité de production",
      description: "Consultez les capacités d'usinage, de fabrication et de support pouvant accompagner la fourniture produit.",
    },
    it: {
      title: "Servizi di lavorazione e produzione",
      tag: "Capacità produttiva",
      description: "Valuta lavorazioni, fabbricazione e capacità produttive di supporto che possono affiancare la fornitura del prodotto.",
    },
  },
};

const featuredModelCopyByLocale: Record<
  ProductModel["id"],
  Partial<Record<Locale, { summary: string }>>
> = {
  "ekm-2525": {
    "zh-cn": {
      summary: "适用于负载变化较大的自动化产线，可通过调节获得更稳定的停止特性。",
    },
    de: {
      summary: "Einstellbares Modell für Automationslinien mit stark variierender Last.",
    },
    fr: {
      summary: "Modèle réglable pour lignes d'automatisation à charge variable.",
    },
    it: {
      summary: "Modello regolabile per linee di automazione con carico variabile.",
    },
  },
  "enc-2012": {
    "zh-cn": {
      summary: "适合标准化终端停止场景的紧凑型自补偿型号。",
    },
    de: {
      summary: "Kompaktes selbstkompensierendes Modell für standardisierte Endanschläge.",
    },
    fr: {
      summary: "Unité auto-compensée compacte pour butées standardisées.",
    },
    it: {
      summary: "Unità auto-compensante compatta per arresti terminali standardizzati.",
    },
  },
  "ed-4250": {
    "zh-cn": {
      summary: "适用于高冲击环境的重载液压缓冲型号。",
    },
    de: {
      summary: "Schwerlast-Hydraulikmodell für Umgebungen mit hohen Stoßbelastungen.",
    },
    fr: {
      summary: "Modèle hydraulique heavy-duty pour environnements à impact sévère.",
    },
    it: {
      summary: "Modello idraulico heavy-duty per ambienti con impatti severi.",
    },
  },
};

export function localizeProductFamilyGroup(locale: Locale, group: ProductFamilyGroup) {
  const localized = groupCopyByLocale[group.key]?.[locale];

  if (!localized) {
    return group;
  }

  return {
    ...group,
    name: localized.name,
    summary: localized.summary,
    description: localized.description,
  };
}

export function localizeProductCenterLink(locale: Locale, link: ProductCenterLink) {
  const localized = productCenterLinkCopyByLocale[link.title]?.[locale];

  if (!localized) {
    return link;
  }

  return {
    ...link,
    title: localized.title,
    tag: localized.tag,
    description: localized.description,
  };
}

export function localizeFeaturedModel(locale: Locale, model: ProductModel) {
  const localized = featuredModelCopyByLocale[model.id]?.[locale];

  if (!localized) {
    return model;
  }

  return {
    ...model,
    summary: localized.summary,
  };
}
