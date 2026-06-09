export type CatalogFamilySeed = {
  key: string;
  slug: string;
  sortOrder: number;
  translations: Record<"en" | "zh-cn", {
    name: string;
    tag?: string;
    summary: string;
    description: string;
    applicationNotes?: string;
    workingPrinciple?: string;
    constructionNotes?: string;
    featureNotes?: string;
    seoSummary?: string;
  }>;
};

export type CatalogSeriesSeed = {
  familyKey: string;
  code: string;
  slug: string;
  name: string;
  sortOrder: number;
  selectorEligible: boolean;
  overview: string;
  workingPrinciple?: string;
  constructionNotes?: string;
  materialNotes?: string;
  applicationNotes?: string;
  featureNotes?: string;
  sourceSummary: string;
};

export const catalogFamilySeeds: CatalogFamilySeed[] = [
  {
    key: "shock_absorbers",
    slug: "shock-absorbers",
    sortOrder: 10,
    translations: {
      en: {
        name: "Shock Absorbers",
        tag: "Hydraulic energy absorption",
        summary: "Adjustable, non-adjustable and long-life hydraulic shock absorbers for machine motion protection.",
        description: "This family covers compact hydraulic shock absorbers used to decelerate moving loads, protect precision components and stabilize end-stop motion in automation, packaging and machinery applications.",
        applicationNotes: "Automation axes, pneumatic cylinders, motor-driven slides, packaging equipment, robotics and repeatable machine stops.",
        workingPrinciple: "Hydraulic oil is forced through calibrated or adjustable orifices as the piston moves, converting kinetic energy into heat and controlling deceleration.",
        constructionNotes: "Threaded cylinders, piston rods, bearings, orifice systems, return springs or accumulators, optional caps and mounting accessories.",
        featureNotes: "EK/EKL models are adjustable, EN models are self-compensating and ES models emphasize high cycle life.",
      },
      "zh-cn": {
        name: "液压缓冲器",
        tag: "液压能量吸收",
        summary: "覆盖可调、固定型和超长寿命液压缓冲器，用于机械运动防护。",
        description: "该产品族用于吸收运动负载冲击能量，保护精密部件，并改善自动化、包装和机械设备的端部停止过程。",
        applicationNotes: "自动化轴、气缸、电机滑台、包装设备、机器人和重复性端部停止。",
        workingPrinciple: "活塞运动时油液通过节流孔产生阻尼，将动能转化为热量并控制减速。",
        constructionNotes: "外螺纹缸体、活塞杆、轴承、节流系统、复位弹簧或蓄能器，以及可选消音帽和安装附件。",
        featureNotes: "EK/EKL 为可调系列，EN 为自补偿固定型，ES 强调高循环寿命。",
      },
    },
  },
  {
    key: "heavy_duty_buffers",
    slug: "heavy-duty-buffers",
    sortOrder: 20,
    translations: {
      en: {
        name: "Heavy Duty Buffers",
        tag: "Large-energy stopping protection",
        summary: "Heavy industry and heavy duty hydraulic buffers for large moving masses and safety-critical stops.",
        description: "This family covers EI and ED hydraulic buffers for cranes, rail equipment, steel plants, stacker cranes and large production systems.",
        applicationNotes: "Cranes, rail systems, steel industry, coal handling, automated storage, trolley cranes and heavy production lines.",
        workingPrinciple: "Large bore hydraulic damping and gas or air/oil accumulator systems absorb high impact energy while controlling return behavior.",
        constructionNotes: "Heavy cylinders, piston rods, oil chambers, gas or air accumulators, custom orifices, flanges, bellows and safety cables.",
      },
      "zh-cn": {
        name: "重型与重工业缓冲器",
        tag: "大能量安全停止",
        summary: "面向大质量运动结构和安全关键停止场景的重型液压缓冲产品。",
        description: "该产品族覆盖 EI 和 ED 系列，适用于起重、轨道、钢铁、堆垛机和大型生产系统。",
        applicationNotes: "起重机、轨道设备、钢铁行业、煤炭输送、自动仓储、台车和重载生产线。",
        workingPrinciple: "通过大缸径液压阻尼和气体或空气/油液蓄能系统吸收高冲击能量并控制复位。",
        constructionNotes: "重型缸体、活塞杆、油腔、气体或空气蓄能器、定制节流孔、法兰、防护套和安全绳。",
      },
    },
  },
  {
    key: "wire_rope_vibration_isolators",
    slug: "wire-rope-vibration-isolators",
    sortOrder: 30,
    translations: {
      en: {
        name: "Wire Rope Vibration Isolators",
        tag: "Multi-axis shock and vibration isolation",
        summary: "Wire rope isolators for shock resistance, vibration isolation and environmental durability.",
        description: "This family covers WR and CR wire rope isolators made from stainless steel cable and retaining bars for multi-axis equipment protection.",
        applicationNotes: "Transport equipment, electronics, marine installations, military equipment and harsh-environment mounting.",
        workingPrinciple: "Stainless steel cable bends and rubs under load, producing nonlinear stiffness and damping across compression, shear and roll axes.",
        constructionNotes: "Stainless steel cable, aluminum alloy or compact retaining bars, threaded or thru-hole mounting, optional bellmouth holes.",
      },
      "zh-cn": {
        name: "钢丝绳隔振器",
        tag: "多方向冲击与振动隔离",
        summary: "用于抗冲击、隔振和耐环境设备保护的钢丝绳隔振产品。",
        description: "该产品族覆盖 WR 和 CR 系列，由不锈钢钢丝绳和夹板组成，适合多方向设备防护。",
        applicationNotes: "运输设备、电子设备、船舶安装、军用装备和复杂环境安装。",
        workingPrinciple: "钢丝绳在载荷下弯曲并产生摩擦，形成非线性刚度和多轴阻尼。",
        constructionNotes: "不锈钢钢丝绳、铝合金或紧凑夹板、螺纹或通孔安装，可选圆角孔口结构。",
      },
    },
  },
  {
    key: "special_vibration_isolators",
    slug: "special-vibration-isolators",
    sortOrder: 40,
    translations: {
      en: {
        name: "Special Vibration Isolators",
        tag: "Marine and high-impact isolation",
        summary: "Special stainless steel and compound isolators for stricter shock and vibration requirements.",
        description: "This family covers HGGS stainless steel wire rope isolators and HGGN compound anti-impact isolators for demanding equipment installations.",
        applicationNotes: "Marine power equipment, shipboard systems, low natural frequency soft-deck applications and critical equipment isolation.",
        workingPrinciple: "HGGS relies on all-metal wire rope deformation. HGGN combines helical wire rope with elastomer to increase damping, stiffness and energy absorption.",
        constructionNotes: "Stainless steel cable, stainless structures and compound elastomer-encased wire rope constructions.",
      },
      "zh-cn": {
        name: "特种隔振器",
        tag: "船舶与高冲击隔振",
        summary: "面向更严格冲击和隔振要求的不锈钢及复合隔振产品。",
        description: "该产品族覆盖 HGGS 不锈钢钢绳隔振器和 HGGN 复合抗冲隔振器。",
        applicationNotes: "船舶动力设备、舰载系统、低固有频率软甲板应用和关键设备隔振。",
        workingPrinciple: "HGGS 依靠全金属钢绳变形耗能；HGGN 通过钢绳与弹性体复合结构提高阻尼、刚度和吸能效率。",
        constructionNotes: "不锈钢钢缆、不锈钢结构件和弹性体包覆钢绳复合结构。",
      },
    },
  },
  {
    key: "flexible_pipe_connections",
    slug: "flexible-pipe-connections",
    sortOrder: 50,
    translations: {
      en: {
        name: "Flexible Pipe Connections",
        tag: "Single-flanged flexible pipe links",
        summary: "JYXR flexible pipe connections for pipe movement compensation and vibration reduction.",
        description: "This family covers balanced and large-deflection single-flanged flexible connecting pipes used in pipe systems requiring movement tolerance.",
        applicationNotes: "Industrial and marine pipe systems where flange geometry, nominal diameter and interface standards matter.",
        workingPrinciple: "The flexible pipe section reduces rigid transmission and compensates displacement between connected pipe sections.",
        constructionNotes: "Single flange, flexible pipe body, bolt-hole patterns and interface standards such as GB569-65 and GB2501-89.",
      },
      "zh-cn": {
        name: "挠性接管",
        tag: "单法兰挠性连接",
        summary: "用于管路位移补偿和减振的 JYXR 单法兰挠性接管。",
        description: "该产品族覆盖平衡式和大变形单法兰挠性接管，适用于需要位移容许的管路系统。",
        applicationNotes: "工业和船舶管路系统，关注法兰尺寸、公称通径和接口标准。",
        workingPrinciple: "挠性管段降低刚性传递，并补偿连接管段之间的位移。",
        constructionNotes: "单法兰、挠性管体、螺栓孔结构和 GB569-65、GB2501-89 等接口标准。",
      },
    },
  },
];

export const catalogSeriesSeeds: CatalogSeriesSeed[] = [
  {
    familyKey: "shock_absorbers",
    code: "EK",
    slug: "ek-adjustable-shock-absorbers",
    name: "EK / EKL Adjustable Hydraulic Shock Absorbers",
    sortOrder: 10,
    selectorEligible: true,
    overview: "Adjustable hydraulic shock absorbers with standard EK and low-speed EKL variants for changing payload, velocity and force conditions.",
    workingPrinciple: "Turning the adjustment knob changes the effective orifice area, increasing or decreasing damping force while oil flow controls deceleration.",
    constructionNotes: "Piston rod, bearing, piston head, oil chamber, check valve or check ring, foam accumulator, adjustment cam or ball, and threaded cylinder.",
    materialNotes: "Nickel-plated finishes are standard for corrosion resistance; stainless steel versions are available for harsh environments.",
    applicationNotes: "Cylinder-driven, motor-driven and inertia-load machinery where tuning is required.",
    featureNotes: "Adjustment scale supports damping changes without replacing the unit.",
    sourceSummary: "English Shock Absorber PDF pages 4-19; Chinese full catalog pages 4-19.",
  },
  {
    familyKey: "shock_absorbers",
    code: "EN",
    slug: "en-non-adjustable-shock-absorbers",
    name: "EN Non-Adjustable Hydraulic Shock Absorbers",
    sortOrder: 20,
    selectorEligible: true,
    overview: "Self-compensating non-adjustable shock absorbers for repeatable machine stops and high-frequency equipment.",
    workingPrinciple: "Multiple orifices are progressively closed by piston movement, adapting the available flow area to impact conditions.",
    constructionNotes: "Integrated non-detachable structure with piston rod, coil spring, foam accumulator, check ring and multiple-orifice shock tube.",
    materialNotes: "Nickel-plated finishes and optional stainless steel materials are available.",
    applicationNotes: "High-frequency precision equipment, automation stops, food processing and conveyor systems.",
    featureNotes: "Tamperproof design and long service life up to 25-30 million cycles in catalog descriptions.",
    sourceSummary: "English Shock Absorber PDF pages 20-35; Chinese full catalog pages 20-35.",
  },
  {
    familyKey: "shock_absorbers",
    code: "ES",
    slug: "es-super-long-life-shock-absorbers",
    name: "ES Super Long Life Shock Absorbers",
    sortOrder: 30,
    selectorEligible: true,
    overview: "Non-adjustable long-life hydraulic shock absorbers for harsh high-cycle packaging and precision machinery applications.",
    workingPrinciple: "Maintenance-free integrated hydraulic damping absorbs repeated machine impacts over long cycle-life requirements.",
    constructionNotes: "Compact integrated units with application-specific stroke, rod length, thread and cap variants.",
    applicationNotes: "Beverage packaging, mold clamping, clam shell and stretching rod positions.",
    featureNotes: "Catalog models show 15-25 million cycle service-life targets.",
    sourceSummary: "English Shock Absorber PDF pages 36-37; Chinese full catalog pages 36-37.",
  },
  {
    familyKey: "heavy_duty_buffers",
    code: "EI",
    slug: "ei-heavy-industry-buffers",
    name: "EI Heavy Industry Shock Absorbers",
    sortOrder: 10,
    selectorEligible: true,
    overview: "Gas-charged heavy industry buffers for large or super-large equipment safety stops.",
    workingPrinciple: "A nitrogen-charged return system enables controlled deceleration and positive return in a maintenance-free package.",
    constructionNotes: "Cylinder, piston rod, oil chamber, nitrogen gas chamber, separating piston, flanges, optional bellows and safety cables.",
    materialNotes: "Epoxy-coated housings, hard-chrome piston rods and optional galvanized finishes support corrosive environments.",
    applicationNotes: "Cranes, rail equipment, steel industry, coal handling and railway systems.",
    sourceSummary: "English Heavy Duty Shock Absorber PDF pages 4-7; Chinese full catalog pages 38-41.",
  },
  {
    familyKey: "heavy_duty_buffers",
    code: "ED",
    slug: "ed-heavy-duty-shock-absorbers",
    name: "ED Heavy Duty Shock Absorbers",
    sortOrder: 20,
    selectorEligible: true,
    overview: "Compact heavy duty shock absorbers with internal air/oil accumulator for smooth high-energy damping.",
    workingPrinciple: "Internal accumulator and custom orifices provide smooth deceleration over long strokes and high energy inputs.",
    constructionNotes: "Cylinder, piston rod, bearing, piston head, check ring, oil orifice holes, shock tube and optional sensor systems.",
    materialNotes: "Painted or galvanized external components, special rod materials and optional seal packages are available.",
    applicationNotes: "Automated storage, rail equipment, trolley cranes and automatic production lines.",
    sourceSummary: "English Heavy Duty Shock Absorber PDF pages 8-16; Chinese full catalog pages 42-51.",
  },
  {
    familyKey: "wire_rope_vibration_isolators",
    code: "WR",
    slug: "wr-wire-rope-vibration-isolators",
    name: "WR Wire Rope Vibration Isolators",
    sortOrder: 10,
    selectorEligible: false,
    overview: "Standard multi-axis wire rope vibration isolators built from stainless steel cable and retaining bars.",
    workingPrinciple: "Nonlinear cable deformation and friction provide vibration stiffness for small deflections and shock stiffness for larger impacts.",
    constructionNotes: "Stainless steel cable threaded through retaining bars with thru-hole, countersunk or threaded mounting options.",
    materialNotes: "302/304 stainless steel wire rope, anodized aluminum alloy mount bars and zinc-plated alloy steel hardware.",
    applicationNotes: "Civil and military equipment requiring corrosion resistance and multi-axis shock isolation.",
    sourceSummary: "English Wire Rope Vibration Isolator PDF pages 4-34; Chinese full catalog pages 52-82.",
  },
  {
    familyKey: "wire_rope_vibration_isolators",
    code: "CR",
    slug: "cr-compact-wire-rope-vibration-isolators",
    name: "CR Compact Wire Rope Vibration Isolators",
    sortOrder: 20,
    selectorEligible: false,
    overview: "Compact wire rope isolators for smaller equipment envelopes.",
    workingPrinciple: "Compact cable loop geometry provides nonlinear stiffness and damping in multiple axes.",
    constructionNotes: "Compact retaining bar and cable construction with model-specific mounting dimensions.",
    applicationNotes: "Smaller equipment needing wire rope isolation in restricted spaces.",
    sourceSummary: "English Wire Rope Vibration Isolator PDF pages 35-46; Chinese full catalog pages 83-95.",
  },
  {
    familyKey: "special_vibration_isolators",
    code: "HGGS",
    slug: "hggs-stainless-steel-wire-rope-vibration-isolators",
    name: "HGGS Stainless Steel Wire Rope Vibration Isolators",
    sortOrder: 10,
    selectorEligible: false,
    overview: "All-stainless steel wire rope vibration isolators for marine and corrosion-sensitive equipment.",
    workingPrinciple: "All-metal wire rope deformation provides nonlinear stiffness, long life and environmental stability.",
    materialNotes: "Stainless steel construction for water, salt fog, oil and sunlight resistance.",
    applicationNotes: "Marine power equipment and general electrical equipment vibration isolation.",
    sourceSummary: "English Special Vibration Isolator PDF pages 6-9; Chinese full catalog pages 96-99.",
  },
  {
    familyKey: "special_vibration_isolators",
    code: "HGGN",
    slug: "hggn-anti-impact-vibration-isolators",
    name: "HGGN Anti-Impact Vibration Isolators",
    sortOrder: 20,
    selectorEligible: false,
    overview: "Compound high-energy anti-impact isolators combining helical wire rope with elastomer.",
    workingPrinciple: "The stainless cable provides rugged structure while elastomer increases damping, stiffness and energy absorption efficiency.",
    constructionNotes: "Helical wire rope isolator encased in a proprietary elastomeric compound.",
    applicationNotes: "Shipboard equipment and 12-16 Hz soft-deck applications requiring output acceleration reduction.",
    sourceSummary: "English Special Vibration Isolator PDF pages 10-26; Chinese full catalog pages 100-116.",
  },
  {
    familyKey: "flexible_pipe_connections",
    code: "JYXR_P",
    slug: "jyxr-p-balanced-flexible-connecting-pipes",
    name: "JYXR(P) Single-Flanged Balanced Flexible Connecting Pipes",
    sortOrder: 10,
    selectorEligible: false,
    overview: "Single-flanged balanced flexible connecting pipes with cataloged flange and nominal diameter dimensions.",
    workingPrinciple: "The flexible pipe body compensates displacement and reduces vibration transmission in pipe connections.",
    constructionNotes: "One flange and one flexible connecting pipe body with GB569-65 or GB2501-89 interface dimensions.",
    applicationNotes: "Pipe systems requiring fixed standard length and flange geometry.",
    sourceSummary: "English Special Vibration Isolator PDF pages 27-28; Chinese full catalog pages 117-118.",
  },
  {
    familyKey: "flexible_pipe_connections",
    code: "JYXR_H",
    slug: "jyxr-h-large-deflection-flexible-connecting-pipes",
    name: "JYXR(H) Single-Flanged Flexible Connecting Pipes",
    sortOrder: 20,
    selectorEligible: false,
    overview: "Single-flanged flexible connecting pipes with greater deflection capability.",
    workingPrinciple: "A larger-deflection flexible pipe body compensates movement and reduces rigid pipe connection transmission.",
    constructionNotes: "Single flange and flexible pipe body with model-specific nominal diameter and length variants.",
    applicationNotes: "Pipe systems where larger movement compensation is required.",
    sourceSummary: "English Special Vibration Isolator PDF page 29; Chinese full catalog page 119.",
  },
];
