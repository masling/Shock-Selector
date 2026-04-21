import type { Locale } from "@/lib/i18n/config";

type FooterGroup = {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

type DownloadItem = {
  title: string;
  description: string;
  path: string;
};

type SolutionItem = {
  title: string;
  description: string;
  items: string[];
};

type ApplicationSector = {
  title: string;
  description: string;
  href: string;
};

export type SiteCopy = {
  localeNames: Record<Locale, string>;
  metadata: {
    defaultTitle: string;
    defaultDescription: string;
    homeTitle: string;
    buyerTitle: string;
    engineerTitle: string;
    aboutTitle: string;
    contactTitle: string;
    downloadsTitle: string;
    solutionsTitle: string;
    applicationsTitle: string;
  };
  navigation: {
    brandEyebrow: string;
    brandDescription: string;
    localeSwitcherLabel: string;
    mobileMenuOpen: string;
    mobileMenuClose: string;
    items: Array<{
      label: string;
      href: string;
      highlight?: boolean;
    }>;
  };
  breadcrumb: {
    home: string;
  };
  footer: {
    summary: string;
    groups: FooterGroup[];
  };
  home: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    audienceCards: Array<{
      label: string;
      title: string;
      description: string;
    }>;
    routePanel: {
      eyebrow: string;
      title: string;
      caption: string;
      items: Array<{
        title: string;
        description: string;
        href: string;
      }>;
    };
    motionSection: {
      eyebrow: string;
      title: string;
      cta: string;
      availableSuffixSingle: string;
      availableSuffixPlural: string;
    };
    productSection: {
      eyebrow: string;
      title: string;
      liveDescription: string;
      fallbackDescription: string;
      modelsAvailable: string;
      catalogUnavailable: string;
    };
    applicationSection: {
      eyebrow: string;
      title: string;
      description: string;
      cta: string;
      explore: string;
      sectors: ApplicationSector[];
    };
    trustSection: {
      eyebrow: string;
      title: string;
      description: string;
      items: string[];
    };
  };
  buyer: {
    eyebrow: string;
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    fields: Record<string, string>;
    buttons: {
      search: string;
      searching: string;
      clear: string;
    };
    errors: {
      searchFailed: string;
    };
    emptyState: string;
    resultsTitle: string;
    resultsSummary: string;
    noResults: string;
    table: {
      model: string;
      type: string;
      stroke: string;
      energyPerCycle: string;
      energyPerHour: string;
      impactForce: string;
      thrustForce: string;
      length: string;
      thread: string;
    };
  };
  engineer: {
    eyebrow: string;
    title: string;
    description: string;
    motionGroupsTitle: string;
    howItWorksTitle: string;
    howItWorksDescription: string;
    whatYouGetTitle: string;
    whatYouGetDescription: string;
    selectMotionCaseTitle: string;
    selectMotionCaseDescription: string;
    availableRoutesTitle: string;
    inputTitle: string;
    inputDescription: string;
    chooseRoute: string;
    beginPrompt: string;
    loadingCatalog: string;
    routeAvailableSingle: string;
    routeAvailablePlural: string;
    routePending: string;
    comingSoon: string;
    buttons: {
      calculate: string;
      calculating: string;
      reset: string;
    };
    errors: {
      chooseRoute: string;
      loadFailed: string;
      calculateFailed: string;
    };
    tip: string;
    result: {
      title: string;
      labels: {
        requiredStroke: string;
        energyPerCycle: string;
        energyPerHour: string;
        averageImpactForce: string;
        suggestedFamily: string;
      };
      whyFitsTitle: string;
      criteriaTitle: string;
      matchesTitle: string;
      matchesSummary: string;
      noMatches: string;
      table: {
        model: string;
        type: string;
        stroke: string;
        energyPerCycle: string;
        energyPerHour: string;
        impactForce: string;
        thread: string;
      };
    };
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    profileTitle: string;
    paragraphs: string[];
    highlights: string[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    contactLabels: string[];
    form: {
      name: string;
      namePlaceholder: string;
      company: string;
      companyPlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      brief: string;
      placeholder: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successMessage: string;
      errorTitle: string;
      errorMessage: string;
      rateLimitMessage: string;
    };
  };
  downloads: {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    items: DownloadItem[];
  };
  solutions: {
    eyebrow: string;
    title: string;
    description: string;
    items: SolutionItem[];
    primaryCta: string;
    secondaryCta: string;
  };
  applications: {
    eyebrow: string;
    title: string;
    description: string;
    explore: string;
    sectors: ApplicationSector[];
  };
};

const englishCopy: SiteCopy = {
  localeNames: {
    en: "English",
    "zh-cn": "简体中文",
    de: "Deutsch",
    fr: "Français",
    it: "Italiano",
  },
  metadata: {
    defaultTitle: "EKD | Industrial Shock Absorber Selection Platform",
    defaultDescription:
      "Find suitable industrial shock absorbers, heavy duty buffers and vibration isolation products with product discovery and sizing-first navigation.",
    homeTitle: "Home",
    buyerTitle: "Buyer Quick Filter",
    engineerTitle: "Engineer Sizing",
    aboutTitle: "About",
    contactTitle: "Contact",
    downloadsTitle: "Downloads",
    solutionsTitle: "Solutions",
    applicationsTitle: "Applications",
  },
  navigation: {
    brandEyebrow: "Motion Control",
    brandDescription: "Industrial shock absorbers and motion protection",
    localeSwitcherLabel: "Language",
    mobileMenuOpen: "Open menu",
    mobileMenuClose: "Close menu",
    items: [
      { label: "Products", href: "/products" },
      { label: "Sizing", href: "/selector/engineer", highlight: true },
      { label: "Applications", href: "/applications" },
      { label: "Downloads", href: "/downloads" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  breadcrumb: {
    home: "Home",
  },
  footer: {
    summary:
      "Find product families, compare models and start sizing from real application conditions. EKD supports both quick shortlisting and deeper engineering review.",
    groups: [
      {
        title: "Find Products",
        links: [
          { label: "All product families", href: "/products" },
          { label: "Find by application", href: "/applications" },
          { label: "Engineer sizing", href: "/selector/engineer" },
          { label: "Buyer quick filter", href: "/selector/buyer" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Applications", href: "/applications" },
          { label: "Downloads", href: "/downloads" },
          { label: "About EKD", href: "/about" },
        ],
      },
      {
        title: "Connect",
        links: [
          { label: "Contact us", href: "/contact" },
          { label: "Sales support", href: "/contact" },
          { label: "Technical support", href: "/contact" },
        ],
      },
    ],
  },
  home: {
    badge: "Find the right starting point",
    title: "Find the right industrial shock absorber before you read the brochure.",
    description:
      "EKD combines product families, application guidance and motion sizing so engineers and buyers can reach a suitable shortlist faster.",
    primaryCta: "Browse Product Families",
    secondaryCta: "Open Sizing Tool",
    audienceCards: [
      {
        label: "Best for",
        title: "Engineers",
        description: "Sizing logic, motion context, filter rationale.",
      },
      {
        label: "Best for",
        title: "Buyers",
        description: "Fast shortlist by stroke, energy, force and thread.",
      },
      {
        label: "Coverage",
        title: "Linear + Rotary",
        description: "Five guided motion categories for faster selection.",
      },
    ],
    routePanel: {
      eyebrow: "Selection guide",
      title: "Choose Your Route",
      caption: "For engineers and sourcing teams",
      items: [
        {
          title: "I know the product type",
          description: "Go straight to product families and narrow the right envelope fast.",
          href: "/products",
        },
        {
          title: "I know the application",
          description: "Start from machine type, line context and impact scenario.",
          href: "/applications",
        },
        {
          title: "I know the motion scenario",
          description: "Start from motion, mounting direction and drive conditions.",
          href: "/selector/engineer",
        },
        {
          title: "I need a quick shortlist",
          description: "Filter products by stroke, energy, force and thread size.",
          href: "/selector/buyer",
        },
      ],
    },
    motionSection: {
      eyebrow: "Sizing by motion",
      title: "Start with the motion pattern and narrow the right sizing path.",
      cta: "Guided sizing",
      availableSuffixSingle: "sizing option available",
      availableSuffixPlural: "sizing options available",
    },
    productSection: {
      eyebrow: "Product families",
      title: "Start broad, then move closer to the right energy envelope.",
      liveDescription:
        "catalog models are grouped into product families so you can narrow the suitable range faster.",
      fallbackDescription:
        "Browse the main product families first, then move into detailed model comparison when you are ready.",
      modelsAvailable: "models in catalog",
      catalogUnavailable: "Catalog count unavailable",
    },
    applicationSection: {
      eyebrow: "Applications",
      title: "Find products by machine environment and use case.",
      description:
        "Many users know the machine context before they know the exact product family. Start from common sectors to narrow the right route.",
      cta: "View all applications",
      explore: "Explore options",
      sectors: [
        {
          title: "PET Blowing Machinery",
          description:
            "High-frequency machine motion where cycle life and consistent deceleration are critical.",
          href: "/products/super-long-life-shock-absorbers",
        },
        {
          title: "Automotive Manufacturing",
          description:
            "Assembly, welding and stamping systems that need machine protection without slowing throughput.",
          href: "/products/adjustable-shock-absorbers",
        },
        {
          title: "Automated Warehouses",
          description:
            "Track-end and emergency impact protection for stacker cranes and transfer systems.",
          href: "/products/heavy-duty-shock-absorbers",
        },
        {
          title: "Port and Lifting Equipment",
          description:
            "Extreme-duty energy absorption for cranes, rail systems and heavy moving structures.",
          href: "/products/heavy-industry-buffers",
        },
      ],
    },
    trustSection: {
      eyebrow: "Engineering support",
      title: "Industrial experience behind the selection path.",
      description:
        "EKD combines product coverage, application support and selection guidance for standard automation and severe-duty impact control.",
      items: [
        "30+ employees with a core team carrying 15+ years of industry experience",
        "Application experience across standard industrial and demanding heavy-duty environments",
        "Quality and compliance references include ISO9001, ROHS and CE",
        "Engineering support for sizing review and application recommendations",
      ],
    },
  },
  buyer: {
    eyebrow: "Buyer quick filter",
    title: "Filter suitable models quickly by the limits you already know.",
    description:
      "Use this page to narrow the range by stroke, energy, force, length and thread constraints.",
    panelTitle: "Filter products",
    panelDescription: "Narrow the range by the key limits you already know.",
    fields: {
      type: "Product type",
      minStrokeMm: "Minimum stroke (mm)",
      minEnergyPerCycleNm: "Minimum energy / cycle (Nm/c)",
      minEnergyPerHourNm: "Minimum energy / hour (Nm/h)",
      minImpactForceN: "Minimum impact force (N)",
      minThrustForceN: "Minimum thrust force (N)",
      maxTotalLengthMm: "Maximum total length (mm)",
      threadSize: "Thread size",
    },
    buttons: {
      search: "Search products",
      searching: "Searching...",
      clear: "Clear filters",
    },
    errors: {
      searchFailed: "We could not complete the search. Please try again.",
    },
    emptyState:
      "No search has been run yet. Start with the filters above to generate a shortlist of matching models.",
    resultsTitle: "Matching models",
    resultsSummary: "models match your filters.",
    noResults: "No models currently match this filter set.",
    table: {
      model: "Model",
      type: "Type",
      stroke: "Stroke",
      energyPerCycle: "Energy / cycle",
      energyPerHour: "Energy / hour",
      impactForce: "Impact force",
      thrustForce: "Thrust force",
      length: "Length",
      thread: "Thread",
    },
  },
  engineer: {
    eyebrow: "Engineer sizing",
    title: "Guided sizing for applications with defined motion conditions.",
    description:
      "Choose the motion pattern, enter the main operating values and review models that match the stopping requirements.",
    motionGroupsTitle: "Motion groups",
    howItWorksTitle: "How it works",
    howItWorksDescription:
      "Start from the motion type, then narrow by orientation, drive source and stopping conditions to reach the most relevant sizing path.",
    whatYouGetTitle: "What you will get",
    whatYouGetDescription:
      "The result view shows the required stopping energy, key assumptions and matching product options.",
    selectMotionCaseTitle: "Select your motion case",
    selectMotionCaseDescription:
      "Pick the motion group that best matches your equipment, then continue with the closest sizing route.",
    availableRoutesTitle: "Available sizing routes",
    inputTitle: "Input values",
    inputDescription: "Enter the operating values for the selected motion case.",
    chooseRoute: "Select one of the available routes to enter your operating values.",
    beginPrompt: "Choose one of the motion groups above to begin.",
    loadingCatalog: "Loading sizing paths...",
    routeAvailableSingle: "sizing option available",
    routeAvailablePlural: "sizing options available",
    routePending: "Additional cases will be added",
    comingSoon: "Coming soon",
    buttons: {
      calculate: "See recommendations",
      calculating: "Calculating...",
      reset: "Reset inputs",
    },
    errors: {
      chooseRoute: "Choose a sizing path first.",
      loadFailed: "We could not load the sizing paths. Please refresh and try again.",
      calculateFailed:
        "We could not complete the calculation. Please try again.",
    },
    tip:
      "If your application differs from the listed routes, start with the closest case and use the result as a first sizing reference.",
    result: {
      title: "Sizing result",
      labels: {
        requiredStroke: "Required stroke (mm)",
        energyPerCycle: "Energy / cycle (Nm)",
        energyPerHour: "Energy / hour (Nm)",
        averageImpactForce: "Thrust force (N)",
        suggestedFamily: "Suggested family",
      },
      whyFitsTitle: "Why these models fit",
      criteriaTitle: "Selection criteria",
      matchesTitle: "Matching models",
      matchesSummary: "models match the calculated requirements.",
      noMatches:
        "No models currently match the calculated requirements. Try increasing stroke, lowering the energy requirement or reviewing a heavier-duty family.",
      table: {
        model: "Model",
        type: "Type",
        stroke: "Stroke",
        energyPerCycle: "Energy / cycle",
        energyPerHour: "Energy / hour",
        impactForce: "Impact force",
        thread: "Thread",
      },
    },
  },
  about: {
    eyebrow: "About EKD",
    title: "Industrial motion protection backed by engineering support.",
    description:
      "EKD focuses on industrial shock absorption, vibration control and application guidance for machine builders and industrial operators.",
    profileTitle: "Company profile",
    paragraphs: [
      "Jiangsu EKD Machinery Technical Co., Ltd. focuses on vibration control, noise reduction and industrial shock absorption products. The current EKD material set emphasizes both civil-industrial applications and demanding environments, backed by a team with long industry experience and a practical engineering support mindset.",
      "The team supports model selection, application review and product recommendations for both automation equipment and heavy-duty impact-control applications.",
    ],
    highlights: [
      "30+ employees with a core team carrying 15+ years of industry experience",
      "Application experience across standard industrial and demanding heavy-duty environments",
      "Quality and compliance references include ISO9001, ROHS and CE",
      "Engineering support for sizing review and application recommendations",
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Talk with EKD about your machine, motion case or shortlist.",
    description:
      "Share the application and required performance range, and we will help confirm the suitable family or model range.",
    contactLabels: ["General email", "Technical support", "Sales", "Service"],
    form: {
      name: "Name",
      namePlaceholder: "Your name",
      company: "Company",
      companyPlaceholder: "Company name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      phone: "Phone",
      phonePlaceholder: "+1 234 567 890",
      brief: "Project brief",
      placeholder:
        "Tell us the motion scenario, expected energy, force range or model family you are evaluating.",
      submit: "Send inquiry",
      submitting: "Sending...",
      successTitle: "Message sent",
      successMessage: "Thank you for your inquiry. We will get back to you soon.",
      errorTitle: "Send failed",
      errorMessage: "We could not send your message. Please try again later or email us directly.",
      rateLimitMessage: "Too many requests. Please wait a moment before trying again.",
    },
  },
  downloads: {
    eyebrow: "Downloads",
    title: "Catalogs and technical references.",
    description: "Download the main product literature for faster review with your team.",
    action: "Download",
    items: [
      {
        title: "EKD Full Product Catalog",
        description:
          "Broad product overview for hydraulic shock absorbers and related motion control lines.",
        path: "/catalogs/ekd-full-catalog.pdf",
      },
      {
        title: "Vibration Isolator Catalog 2024",
        description:
          "Focused resource for vibration isolation product families and related applications.",
        path: "/catalogs/vibration-isolator-catalog-2024.pdf",
      },
    ],
  },
  solutions: {
    eyebrow: "Solutions",
    title: "Start from your application and narrow the right product direction.",
    description:
      "Choose the route that best matches what you already know: motion type or drive method.",
    items: [
      {
        title: "Find by motion",
        description:
          "Choose the motion behavior first, then narrow the suitable absorber family.",
        items: [
          "Linear free motion",
          "Motor-driven linear motion",
          "Cylinder-driven motion",
          "Rotary motion",
        ],
      },
      {
        title: "Find by drive",
        description:
          "Good for engineers who know the actuator but still need family guidance.",
        items: ["Free motion", "External force", "Motor", "Cylinder"],
      },
    ],
    primaryCta: "Browse product families",
    secondaryCta: "Start guided sizing",
  },
  applications: {
    eyebrow: "Applications",
    title: "Common applications for EKD shock absorbers and buffers.",
    description:
      "Browse typical machine environments to see where different product families are commonly used.",
    explore: "Explore options",
    sectors: [
      {
        title: "PET Blowing Machinery",
        description:
          "High-frequency machine motion where cycle life and consistent deceleration are critical.",
        href: "/solutions",
      },
      {
        title: "Automotive Manufacturing",
        description:
          "Assembly, welding and stamping systems that need machine protection without slowing throughput.",
        href: "/solutions",
      },
      {
        title: "Automated Warehouses",
        description:
          "Track-end and emergency impact protection for stacker cranes and transfer systems.",
        href: "/solutions",
      },
      {
        title: "Port and Lifting Equipment",
        description:
          "Extreme-duty energy absorption for cranes, rail systems and heavy moving structures.",
        href: "/solutions",
      },
    ],
  },
};

const chineseCopy: SiteCopy = {
  ...englishCopy,
  metadata: {
    ...englishCopy.metadata,
    defaultTitle: "EKD | 工业缓冲器在线选型平台",
    defaultDescription:
      "面向工业设备应用的缓冲器、重载液压缓冲器与隔振产品选型平台，支持产品检索与工况选型。",
    homeTitle: "首页",
    buyerTitle: "采购快速筛选",
    engineerTitle: "工程师选型",
    aboutTitle: "关于 EKD",
    contactTitle: "联系我们",
    downloadsTitle: "资料下载",
    solutionsTitle: "解决方案",
    applicationsTitle: "应用场景",
  },
  navigation: {
    brandEyebrow: "运动控制",
    brandDescription: "工业缓冲器与运动防护产品",
    localeSwitcherLabel: "语言",
    mobileMenuOpen: "打开菜单",
    mobileMenuClose: "关闭菜单",
    items: [
      { label: "产品中心", href: "/products" },
      { label: "在线选型", href: "/selector/engineer", highlight: true },
      { label: "应用场景", href: "/applications" },
      { label: "资料下载", href: "/downloads" },
      { label: "关于我们", href: "/about" },
      { label: "联系我们", href: "/contact" },
    ],
  },
  breadcrumb: {
    home: "首页",
  },
  footer: {
    summary:
      "从产品系列浏览、型号对比到工况选型，EKD 站点既支持采购快速筛选，也支持工程师做更深入的应用判断。",
    groups: [
      {
        title: "查找产品",
        links: [
          { label: "全部产品系列", href: "/products" },
          { label: "按应用查找", href: "/applications" },
          { label: "工程师选型", href: "/selector/engineer" },
          { label: "采购快速筛选", href: "/selector/buyer" },
        ],
      },
      {
        title: "资料与信息",
        links: [
          { label: "应用场景", href: "/applications" },
          { label: "资料下载", href: "/downloads" },
          { label: "关于 EKD", href: "/about" },
        ],
      },
      {
        title: "联系 EKD",
        links: [
          { label: "联系我们", href: "/contact" },
          { label: "销售支持", href: "/contact" },
          { label: "技术支持", href: "/contact" },
        ],
      },
    ],
  },
  home: {
    badge: "先找到正确入口",
    title: "先找到合适的工业缓冲器，再去翻整本样册。",
    description:
      "EKD 把产品系列、应用引导和工况选型组合在一起，让工程师和采购能更快收敛到合适型号范围。",
    primaryCta: "浏览产品系列",
    secondaryCta: "打开选型工具",
    audienceCards: [
      {
        label: "更适合",
        title: "工程师",
        description: "关注工况逻辑、参数依据和筛选原因。",
      },
      {
        label: "更适合",
        title: "采购人员",
        description: "按行程、能量、力值和螺纹快速出 shortlist。",
      },
      {
        label: "覆盖范围",
        title: "直线 + 旋转",
        description: "5 类前台工况入口，便于快速进入正确路径。",
      },
    ],
    routePanel: {
      eyebrow: "选择路径",
      title: "从哪个入口开始",
      caption: "适用于工程师与采购团队",
      items: [
        {
          title: "我知道产品类型",
          description: "直接进入产品系列，先缩小产品范围。",
          href: "/products",
        },
        {
          title: "我知道应用场景",
          description: "从设备类型、产线背景和冲击环境开始。",
          href: "/applications",
        },
        {
          title: "我知道运动工况",
          description: "从运动形式、安装方向和驱动方式开始选型。",
          href: "/selector/engineer",
        },
        {
          title: "我只需要快速 shortlist",
          description: "直接按行程、能量、力值和螺纹筛型号。",
          href: "/selector/buyer",
        },
      ],
    },
    motionSection: {
      eyebrow: "按运动方式选型",
      title: "先确定运动模式，再进入更合适的选型路径。",
      cta: "进入引导选型",
      availableSuffixSingle: "个可用选型路径",
      availableSuffixPlural: "个可用选型路径",
    },
    productSection: {
      eyebrow: "产品系列",
      title: "先看大类，再逐步收敛到合适的能量范围。",
      liveDescription: "个在线目录型号已按产品系列整理，便于更快收敛范围。",
      fallbackDescription: "可以先浏览核心产品系列，再进入具体型号比较。",
      modelsAvailable: "个在线型号",
      catalogUnavailable: "目录统计暂不可用",
    },
    applicationSection: {
      eyebrow: "应用行业",
      title: "从设备环境和应用背景反推产品方向。",
      description:
        "很多用户先知道设备或行业背景，再确定具体产品系列。可以先从典型行业切入。",
      cta: "查看全部应用场景",
      explore: "查看建议",
      sectors: [
        {
          title: "PET 吹瓶机械",
          description: "高频运动设备，重点关注循环寿命和减速一致性。",
          href: "/products/super-long-life-shock-absorbers",
        },
        {
          title: "汽车制造",
          description: "装配、焊装、冲压等设备保护，要求兼顾节拍和可靠性。",
          href: "/products/adjustable-shock-absorbers",
        },
        {
          title: "自动化立体仓库",
          description: "适用于堆垛机、轨道终端和移载系统的冲击防护。",
          href: "/products/heavy-duty-shock-absorbers",
        },
        {
          title: "港机与起重设备",
          description: "适用于起重机、轨道系统和重载移动结构的大能量吸收场景。",
          href: "/products/heavy-industry-buffers",
        },
      ],
    },
    trustSection: {
      eyebrow: "工程支持",
      title: "选型路径背后的工业经验与应用支持。",
      description:
        "EKD 面向标准自动化设备和高冲击重载场景，提供产品覆盖、应用判断与选型支持。",
      items: [
        "30+ 团队成员，核心团队具备 15+ 年行业经验",
        "覆盖常规工业环境与高负载严苛工况的应用经验",
        "质量与合规参考包括 ISO9001、ROHS、CE",
        "支持选型复核与应用方案建议",
      ],
    },
  },
  buyer: {
    eyebrow: "采购快速筛选",
    title: "按已知约束快速筛出合适型号。",
    description:
      "适合已知行程、能量、力值、长度或螺纹等条件时，快速缩小产品范围。",
    panelTitle: "筛选产品",
    panelDescription: "按你已经明确的关键约束缩小范围。",
    fields: {
      type: "产品类型",
      minStrokeMm: "最小行程 (mm)",
      minEnergyPerCycleNm: "最小单次吸收能量 (Nm/c)",
      minEnergyPerHourNm: "最大小时吸收能量 (Nm/h)",
      minImpactForceN: "最小冲击力 (N)",
      minThrustForceN: "最小推进力 (N)",
      maxTotalLengthMm: "最大总长度 (mm)",
      threadSize: "螺纹尺寸",
    },
    buttons: {
      search: "搜索产品",
      searching: "搜索中...",
      clear: "清空筛选",
    },
    errors: {
      searchFailed: "当前无法完成筛选，请稍后再试。",
    },
    emptyState: "尚未执行筛选。先填写上方条件，再生成匹配型号列表。",
    resultsTitle: "匹配型号",
    resultsSummary: "个型号符合当前筛选条件。",
    noResults: "当前没有型号满足这组筛选条件。",
    table: {
      model: "型号",
      type: "类型",
      stroke: "行程",
      energyPerCycle: "单次能量",
      energyPerHour: "小时能量",
      impactForce: "冲击力",
      thrustForce: "推进力",
      length: "长度",
      thread: "螺纹",
    },
  },
  engineer: {
    eyebrow: "工程师选型",
    title: "面向明确运动工况的引导式选型。",
    description:
      "先确定运动形式，再输入关键工况参数，查看计算结果与匹配型号范围。",
    motionGroupsTitle: "工况分组",
    howItWorksTitle: "使用方式",
    howItWorksDescription:
      "先从运动类型开始，再结合方向、驱动方式和停止条件，逐步进入最相关的选型路径。",
    whatYouGetTitle: "输出内容",
    whatYouGetDescription:
      "结果页会显示所需停止能量、关键假设条件以及匹配的产品型号。",
    selectMotionCaseTitle: "选择运动工况",
    selectMotionCaseDescription:
      "先选择最接近设备工况的运动类别，再继续进入合适的选型路径。",
    availableRoutesTitle: "可用选型路径",
    inputTitle: "输入参数",
    inputDescription: "输入当前工况的主要运行参数。",
    chooseRoute: "先选择一个可用路径，再填写参数。",
    beginPrompt: "请先从上方选择一个运动分组。",
    loadingCatalog: "正在加载选型路径...",
    routeAvailableSingle: "个可用选型路径",
    routeAvailablePlural: "个可用选型路径",
    routePending: "更多工况路径将后续补充",
    comingSoon: "即将推出",
    buttons: {
      calculate: "查看推荐结果",
      calculating: "计算中...",
      reset: "重置输入",
    },
    errors: {
      chooseRoute: "请先选择一个选型路径。",
      loadFailed: "当前无法加载选型路径，请刷新后重试。",
      calculateFailed: "当前无法完成计算，请稍后再试。",
    },
    tip:
      "如果你的工况与当前路径不完全一致，可以先从最接近的工况开始，把结果作为首轮参考。",
    result: {
      title: "选型结果",
      labels: {
        requiredStroke: "所需行程 (mm)",
        energyPerCycle: "单次能量 (Nm)",
        energyPerHour: "小时能量 (Nm)",
        averageImpactForce: "推进力 (N)",
        suggestedFamily: "推荐产品系列",
      },
      whyFitsTitle: "推荐依据",
      criteriaTitle: "筛选条件",
      matchesTitle: "匹配型号",
      matchesSummary: "个型号满足计算后的条件。",
      noMatches:
        "当前没有型号满足计算条件。可尝试增加行程、降低能量要求，或改看更重载的产品系列。",
      table: {
        model: "型号",
        type: "类型",
        stroke: "行程",
        energyPerCycle: "单次能量",
        energyPerHour: "小时能量",
        impactForce: "冲击力",
        thread: "螺纹",
      },
    },
  },
  about: {
    eyebrow: "关于 EKD",
    title: "以工程支持为基础的工业运动防护能力。",
    description:
      "EKD 聚焦工业缓冲、隔振与应用支持，面向设备制造商与工业用户提供产品与选型服务。",
    profileTitle: "公司简介",
    paragraphs: [
      "江苏亿凯达机械技术有限公司专注于振动控制、降噪和工业缓冲类产品。现有资料体现出其同时覆盖常规工业应用与严苛工况环境，并具备较强的工程支持导向。",
      "团队可为自动化设备和高冲击重载场景提供型号推荐、应用判断与选型支持。",
    ],
    highlights: [
      "30+ 团队成员，核心团队具备 15+ 年行业经验",
      "覆盖常规工业与严苛重载环境的应用经验",
      "质量与合规参考包括 ISO9001、ROHS、CE",
      "支持选型复核与应用建议",
    ],
  },
  contact: {
    eyebrow: "联系我们",
    title: "欢迎与 EKD 沟通你的设备、工况或候选型号。",
    description:
      "告诉我们应用背景和大致性能要求，我们会协助确认合适的产品系列或型号范围。",
    contactLabels: ["总邮箱", "技术支持", "销售", "服务"],
    form: {
      name: "姓名",
      namePlaceholder: "请输入姓名",
      company: "公司",
      companyPlaceholder: "请输入公司名称",
      email: "邮箱",
      emailPlaceholder: "you@company.com",
      phone: "电话",
      phonePlaceholder: "+86 123 4567 8901",
      brief: "项目简述",
      placeholder: "可描述运动工况、能量范围、力值范围或正在评估的产品系列。",
      submit: "发送询盘",
      submitting: "发送中...",
      successTitle: "发送成功",
      successMessage: "感谢您的询盘，我们会尽快与您联系。",
      errorTitle: "发送失败",
      errorMessage: "消息发送失败，请稍后重试或直接发送邮件至 info@ekd.com.cn。",
      rateLimitMessage: "请求过于频繁，请稍后再试。",
    },
  },
  downloads: {
    eyebrow: "资料下载",
    title: "样册与技术参考资料。",
    description: "下载主要产品资料，便于与你的团队一起评估。",
    action: "下载",
    items: [
      {
        title: "EKD 全系列产品样册",
        description: "涵盖液压缓冲器及相关运动控制产品的整体资料。",
        path: "/catalogs/ekd-full-catalog.pdf",
      },
      {
        title: "2024 隔振器样册",
        description: "聚焦隔振产品系列及相关应用场景的参考资料。",
        path: "/catalogs/vibration-isolator-catalog-2024.pdf",
      },
    ],
  },
  solutions: {
    eyebrow: "解决方案",
    title: "从应用背景出发，快速收敛产品方向。",
    description:
      "按照你目前最明确的信息进入：运动方式或驱动类型。",
    items: [
      {
        title: "按运动方式查找",
        description: "先判断运动行为，再收敛到更合适的缓冲器系列。",
        items: ["直线自由运动", "直线电机驱动", "直线气缸驱动", "旋转运动"],
      },
      {
        title: "按驱动方式查找",
        description: "适合已经明确执行器类型，但还需要系列建议的工程师。",
        items: ["自由运动", "外力驱动", "电机", "气缸"],
      },
    ],
    primaryCta: "浏览产品系列",
    secondaryCta: "开始引导选型",
  },
  applications: {
    eyebrow: "应用场景",
    title: "EKD 缓冲器与隔振产品的典型应用环境。",
    description: "浏览常见设备环境，快速判断不同产品系列通常适用的方向。",
    explore: "查看建议",
    sectors: [
      {
        title: "PET 吹瓶机械",
        description: "高频运动设备，重点关注循环寿命和减速一致性。",
        href: "/solutions",
      },
      {
        title: "汽车制造",
        description: "装配、焊装、冲压等节拍型设备需要可靠的终端防护。",
        href: "/solutions",
      },
      {
        title: "自动化仓储",
        description: "适用于堆垛机、轨道终端和移载系统的冲击防护场景。",
        href: "/solutions",
      },
      {
        title: "港机与起重设备",
        description: "适用于起重机、轨道系统和重载移动结构的大能量吸收场景。",
        href: "/solutions",
      },
    ],
  },
};

const germanCopy: SiteCopy = {
  ...englishCopy,
  metadata: {
    ...englishCopy.metadata,
    defaultTitle: "EKD | Plattform zur Auswahl industrieller Stoßdämpfer",
    defaultDescription:
      "Finden Sie geeignete industrielle Stoßdämpfer, Schwerlastpuffer und Schwingungsisolatoren mit produktspezifischer Suche und auslegungsorientierter Navigation.",
    homeTitle: "Startseite",
    buyerTitle: "Schnellfilter für Einkäufer",
    engineerTitle: "Auslegung für Ingenieure",
    aboutTitle: "Über EKD",
    contactTitle: "Kontakt",
    downloadsTitle: "Downloads",
    solutionsTitle: "Lösungen",
    applicationsTitle: "Anwendungen",
  },
  navigation: {
    brandEyebrow: "Bewegungssteuerung",
    brandDescription: "Industrielle Stoßdämpfer und Bewegungsschutz",
    localeSwitcherLabel: "Sprache",
    mobileMenuOpen: "Menü öffnen",
    mobileMenuClose: "Menü schließen",
    items: [
      { label: "Produkte", href: "/products" },
      { label: "Auslegung", href: "/selector/engineer", highlight: true },
      { label: "Anwendungen", href: "/applications" },
      { label: "Downloads", href: "/downloads" },
      { label: "Über uns", href: "/about" },
      { label: "Kontakt", href: "/contact" },
    ],
  },
  breadcrumb: {
    home: "Startseite",
  },
  footer: {
    summary:
      "Finden Sie Produktfamilien, vergleichen Sie Modelle und starten Sie die Auslegung aus realen Einsatzbedingungen. EKD unterstützt sowohl schnelle Vorauswahl als auch tiefere technische Bewertung.",
    groups: [
      {
        title: "Produkte finden",
        links: [
          { label: "Alle Produktfamilien", href: "/products" },
          { label: "Nach Anwendung suchen", href: "/applications" },
          { label: "Ingenieur-Auslegung", href: "/selector/engineer" },
          { label: "Schnellfilter", href: "/selector/buyer" },
        ],
      },
      {
        title: "Ressourcen",
        links: [
          { label: "Anwendungen", href: "/applications" },
          { label: "Downloads", href: "/downloads" },
          { label: "Über EKD", href: "/about" },
        ],
      },
      {
        title: "Kontakt",
        links: [
          { label: "Kontaktieren Sie uns", href: "/contact" },
          { label: "Vertrieb", href: "/contact" },
          { label: "Technischer Support", href: "/contact" },
        ],
      },
    ],
  },
  home: {
    ...englishCopy.home,
    badge: "Den richtigen Einstieg finden",
    title: "Den passenden industriellen Stoßdämpfer finden, bevor Sie den Katalog lesen.",
    description:
      "EKD kombiniert Produktfamilien, Anwendungshinweise und Bewegungsauslegung, damit Ingenieure und Einkäufer schneller zu einer passenden Vorauswahl kommen.",
    primaryCta: "Produktfamilien ansehen",
    secondaryCta: "Auslegung starten",
    audienceCards: [
      {
        label: "Am besten für",
        title: "Ingenieure",
        description: "Auslegungslogik, Bewegungsbezug und Filterbegründung.",
      },
      {
        label: "Am besten für",
        title: "Einkäufer",
        description: "Schnelle Vorauswahl nach Hub, Energie, Kraft und Gewinde.",
      },
      {
        label: "Abdeckung",
        title: "Linear + Rotatorisch",
        description: "Fünf geführte Bewegungskategorien für schnellere Auswahl.",
      },
    ],
    routePanel: {
      eyebrow: "Auswahlhilfe",
      title: "Wählen Sie Ihren Einstieg",
      caption: "Für Technik- und Einkaufsteams",
      items: [
        {
          title: "Ich kenne den Produkttyp",
          description: "Direkt zu den Produktfamilien und den passenden Bereich schnell eingrenzen.",
          href: "/products",
        },
        {
          title: "Ich kenne die Anwendung",
          description: "Vom Maschinentyp, Linienkontext und Stoßfall aus starten.",
          href: "/applications",
        },
        {
          title: "Ich kenne das Bewegungsprofil",
          description: "Von Bewegung, Einbaulage und Antriebsbedingungen aus starten.",
          href: "/selector/engineer",
        },
        {
          title: "Ich brauche nur eine kurze Liste",
          description: "Produkte nach Hub, Energie, Kraft und Gewindegröße filtern.",
          href: "/selector/buyer",
        },
      ],
    },
    motionSection: {
      eyebrow: "Auslegung nach Bewegung",
      title: "Mit dem Bewegungsmuster beginnen und den richtigen Auslegungspfad eingrenzen.",
      cta: "Geführte Auslegung",
      availableSuffixSingle: "Auslegungsoption verfügbar",
      availableSuffixPlural: "Auslegungsoptionen verfügbar",
    },
    productSection: {
      eyebrow: "Produktfamilien",
      title: "Breit starten und dann den passenden Energiebereich eingrenzen.",
      liveDescription:
        "Katalogmodelle sind nach Produktfamilien gruppiert, damit Sie den geeigneten Bereich schneller finden.",
      fallbackDescription:
        "Sehen Sie sich zuerst die wichtigsten Produktfamilien an und wechseln Sie dann in den Modellvergleich.",
      modelsAvailable: "Modelle im Katalog",
      catalogUnavailable: "Kataloganzahl nicht verfügbar",
    },
    applicationSection: {
      eyebrow: "Anwendungen",
      title: "Produkte nach Maschinenumgebung und Anwendungsfall finden.",
      description:
        "Viele Nutzer kennen zuerst den Maschinenkontext, bevor sie die genaue Produktfamilie kennen. Beginnen Sie mit typischen Branchen.",
      cta: "Alle Anwendungen anzeigen",
      explore: "Optionen ansehen",
      sectors: [
        {
          title: "PET-Blasmaschinen",
          description:
            "Hochfrequente Maschinenbewegungen, bei denen Lebensdauer und konstante Verzögerung entscheidend sind.",
          href: "/products/super-long-life-shock-absorbers",
        },
        {
          title: "Automobilfertigung",
          description:
            "Montage-, Schweiß- und Presssysteme, die Maschinenschutz ohne Taktverlust benötigen.",
          href: "/products/adjustable-shock-absorbers",
        },
        {
          title: "Automatisierte Lager",
          description:
            "Endanschlag- und Notfall-Stoßschutz für Regalbediengeräte und Transfersysteme.",
          href: "/products/heavy-duty-shock-absorbers",
        },
        {
          title: "Hafen- und Hebetechnik",
          description:
            "Stoßenergieaufnahme für Krane, Schienensysteme und schwere bewegte Strukturen.",
          href: "/products/heavy-industry-buffers",
        },
      ],
    },
    trustSection: {
      eyebrow: "Technische Unterstützung",
      title: "Industrielle Erfahrung hinter dem Auswahlpfad.",
      description:
        "EKD kombiniert Produktbreite, Anwendungsunterstützung und Auswahlhilfe für Standardautomation und schwere Stoßbelastung.",
      items: [
        "30+ Mitarbeiter, Kernteam mit mehr als 15 Jahren Branchenerfahrung",
        "Anwendungserfahrung in Standardindustrie und anspruchsvollen Schwerlastumgebungen",
        "Qualitäts- und Compliance-Referenzen: ISO9001, ROHS und CE",
        "Technische Unterstützung für Auslegung und Anwendungsempfehlungen",
      ],
    },
  },
  buyer: {
    ...englishCopy.buyer,
    eyebrow: "Schnellfilter für Einkäufer",
    title: "Geeignete Modelle schnell nach bekannten Grenzwerten filtern.",
    description:
      "Nutzen Sie diese Seite, um den Bereich nach Hub, Energie, Kraft, Länge und Gewindeanforderungen einzugrenzen.",
    panelTitle: "Produkte filtern",
    panelDescription: "Grenzen Sie die Auswahl anhand der bereits bekannten Werte ein.",
    fields: {
      type: "Produkttyp",
      minStrokeMm: "Mindesthub (mm)",
      minEnergyPerCycleNm: "Mindestenergie / Zyklus (Nm/Zyklus)",
      minEnergyPerHourNm: "Mindestenergie / Stunde (Nm/h)",
      minImpactForceN: "Minimale Stoßkraft (N)",
      minThrustForceN: "Minimale Schubkraft (N)",
      maxTotalLengthMm: "Maximale Gesamtlänge (mm)",
      threadSize: "Gewindegröße",
    },
    buttons: {
      search: "Produkte suchen",
      searching: "Suche läuft...",
      clear: "Filter zurücksetzen",
    },
    errors: {
      searchFailed: "Die Suche konnte derzeit nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
    },
    emptyState:
      "Es wurde noch keine Suche ausgeführt. Starten Sie mit den Filtern oben, um passende Modelle zu erhalten.",
    resultsTitle: "Passende Modelle",
    resultsSummary: "Modelle entsprechen den aktuellen Filtern.",
    noResults: "Aktuell erfüllt kein Modell diese Filterkombination.",
    table: {
      model: "Modell",
      type: "Typ",
      stroke: "Hub",
      energyPerCycle: "Energie / Zyklus",
      energyPerHour: "Energie / Stunde",
      impactForce: "Stoßkraft",
      thrustForce: "Schubkraft",
      length: "Länge",
      thread: "Gewinde",
    },
  },
  engineer: {
    ...englishCopy.engineer,
    eyebrow: "Ingenieur-Auslegung",
    title: "Geführte Auslegung für Anwendungen mit klaren Bewegungsbedingungen.",
    description:
      "Wählen Sie das Bewegungsmuster, geben Sie die wichtigsten Betriebswerte ein und prüfen Sie passende Modelle.",
    motionGroupsTitle: "Bewegungsgruppen",
    howItWorksTitle: "So funktioniert es",
    howItWorksDescription:
      "Beginnen Sie mit der Bewegungsart und grenzen Sie dann nach Einbaulage, Antriebsquelle und Stoppbedingungen ein.",
    whatYouGetTitle: "Ergebnis",
    whatYouGetDescription:
      "Die Ergebnisansicht zeigt die erforderliche Stoppenergie, zentrale Annahmen und passende Produktoptionen.",
    selectMotionCaseTitle: "Bewegungsfall wählen",
    selectMotionCaseDescription:
      "Wählen Sie die Bewegungsgruppe, die am besten zu Ihrer Maschine passt, und gehen Sie dann in den passenden Auslegungspfad.",
    availableRoutesTitle: "Verfügbare Auslegungspfade",
    inputTitle: "Eingabewerte",
    inputDescription: "Geben Sie die Betriebswerte für den gewählten Bewegungsfall ein.",
    chooseRoute: "Wählen Sie zuerst einen verfügbaren Auslegungspfad.",
    beginPrompt: "Wählen Sie oben eine Bewegungsgruppe aus, um zu beginnen.",
    loadingCatalog: "Auslegungspfade werden geladen...",
    routeAvailableSingle: "Auslegungsoption verfügbar",
    routeAvailablePlural: "Auslegungsoptionen verfügbar",
    routePending: "Weitere Fälle folgen",
    comingSoon: "Demnächst",
    buttons: {
      calculate: "Empfehlungen anzeigen",
      calculating: "Berechnung läuft...",
      reset: "Eingaben zurücksetzen",
    },
    errors: {
      chooseRoute: "Bitte wählen Sie zuerst einen Auslegungspfad.",
      loadFailed: "Die Auslegungspfade konnten nicht geladen werden. Bitte aktualisieren Sie die Seite.",
      calculateFailed: "Die Berechnung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
    },
    tip:
      "Wenn Ihre Anwendung nicht exakt einem Pfad entspricht, starten Sie mit dem ähnlichsten Fall als erste Referenz.",
    result: {
      title: "Auslegungsergebnis",
      labels: {
        requiredStroke: "Erforderlicher Hub (mm)",
        energyPerCycle: "Energie / Zyklus (Nm)",
        energyPerHour: "Energie / Stunde (Nm)",
        averageImpactForce: "Schubkraft (N)",
        suggestedFamily: "Empfohlene Familie",
      },
      whyFitsTitle: "Warum diese Modelle passen",
      criteriaTitle: "Auswahlkriterien",
      matchesTitle: "Passende Modelle",
      matchesSummary: "Modelle entsprechen den berechneten Anforderungen.",
      noMatches:
        "Aktuell erfüllt kein Modell die berechneten Anforderungen. Versuchen Sie mehr Hub, geringere Energie oder eine Schwerlastfamilie.",
      table: {
        model: "Modell",
        type: "Typ",
        stroke: "Hub",
        energyPerCycle: "Energie / Zyklus",
        energyPerHour: "Energie / Stunde",
        impactForce: "Stoßkraft",
        thread: "Gewinde",
      },
    },
  },
  about: {
    ...englishCopy.about,
    eyebrow: "Über EKD",
    title: "Industrieller Bewegungsschutz mit technischer Unterstützung.",
    description:
      "EKD konzentriert sich auf industrielle Stoßdämpfung, Schwingungskontrolle und Anwendungsunterstützung für Maschinenbauer und industrielle Betreiber.",
    profileTitle: "Unternehmensprofil",
    paragraphs: [
      "Jiangsu EKD Machinery Technical Co., Ltd. konzentriert sich auf Schwingungskontrolle, Geräuschminderung und industrielle Stoßdämpfungsprodukte. Die heutige Materialbasis zeigt sowohl Standardindustrie als auch anspruchsvolle Einsatzumgebungen, gestützt durch ein erfahrenes Team und praxisorientierte Technikunterstützung.",
      "Das Team unterstützt bei Modellauswahl, Anwendungsbewertung und Produktempfehlungen für Automation ebenso wie für schwere Stoßbelastungen.",
    ],
    highlights: [
      "30+ Mitarbeiter, Kernteam mit mehr als 15 Jahren Branchenerfahrung",
      "Anwendungserfahrung in Standardindustrie und anspruchsvollen Schwerlastumgebungen",
      "Qualitäts- und Compliance-Referenzen: ISO9001, ROHS und CE",
      "Unterstützung bei Auslegungsprüfung und Anwendungsempfehlungen",
    ],
  },
  contact: {
    ...englishCopy.contact,
    eyebrow: "Kontakt",
    title: "Sprechen Sie mit EKD über Ihre Maschine, Ihren Bewegungsfall oder Ihre Vorauswahl.",
    description:
      "Teilen Sie uns Anwendung und Leistungsbereich mit, und wir helfen bei der passenden Produktfamilie oder Modellreihe.",
    contactLabels: ["Allgemeine E-Mail", "Technischer Support", "Vertrieb", "Service"],
    form: {
      ...englishCopy.contact.form,
      name: "Name",
      namePlaceholder: "Ihr Name",
      company: "Unternehmen",
      companyPlaceholder: "Unternehmensname",
      email: "E-Mail",
      emailPlaceholder: "sie@firma.com",
      phone: "Telefon",
      phonePlaceholder: "+49 123 456 789",
      brief: "Projektbeschreibung",
      placeholder:
        "Beschreiben Sie Bewegungsfall, Energie, Kraftbereich oder die Produktfamilie, die Sie prüfen.",
      submit: "Anfrage senden",
      submitting: "Wird gesendet...",
      successTitle: "Nachricht gesendet",
      successMessage: "Vielen Dank für Ihre Anfrage. Wir melden uns in Kürze.",
      errorTitle: "Senden fehlgeschlagen",
      errorMessage: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie direkt per E-Mail.",
      rateLimitMessage: "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
    },
  },
  downloads: {
    ...englishCopy.downloads,
    eyebrow: "Downloads",
    title: "Kataloge und technische Unterlagen.",
    description: "Laden Sie die wichtigsten Produktunterlagen herunter, um sie schneller im Team zu bewerten.",
    action: "Herunterladen",
    items: [
      {
        title: "EKD Gesamtkatalog",
        description:
          "Breiter Produktüberblick über hydraulische Stoßdämpfer und verwandte Bewegungskontrollprodukte.",
        path: "/catalogs/ekd-full-catalog.pdf",
      },
      {
        title: "Katalog Schwingungsisolatoren 2024",
        description:
          "Fokussierte Unterlage zu Schwingungsisolatoren und zugehörigen Anwendungen.",
        path: "/catalogs/vibration-isolator-catalog-2024.pdf",
      },
    ],
  },
  solutions: {
    ...englishCopy.solutions,
    eyebrow: "Lösungen",
    title: "Von Ihrer Anwendung aus zum passenden Produktweg.",
    description:
      "Wählen Sie den Einstieg, der am besten zu dem passt, was Sie bereits wissen: Bewegungsart oder Antriebsmethode.",
    items: [
      {
        title: "Nach Bewegung finden",
        description:
          "Zuerst das Bewegungsverhalten wählen und dann die passende Stoßdämpferfamilie eingrenzen.",
        items: [
          "Lineare freie Bewegung",
          "Motorgetriebene Linearbewegung",
          "Zylindergetriebene Bewegung",
          "Rotationsbewegung",
        ],
      },
      {
        title: "Nach Antrieb finden",
        description:
          "Geeignet für Ingenieure, die den Aktor kennen, aber noch Familienführung benötigen.",
        items: ["Freie Bewegung", "Externe Kraft", "Motor", "Zylinder"],
      },
    ],
    primaryCta: "Produktfamilien ansehen",
    secondaryCta: "Geführte Auslegung starten",
  },
  applications: {
    ...englishCopy.applications,
    eyebrow: "Anwendungen",
    title: "Typische Anwendungen für EKD Stoßdämpfer und Puffer.",
    description:
      "Durchsuchen Sie typische Maschinenumgebungen, um zu sehen, wo verschiedene Produktfamilien häufig eingesetzt werden.",
    explore: "Optionen ansehen",
    sectors: [
      {
        title: "PET-Blasmaschinen",
        description:
          "Hochfrequente Maschinenbewegungen, bei denen Lebensdauer und konstante Verzögerung entscheidend sind.",
        href: "/solutions",
      },
      {
        title: "Automobilfertigung",
        description:
          "Montage-, Schweiß- und Presssysteme benötigen zuverlässigen Endanschlagschutz ohne Taktverlust.",
        href: "/solutions",
      },
      {
        title: "Automatisierte Lager",
        description:
          "Stoßschutz für Regalbediengeräte, Schienenenden und Transfersysteme.",
        href: "/solutions",
      },
      {
        title: "Hafen- und Hebetechnik",
        description:
          "Anwendungen mit hoher Energieaufnahme für Krane, Schienensysteme und schwere bewegte Strukturen.",
        href: "/solutions",
      },
    ],
  },
};

const frenchCopy: SiteCopy = {
  ...englishCopy,
  metadata: {
    ...englishCopy.metadata,
    defaultTitle: "EKD | Plateforme de sélection d'amortisseurs industriels",
    defaultDescription:
      "Trouvez des amortisseurs industriels, buffers lourds et isolateurs vibratoires adaptés grâce à une recherche produit et une navigation orientée dimensionnement.",
    homeTitle: "Accueil",
    buyerTitle: "Filtre rapide acheteur",
    engineerTitle: "Dimensionnement ingénieur",
    aboutTitle: "À propos",
    contactTitle: "Contact",
    downloadsTitle: "Téléchargements",
    solutionsTitle: "Solutions",
    applicationsTitle: "Applications",
  },
  navigation: {
    ...englishCopy.navigation,
    brandDescription: "Amortisseurs industriels et protection du mouvement",
    localeSwitcherLabel: "Langue",
    mobileMenuOpen: "Ouvrir le menu",
    mobileMenuClose: "Fermer le menu",
    items: [
      { label: "Produits", href: "/products" },
      { label: "Dimensionnement", href: "/selector/engineer", highlight: true },
      { label: "Applications", href: "/applications" },
      { label: "Téléchargements", href: "/downloads" },
      { label: "À propos", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  breadcrumb: { home: "Accueil" },
  footer: {
    summary:
      "Trouvez des familles de produits, comparez des modèles et commencez le dimensionnement à partir de conditions réelles. EKD prend en charge la présélection rapide et l'analyse technique plus approfondie.",
    groups: [
      {
        title: "Trouver des produits",
        links: [
          { label: "Toutes les familles", href: "/products" },
          { label: "Par application", href: "/applications" },
          { label: "Dimensionnement ingénieur", href: "/selector/engineer" },
          { label: "Filtre rapide", href: "/selector/buyer" },
        ],
      },
      {
        title: "Ressources",
        links: [
          { label: "Applications", href: "/applications" },
          { label: "Téléchargements", href: "/downloads" },
          { label: "À propos d'EKD", href: "/about" },
        ],
      },
      {
        title: "Contact",
        links: [
          { label: "Nous contacter", href: "/contact" },
          { label: "Support commercial", href: "/contact" },
          { label: "Support technique", href: "/contact" },
        ],
      },
    ],
  },
  home: {
    ...englishCopy.home,
    badge: "Trouver le bon point de départ",
    title: "Trouver le bon amortisseur industriel avant d'ouvrir la brochure.",
    description:
      "EKD combine familles de produits, conseils d'application et dimensionnement du mouvement pour aider ingénieurs et acheteurs à converger plus vite vers une présélection adaptée.",
    primaryCta: "Voir les familles de produits",
    secondaryCta: "Ouvrir l'outil de dimensionnement",
    audienceCards: [
      {
        label: "Idéal pour",
        title: "Ingénieurs",
        description: "Logique de dimensionnement, contexte de mouvement, justification du filtrage.",
      },
      {
        label: "Idéal pour",
        title: "Acheteurs",
        description: "Présélection rapide par course, énergie, force et filetage.",
      },
      {
        label: "Couverture",
        title: "Linéaire + Rotatif",
        description: "Cinq catégories de mouvement guidées pour une sélection plus rapide.",
      },
    ],
    routePanel: {
      eyebrow: "Guide de sélection",
      title: "Choisissez votre parcours",
      caption: "Pour les équipes techniques et achats",
      items: [
        {
          title: "Je connais le type de produit",
          description: "Aller directement aux familles et réduire rapidement le bon périmètre.",
          href: "/products",
        },
        {
          title: "Je connais l'application",
          description: "Commencer par le type de machine, le contexte de ligne et le scénario de choc.",
          href: "/applications",
        },
        {
          title: "Je connais le scénario de mouvement",
          description: "Commencer par le mouvement, l'orientation de montage et les conditions d'entraînement.",
          href: "/selector/engineer",
        },
        {
          title: "J'ai besoin d'une liste rapide",
          description: "Filtrer les produits par course, énergie, force et filetage.",
          href: "/selector/buyer",
        },
      ],
    },
    motionSection: {
      eyebrow: "Dimensionnement par mouvement",
      title: "Commencez par le schéma de mouvement puis resserrez le bon parcours de dimensionnement.",
      cta: "Dimensionnement guidé",
      availableSuffixSingle: "option de dimensionnement disponible",
      availableSuffixPlural: "options de dimensionnement disponibles",
    },
    productSection: {
      eyebrow: "Familles de produits",
      title: "Commencez large puis resserrez vers la bonne plage d'énergie.",
      liveDescription:
        "modèles catalogue sont regroupés par famille pour accélérer la présélection.",
      fallbackDescription:
        "Parcourez d'abord les principales familles de produits, puis passez à la comparaison détaillée des modèles.",
      modelsAvailable: "modèles dans le catalogue",
      catalogUnavailable: "Nombre catalogue indisponible",
    },
    applicationSection: {
      eyebrow: "Applications",
      title: "Trouver des produits selon l'environnement machine et le cas d'usage.",
      description:
        "Beaucoup d'utilisateurs connaissent d'abord le contexte machine avant la famille exacte. Commencez par les secteurs typiques.",
      cta: "Voir toutes les applications",
      explore: "Voir les options",
      sectors: [
        {
          title: "Machines de soufflage PET",
          description:
            "Mouvements machine à haute fréquence où la durée de vie et la décélération constante sont critiques.",
          href: "/products/super-long-life-shock-absorbers",
        },
        {
          title: "Fabrication automobile",
          description:
            "Systèmes d'assemblage, soudage et emboutissage qui demandent une protection machine sans perte de cadence.",
          href: "/products/adjustable-shock-absorbers",
        },
        {
          title: "Entrepôts automatisés",
          description:
            "Protection de fin de course et d'impact d'urgence pour transstockeurs et systèmes de transfert.",
          href: "/products/heavy-duty-shock-absorbers",
        },
        {
          title: "Équipements portuaires et de levage",
          description:
            "Absorption d'énergie sévère pour grues, systèmes sur rail et structures lourdes en mouvement.",
          href: "/products/heavy-industry-buffers",
        },
      ],
    },
    trustSection: {
      eyebrow: "Support technique",
      title: "L'expérience industrielle derrière le parcours de sélection.",
      description:
        "EKD combine largeur de gamme, support d'application et aide à la sélection pour l'automatisation standard et les chocs sévères.",
      items: [
        "30+ collaborateurs, équipe centrale avec plus de 15 ans d'expérience",
        "Expérience d'application dans l'industrie standard et les environnements lourds exigeants",
        "Références qualité et conformité : ISO9001, ROHS et CE",
        "Support technique pour revue de dimensionnement et recommandations d'application",
      ],
    },
  },
  buyer: {
    ...englishCopy.buyer,
    eyebrow: "Filtre rapide acheteur",
    title: "Filtrer rapidement les modèles adaptés selon les limites déjà connues.",
    description:
      "Utilisez cette page pour resserrer la plage selon la course, l'énergie, la force, la longueur et le filetage.",
    panelTitle: "Filtrer les produits",
    panelDescription: "Resserrez la plage à partir des limites déjà connues.",
    fields: {
      type: "Type de produit",
      minStrokeMm: "Course minimale (mm)",
      minEnergyPerCycleNm: "Énergie minimale / cycle (Nm/cycle)",
      minEnergyPerHourNm: "Énergie minimale / heure (Nm/h)",
      minImpactForceN: "Force d'impact minimale (N)",
      minThrustForceN: "Force de poussée minimale (N)",
      maxTotalLengthMm: "Longueur totale maximale (mm)",
      threadSize: "Taille de filetage",
    },
    buttons: {
      search: "Rechercher",
      searching: "Recherche en cours...",
      clear: "Effacer les filtres",
    },
    errors: {
      searchFailed: "La recherche n'a pas pu être effectuée pour le moment. Veuillez réessayer.",
    },
    emptyState: "Aucune recherche n'a encore été lancée. Commencez avec les filtres ci-dessus.",
    resultsTitle: "Modèles correspondants",
    resultsSummary: "modèles correspondent à vos filtres.",
    noResults: "Aucun modèle ne correspond actuellement à cette combinaison de filtres.",
    table: {
      model: "Modèle",
      type: "Type",
      stroke: "Course",
      energyPerCycle: "Énergie / cycle",
      energyPerHour: "Énergie / heure",
      impactForce: "Force d'impact",
      thrustForce: "Force de poussée",
      length: "Longueur",
      thread: "Filetage",
    },
  },
  engineer: {
    ...englishCopy.engineer,
    eyebrow: "Dimensionnement ingénieur",
    title: "Dimensionnement guidé pour les applications avec conditions de mouvement définies.",
    description:
      "Choisissez le schéma de mouvement, saisissez les valeurs principales et consultez les modèles correspondants.",
  },
  about: {
    ...englishCopy.about,
    eyebrow: "À propos d'EKD",
    title: "Protection industrielle du mouvement soutenue par le support technique.",
    description:
      "EKD se concentre sur l'amortissement industriel, le contrôle vibratoire et l'assistance applicative pour constructeurs de machines et opérateurs industriels.",
    profileTitle: "Profil de l'entreprise",
  },
  contact: {
    ...englishCopy.contact,
    eyebrow: "Contact",
    title: "Échangez avec EKD au sujet de votre machine, de votre scénario de mouvement ou de votre présélection.",
    description:
      "Partagez votre application et votre plage de performances, et nous vous aiderons à confirmer la bonne famille ou le bon modèle.",
  },
  downloads: {
    ...englishCopy.downloads,
    eyebrow: "Téléchargements",
    title: "Catalogues et références techniques.",
    description: "Téléchargez les principaux documents produits pour une revue plus rapide avec votre équipe.",
    action: "Télécharger",
  },
  solutions: {
    ...englishCopy.solutions,
    eyebrow: "Solutions",
    title: "Commencez par votre application et resserrez la bonne direction produit.",
    description:
      "Choisissez l'entrée qui correspond le mieux à ce que vous savez déjà : type de mouvement ou méthode d'entraînement.",
    primaryCta: "Voir les familles de produits",
    secondaryCta: "Commencer le dimensionnement guidé",
  },
  applications: {
    ...englishCopy.applications,
    eyebrow: "Applications",
    title: "Applications courantes des amortisseurs et buffers EKD.",
    description:
      "Parcourez des environnements machine typiques pour voir où les différentes familles sont généralement utilisées.",
    explore: "Voir les options",
  },
};

const italianCopy: SiteCopy = {
  ...englishCopy,
  metadata: {
    ...englishCopy.metadata,
    defaultTitle: "EKD | Piattaforma di selezione per ammortizzatori industriali",
    defaultDescription:
      "Trova ammortizzatori industriali, buffer heavy-duty e isolatori antivibranti con ricerca prodotto e navigazione orientata al dimensionamento.",
    homeTitle: "Home",
    buyerTitle: "Filtro rapido per acquisti",
    engineerTitle: "Dimensionamento tecnico",
    aboutTitle: "Chi siamo",
    contactTitle: "Contatti",
    downloadsTitle: "Download",
    solutionsTitle: "Soluzioni",
    applicationsTitle: "Applicazioni",
  },
  navigation: {
    ...englishCopy.navigation,
    brandDescription: "Ammortizzatori industriali e protezione del movimento",
    localeSwitcherLabel: "Lingua",
    mobileMenuOpen: "Apri menu",
    mobileMenuClose: "Chiudi menu",
    items: [
      { label: "Prodotti", href: "/products" },
      { label: "Dimensionamento", href: "/selector/engineer", highlight: true },
      { label: "Applicazioni", href: "/applications" },
      { label: "Download", href: "/downloads" },
      { label: "Chi siamo", href: "/about" },
      { label: "Contatti", href: "/contact" },
    ],
  },
  breadcrumb: { home: "Home" },
  footer: {
    summary:
      "Trova famiglie di prodotto, confronta modelli e avvia il dimensionamento da condizioni reali. EKD supporta sia la shortlist rapida sia la valutazione tecnica più approfondita.",
    groups: [
      {
        title: "Trovare prodotti",
        links: [
          { label: "Tutte le famiglie", href: "/products" },
          { label: "Per applicazione", href: "/applications" },
          { label: "Dimensionamento tecnico", href: "/selector/engineer" },
          { label: "Filtro rapido", href: "/selector/buyer" },
        ],
      },
      {
        title: "Risorse",
        links: [
          { label: "Applicazioni", href: "/applications" },
          { label: "Download", href: "/downloads" },
          { label: "Chi è EKD", href: "/about" },
        ],
      },
      {
        title: "Contatto",
        links: [
          { label: "Contattaci", href: "/contact" },
          { label: "Supporto commerciale", href: "/contact" },
          { label: "Supporto tecnico", href: "/contact" },
        ],
      },
    ],
  },
  home: {
    ...englishCopy.home,
    badge: "Trova il punto di partenza giusto",
    title: "Trova l'ammortizzatore industriale giusto prima di aprire la brochure.",
    description:
      "EKD combina famiglie di prodotto, guida applicativa e dimensionamento del movimento per aiutare tecnici e buyer a convergere più rapidamente su una shortlist adatta.",
    primaryCta: "Vedi le famiglie di prodotto",
    secondaryCta: "Apri lo strumento di dimensionamento",
  },
  buyer: {
    ...englishCopy.buyer,
    eyebrow: "Filtro rapido per acquisti",
    title: "Filtra rapidamente i modelli adatti in base ai limiti già noti.",
    description:
      "Usa questa pagina per restringere il campo in base a corsa, energia, forza, lunghezza e filettatura.",
  },
  engineer: {
    ...englishCopy.engineer,
    eyebrow: "Dimensionamento tecnico",
    title: "Dimensionamento guidato per applicazioni con condizioni di moto definite.",
    description:
      "Scegli il profilo di moto, inserisci i valori principali e verifica i modelli compatibili.",
  },
  about: {
    ...englishCopy.about,
    eyebrow: "Chi è EKD",
    title: "Protezione industriale del movimento supportata da assistenza tecnica.",
    description:
      "EKD si concentra su ammortizzazione industriale, controllo delle vibrazioni e supporto applicativo per costruttori di macchine e operatori industriali.",
    profileTitle: "Profilo aziendale",
  },
  contact: {
    ...englishCopy.contact,
    eyebrow: "Contatti",
    title: "Parla con EKD della tua macchina, del tuo scenario di moto o della tua shortlist.",
    description:
      "Condividi applicazione e prestazioni richieste e ti aiuteremo a confermare la famiglia o il modello più adatto.",
  },
  downloads: {
    ...englishCopy.downloads,
    eyebrow: "Download",
    title: "Cataloghi e riferimenti tecnici.",
    description: "Scarica la documentazione principale per una valutazione più rapida con il tuo team.",
    action: "Scarica",
  },
  solutions: {
    ...englishCopy.solutions,
    eyebrow: "Soluzioni",
    title: "Parti dalla tua applicazione e restringi la direzione prodotto corretta.",
    description:
      "Scegli l'ingresso che corrisponde meglio a ciò che già conosci: tipo di moto o metodo di azionamento.",
  },
  applications: {
    ...englishCopy.applications,
    eyebrow: "Applicazioni",
    title: "Applicazioni tipiche per ammortizzatori e buffer EKD.",
    description:
      "Esplora ambienti macchina tipici per capire dove vengono utilizzate le diverse famiglie di prodotto.",
  },
};

const siteCopyByLocale: Record<Locale, SiteCopy> = {
  en: englishCopy,
  "zh-cn": chineseCopy,
  de: germanCopy,
  fr: frenchCopy,
  it: italianCopy,
};

export function getSiteCopy(locale: Locale) {
  return siteCopyByLocale[locale] ?? englishCopy;
}
