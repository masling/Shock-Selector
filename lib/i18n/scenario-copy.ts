import type { Locale } from "@/lib/i18n/config";

type ScenarioCatalog = ReturnType<typeof import("@/lib/scenarios/registry").getScenarioCatalog>;

const entryCopy = {
  linear_free_motion: {
    en: {
      name: "Linear Motion · Free Motion",
      description:
        "For horizontal sliding, slope travel and vertical free-fall cases without an active drive source.",
    },
    de: {
      name: "Linearbewegung · Freie Bewegung",
      description:
        "Für horizontales Gleiten, Bewegung auf Schräge und vertikalen freien Fall ohne aktiven Antrieb.",
    },
    fr: {
      name: "Mouvement linéaire · Mouvement libre",
      description:
        "Pour glissement horizontal, déplacement sur pente et chute verticale sans source d'entraînement active.",
    },
    it: {
      name: "Moto lineare · Moto libero",
      description:
        "Per scorrimento orizzontale, movimento su piano inclinato e caduta verticale senza azionamento attivo.",
    },
    "zh-cn": {
      name: "直线运动 · 自由运动",
      description: "用于无主动驱动源的水平滑行、斜坡运动和垂直自由下落工况。",
    },
  },
  linear_force_driven: {
    en: {
      name: "Linear Motion · Force Driven",
      description:
        "For external-force-driven linear motion where pushing force contributes to the impact energy.",
    },
    de: {
      name: "Linearbewegung · Fremdkraftantrieb",
      description:
        "Für lineare Bewegungen mit externer Kraft, bei denen die Schubkraft zur Stoßenergie beiträgt.",
    },
    fr: {
      name: "Mouvement linéaire · Entraîné par force externe",
      description:
        "Pour mouvement linéaire entraîné par force externe, où la poussée contribue à l'énergie d'arrêt.",
    },
    it: {
      name: "Moto lineare · Forza esterna",
      description:
        "Per movimento lineare azionato da forza esterna, in cui la spinta contribuisce all'energia di arresto.",
    },
    "zh-cn": {
      name: "直线运动 · 外力驱动",
      description: "用于外力推动的直线运动，外力本身会参与停止能量计算。",
    },
  },
  linear_motor_driven: {
    en: {
      name: "Linear Motion · Motor Driven",
      description:
        "For servo or motor-driven axes where power and deceleration stroke determine absorber sizing.",
    },
    de: {
      name: "Linearbewegung · Motorantrieb",
      description:
        "Für servo- oder motorgetriebene Achsen, bei denen Leistung und Abbremsweg die Auslegung bestimmen.",
    },
    fr: {
      name: "Mouvement linéaire · Entraîné par moteur",
      description:
        "Pour axes entraînés par servo ou moteur, où la puissance et la course de décélération pilotent le dimensionnement.",
    },
    it: {
      name: "Moto lineare · Azionamento motore",
      description:
        "Per assi azionati da servo o motore, dove potenza e corsa di decelerazione determinano il dimensionamento.",
    },
    "zh-cn": {
      name: "直线运动 · 电机驱动",
      description: "用于伺服或电机驱动轴，选型重点取决于功率输入和减速行程。",
    },
  },
  linear_cylinder_driven: {
    en: {
      name: "Linear Motion · Cylinder Driven",
      description:
        "For pneumatic cylinder axes with thrust-based stopping energy and vertical gravity corrections.",
    },
    de: {
      name: "Linearbewegung · Zylinderantrieb",
      description:
        "Für pneumatische Zylinderachsen mit schubbasierter Stoppenergie und Gravitationskorrektur in vertikaler Lage.",
    },
    fr: {
      name: "Mouvement linéaire · Entraîné par vérin",
      description:
        "Pour axes pneumatiques avec énergie d'arrêt liée à la poussée et corrections gravitaires en vertical.",
    },
    it: {
      name: "Moto lineare · Azionamento cilindro",
      description:
        "Per assi pneumatici con energia di arresto basata sulla spinta e correzioni di gravità in verticale.",
    },
    "zh-cn": {
      name: "直线运动 · 气缸驱动",
      description: "用于气缸驱动轴，重点考虑推力做功以及垂直方向的重力影响。",
    },
  },
  rotary_motion: {
    en: {
      name: "Rotary Motion",
      description:
        "For rotating loads, beams, gates and rotary tables routed by load model and gravity direction.",
    },
    de: {
      name: "Rotationsbewegung",
      description:
        "Für rotierende Lasten, Balken, Tore und Rundtische, weitergeführt nach Lastmodell und Gravitationsrichtung.",
    },
    fr: {
      name: "Mouvement rotatif",
      description:
        "Pour charges rotatives, poutres, portes et tables rotatives, orienté par modèle de charge et sens de gravité.",
    },
    it: {
      name: "Moto rotativo",
      description:
        "Per carichi rotanti, travi, portelle e tavole rotanti, instradati per modello di carico e direzione della gravità.",
    },
    "zh-cn": {
      name: "旋转运动",
      description: "用于旋转负荷、摆臂/闸门和旋转工作台等工况，按负荷模型进一步分流。",
    },
  },
} as const;

const familyCopy = {
  linear_free_motion: {
    en: {
      name: "Linear Free Motion",
      description: "Shared calculator family for horizontal, slope and vertical drop cases.",
    },
    de: {
      name: "Lineare freie Bewegung",
      description: "Gemeinsame Rechenfamilie für horizontale, schräge und vertikale Freifallfälle.",
    },
    fr: {
      name: "Mouvement libre linéaire",
      description: "Famille de calcul commune pour cas horizontaux, sur pente et chute verticale.",
    },
    it: {
      name: "Moto lineare libero",
      description: "Famiglia di calcolo comune per casi orizzontali, su pendenza e caduta verticale.",
    },
    "zh-cn": {
      name: "直线自由运动",
      description: "统一覆盖水平、斜坡和垂直跌落等自由运动工况。",
    },
  },
  linear_force_driven: {
    en: {
      name: "Linear Force Driven",
      description: "Shared calculator family for horizontal and vertical externally driven motion.",
    },
    de: {
      name: "Lineare Fremdkraftbewegung",
      description: "Gemeinsame Rechenfamilie für horizontal und vertikal extern angetriebene Bewegung.",
    },
    fr: {
      name: "Mouvement linéaire par force externe",
      description: "Famille de calcul commune pour mouvement externe horizontal et vertical.",
    },
    it: {
      name: "Moto lineare a forza esterna",
      description: "Famiglia di calcolo comune per movimento orizzontale e verticale con forza esterna.",
    },
    "zh-cn": {
      name: "直线外力驱动",
      description: "统一覆盖水平与垂直方向的外力驱动工况。",
    },
  },
  linear_motor_driven: {
    en: {
      name: "Linear Motor Driven",
      description: "Shared calculator family for motorized horizontal and vertical axes.",
    },
    de: {
      name: "Lineare Motorbewegung",
      description: "Gemeinsame Rechenfamilie für motorisierte horizontale und vertikale Achsen.",
    },
    fr: {
      name: "Mouvement linéaire motorisé",
      description: "Famille de calcul commune pour axes motorisés horizontaux et verticaux.",
    },
    it: {
      name: "Moto lineare motorizzato",
      description: "Famiglia di calcolo comune per assi motorizzati orizzontali e verticali.",
    },
    "zh-cn": {
      name: "直线电机驱动",
      description: "统一覆盖水平与垂直方向的电机驱动工况。",
    },
  },
  linear_cylinder_driven: {
    en: {
      name: "Linear Cylinder Driven",
      description: "Shared calculator family for pneumatic cylinder stopping cases.",
    },
    de: {
      name: "Lineare Zylinderbewegung",
      description: "Gemeinsame Rechenfamilie für Stoppszenarien mit Pneumatikzylinder.",
    },
    fr: {
      name: "Mouvement linéaire par vérin",
      description: "Famille de calcul commune pour les cas d'arrêt avec vérin pneumatique.",
    },
    it: {
      name: "Moto lineare a cilindro",
      description: "Famiglia di calcolo comune per casi di arresto con cilindro pneumatico.",
    },
    "zh-cn": {
      name: "直线气缸驱动",
      description: "统一覆盖气缸驱动停止工况。",
    },
  },
  rotary_load: {
    en: {
      name: "Rotary Load",
      description: "Rotating load as the main inertia model, with vertical gravity variants.",
    },
    de: {
      name: "Rotierende Last",
      description: "Rotierende Last als Hauptträgheitsmodell mit vertikalen Gravitationsvarianten.",
    },
    fr: {
      name: "Charge rotative",
      description: "Charge rotative comme modèle d'inertie principal avec variantes verticales liées à la gravité.",
    },
    it: {
      name: "Carico rotativo",
      description: "Carico rotativo come modello principale di inerzia con varianti verticali di gravità.",
    },
    "zh-cn": {
      name: "旋转负荷",
      description: "以旋转负荷惯量为主的工况族，可继续区分重力影响。",
    },
  },
  rotary_beam_or_gate: {
    en: {
      name: "Rotary Beam Or Gate",
      description: "Beam or gate rotation cases with gravity-led routing.",
    },
    de: {
      name: "Rotierender Balken oder Tor",
      description: "Rotationsfälle für Balken oder Tore mit gravitationsgeführter Weiterleitung.",
    },
    fr: {
      name: "Poutre ou porte rotative",
      description: "Cas de rotation de poutre ou porte avec routage piloté par la gravité.",
    },
    it: {
      name: "Trave o portella rotante",
      description: "Casi di rotazione di trave o portella con instradamento guidato dalla gravità.",
    },
    "zh-cn": {
      name: "旋转梁 / 门体",
      description: "用于梁体或门体旋转工况，重点区分重力方向。",
    },
  },
  rotary_table: {
    en: {
      name: "Rotary Table",
      description: "Rotary-table family for indexed or repeated table stopping scenarios.",
    },
    de: {
      name: "Rundtisch",
      description: "Rundtischfamilie für indexierte oder wiederholte Stoppszenarien.",
    },
    fr: {
      name: "Table rotative",
      description: "Famille table rotative pour scénarios d'arrêt indexés ou répétés.",
    },
    it: {
      name: "Tavola rotante",
      description: "Famiglia tavola rotante per arresti indicizzati o ripetuti.",
    },
    "zh-cn": {
      name: "旋转工作台",
      description: "用于分度或重复停靠的旋转工作台工况。",
    },
  },
} as const;

const variantNameByLocale: Record<string, Partial<Record<Locale, string>>> = {
  "linear-free-horizontal": {
    en: "Horizontal free motion",
    "zh-cn": "水平自由运动",
    de: "Freie Horizontalbewegung",
    fr: "Mouvement libre horizontal",
    it: "Moto libero orizzontale",
  },
  "linear-free-vertical-drop": {
    en: "Vertical free drop",
    "zh-cn": "垂直自由下落",
    de: "Vertikaler freier Fall",
    fr: "Chute libre verticale",
    it: "Caduta libera verticale",
  },
  "linear-free-slope": {
    en: "Slope free motion",
    "zh-cn": "斜坡自由滑动",
    de: "Freie Bewegung auf Schräge",
    fr: "Mouvement libre sur pente",
    it: "Moto libero su piano inclinato",
  },
  "linear-force-horizontal": {
    en: "Horizontal force-driven motion",
    "zh-cn": "水平外力驱动",
  },
  "linear-force-vertical-assisting": {
    en: "Vertical force-driven motion (gravity assisting)",
    "zh-cn": "垂直外力驱动（重力同向）",
  },
  "linear-force-vertical-opposing": {
    en: "Vertical force-driven motion (gravity opposing)",
    "zh-cn": "垂直外力驱动（重力反向）",
  },
  "linear-motor-horizontal": {
    en: "Horizontal motor-driven motion",
    "zh-cn": "水平电机驱动",
  },
  "linear-motor-vertical-assisting": {
    en: "Vertical motor-driven motion (gravity assisting)",
    "zh-cn": "垂直电机驱动（重力同向）",
  },
  "linear-motor-vertical-opposing": {
    en: "Vertical motor-driven motion (gravity opposing)",
    "zh-cn": "垂直电机驱动（重力反向）",
  },
  "linear-cylinder-horizontal": {
    en: "Horizontal cylinder-driven motion",
    "zh-cn": "水平气缸驱动",
  },
  "linear-cylinder-vertical-assisting": {
    en: "Vertical cylinder-driven motion (gravity assisting)",
    "zh-cn": "垂直气缸驱动（重力同向）",
  },
  "linear-cylinder-vertical-opposing": {
    en: "Vertical cylinder-driven motion (gravity opposing)",
    "zh-cn": "垂直气缸驱动（重力反向）",
  },
  "rotary-horizontal-load": {
    en: "Rotary load",
    "zh-cn": "旋转负荷工况",
  },
  "rotary-vertical-load-assisting": {
    en: "Vertical rotary load (gravity assisting)",
    "zh-cn": "垂直旋转负荷（重力同向）",
  },
  "rotary-vertical-load-opposing": {
    en: "Vertical rotary load (gravity opposing)",
    "zh-cn": "垂直旋转负荷（重力反向）",
  },
  "rotary-horizontal-beam-or-gate": {
    en: "Horizontal beam / gate rotation",
    "zh-cn": "水平旋转梁 / 门体",
  },
  "rotary-vertical-beam-or-gate-assisting": {
    en: "Vertical beam / gate rotation (gravity assisting)",
    "zh-cn": "垂直旋转梁 / 门体（重力同向）",
  },
  "rotary-vertical-beam-or-gate-opposing": {
    en: "Vertical beam / gate rotation (gravity opposing)",
    "zh-cn": "垂直旋转梁 / 门体（重力反向）",
  },
  "rotary-horizontal-table": {
    en: "Horizontal rotary table",
    "zh-cn": "水平旋转工作台",
    de: "Horizontaler Rundtisch",
    fr: "Table rotative horizontale",
    it: "Tavola rotante orizzontale",
  },
};

const fieldLabelByLocale: Record<string, Partial<Record<Locale, string>>> = {
  movingMassKg: { en: "Moving mass", "zh-cn": "运动质量", de: "Bewegte Masse", fr: "Masse en mouvement", it: "Massa in movimento" },
  impactObjectWeightKg: { en: "Impact object weight", "zh-cn": "冲击物体重量", de: "Gewicht des Stoßobjekts", fr: "Poids de l'objet d'impact", it: "Peso dell'oggetto d'impatto" },
  velocityMs: { en: "Impact velocity", "zh-cn": "冲击速度", de: "Aufprallgeschwindigkeit", fr: "Vitesse d'impact", it: "Velocità d'impatto" },
  speedMs: { en: "Speed", "zh-cn": "速度", de: "Geschwindigkeit", fr: "Vitesse", it: "Velocità" },
  strokeMm: { en: "Available stroke", "zh-cn": "可用行程", de: "Verfügbarer Hub", fr: "Course disponible", it: "Corsa disponibile" },
  absorberCount: { en: "Absorber count", "zh-cn": "缓冲器数量", de: "Anzahl Stoßdämpfer", fr: "Nombre d'amortisseurs", it: "Numero di ammortizzatori" },
  cyclesPerHour: { en: "Cycles per hour", "zh-cn": "每小时循环次数", de: "Zyklen pro Stunde", fr: "Cycles par heure", it: "Cicli all'ora" },
  dropHeightMm: { en: "Drop height", "zh-cn": "跌落高度", de: "Fallhöhe", fr: "Hauteur de chute", it: "Altezza di caduta" },
  heightM: { en: "Height", "zh-cn": "高度", de: "Höhe", fr: "Hauteur", it: "Altezza" },
  slopeAngleDeg: { en: "Slope angle", "zh-cn": "斜坡角度", de: "Neigungswinkel", fr: "Angle de pente", it: "Angolo di pendenza" },
  travelLengthMm: { en: "Travel length", "zh-cn": "滑行长度", de: "Fahrweg", fr: "Longueur de déplacement", it: "Lunghezza di scorrimento" },
  motorPowerKw: { en: "Motor power", "zh-cn": "电机功率", de: "Motorleistung", fr: "Puissance moteur", it: "Potenza motore" },
  decelerationTimeS: { en: "Deceleration time", "zh-cn": "减速时间", de: "Abbremszeit", fr: "Temps de décélération", it: "Tempo di decelerazione" },
  drivingForceN: { en: "Driving force", "zh-cn": "驱动力", de: "Antriebskraft", fr: "Force motrice", it: "Forza di spinta" },
  pushForceN: { en: "Push force", "zh-cn": "推进力", de: "Schubkraft", fr: "Force de poussée", it: "Forza di spinta" },
  cylinderCount: { en: "Cylinder count", "zh-cn": "气缸数量", de: "Anzahl Zylinder", fr: "Nombre de vérins", it: "Numero di cilindri" },
  propulsionCylinderCount: { en: "Propulsion cylinder count", "zh-cn": "推进气缸数量", de: "Anzahl Vorschubzylinder", fr: "Nombre de vérins de poussée", it: "Numero di cilindri di spinta" },
  cylinderBoreMm: { en: "Cylinder bore", "zh-cn": "气缸缸径", de: "Zylinderbohrung", fr: "Alésage du vérin", it: "Alesaggio cilindro" },
  cylinderInnerDiameterMm: { en: "Cylinder inner diameter", "zh-cn": "气缸内径", de: "Zylinderinnendurchmesser", fr: "Diamètre intérieur du vérin", it: "Diametro interno cilindro" },
  cylinderForceN: { en: "Cylinder force", "zh-cn": "气缸推力", de: "Zylinderkraft", fr: "Force du vérin", it: "Forza del cilindro" },
  airPressureBar: { en: "Air pressure", "zh-cn": "气压", de: "Luftdruck", fr: "Pression d'air", it: "Pressione aria" },
  cylinderWorkPressureBar: { en: "Cylinder work pressure", "zh-cn": "气缸工作压力", de: "Arbeitsdruck des Zylinders", fr: "Pression de travail du vérin", it: "Pressione di lavoro del cilindro" },
  angularSpeedRpm: { en: "Angular speed", "zh-cn": "转速", de: "Drehzahl", fr: "Vitesse angulaire", it: "Velocità angolare" },
  angularSpeedRadS: { en: "Angular speed", "zh-cn": "角速度", de: "Winkelgeschwindigkeit", fr: "Vitesse angulaire", it: "Velocità angolare" },
  leverArmMm: { en: "Lever arm", "zh-cn": "力臂长度", de: "Hebelarm", fr: "Bras de levier", it: "Braccio di leva" },
  loadWeightKg: { en: "Load weight", "zh-cn": "负荷重量", de: "Lastgewicht", fr: "Poids de la charge", it: "Peso del carico" },
  rotationRadiusM: { en: "Rotation radius", "zh-cn": "旋转半径", de: "Rotationsradius", fr: "Rayon de rotation", it: "Raggio di rotazione" },
  torqueNm: { en: "Torque", "zh-cn": "扭矩", de: "Drehmoment", fr: "Couple", it: "Coppia" },
  installationRadiusM: { en: "Installation radius", "zh-cn": "安装半径", de: "Einbauradius", fr: "Rayon d'installation", it: "Raggio di installazione" },
  stopAngleDeg: { en: "Stop angle", "zh-cn": "停止角度", de: "Stoppwinkel", fr: "Angle d'arrêt", it: "Angolo di arresto" },
  loadMomentOfInertiaKgM2: { en: "Load inertia", "zh-cn": "负荷转动惯量", de: "Trägheitsmoment der Last", fr: "Inertie de charge", it: "Inerzia del carico" },
  beamMassKg: { en: "Beam mass", "zh-cn": "梁体 / 门体质量", de: "Masse Balken / Tor", fr: "Masse poutre / porte", it: "Massa trave / portella" },
  beamLengthMm: { en: "Beam length", "zh-cn": "梁体 / 门体长度", de: "Länge Balken / Tor", fr: "Longueur poutre / porte", it: "Lunghezza trave / portella" },
  beamWeightKg: { en: "Beam weight", "zh-cn": "横梁重量", de: "Gewicht des Balkens", fr: "Poids de la poutre", it: "Peso della trave" },
  beamLengthM: { en: "Length", "zh-cn": "长度", de: "Länge", fr: "Longueur", it: "Lunghezza" },
  beamThicknessM: { en: "Thickness", "zh-cn": "厚度", de: "Dicke", fr: "Épaisseur", it: "Spessore" },
  gateWeightKg: { en: "Gate weight", "zh-cn": "挡板重量", de: "Gewicht der Klappe", fr: "Poids de la porte", it: "Peso della portella" },
  gateWidthM: { en: "Width", "zh-cn": "宽度", de: "Breite", fr: "Largeur", it: "Larghezza" },
  gateThicknessM: { en: "Thickness", "zh-cn": "厚度", de: "Dicke", fr: "Épaisseur", it: "Spessore" },
  rotationAngleDeg: { en: "Rotation angle", "zh-cn": "旋转角度", de: "Drehwinkel", fr: "Angle de rotation", it: "Angolo di rotazione" },
  startAngleFromVerticalDeg: { en: "Start angle from vertical", "zh-cn": "起点对应垂直线角度", de: "Startwinkel zur Vertikalen", fr: "Angle initial par rapport à la verticale", it: "Angolo iniziale rispetto alla verticale" },
  tableMomentOfInertiaKgM2: { en: "Table inertia", "zh-cn": "工作台转动惯量", de: "Trägheitsmoment des Tisches", fr: "Inertie de la table", it: "Inerzia della tavola" },
  tableDiameterMm: { en: "Table diameter", "zh-cn": "工作台直径", de: "Tischdurchmesser", fr: "Diamètre de la table", it: "Diametro tavola" },
  tableWeightKg: { en: "Table weight", "zh-cn": "工作台重量", de: "Gewicht des Tisches", fr: "Poids de la table", it: "Peso della tavola" },
  loadWeightW1Kg: { en: "Load weight (W1)", "zh-cn": "负荷重量(W1)", de: "Lastgewicht (W1)", fr: "Poids de la charge (W1)", it: "Peso del carico (W1)" },
  tableDiameterM: { en: "Table diameter", "zh-cn": "旋转台直径", de: "Tischdurchmesser", fr: "Diamètre de la table", it: "Diametro tavola" },
};

const guideQuestionCopy: Record<
  string,
  Partial<
    Record<
      Locale,
      {
        label: string;
        helperText: string;
        options: Record<string, string>;
      }
    >
  >
> = {
  orientation: {
    en: {
      label: "Motion orientation",
      helperText: "Choose how the moving object approaches the end stop.",
      options: {
        HORIZONTAL: "Horizontal",
        SLOPE: "Slope",
        VERTICAL: "Vertical",
      },
    },
    "zh-cn": {
      label: "运动方向",
      helperText: "选择运动体接近终端缓冲器的方向。",
      options: {
        HORIZONTAL: "水平",
        SLOPE: "斜坡",
        VERTICAL: "垂直",
      },
    },
    de: {
      label: "Bewegungsrichtung",
      helperText: "Wählen Sie, wie sich das bewegte Objekt dem Endanschlag nähert.",
      options: { HORIZONTAL: "Horizontal", SLOPE: "Schräge", VERTICAL: "Vertikal" },
    },
    fr: {
      label: "Orientation du mouvement",
      helperText: "Choisissez comment l'objet en mouvement arrive sur la butée.",
      options: { HORIZONTAL: "Horizontal", SLOPE: "Pente", VERTICAL: "Vertical" },
    },
    it: {
      label: "Orientamento del moto",
      helperText: "Scegli come l'oggetto in movimento raggiunge il fine corsa.",
      options: { HORIZONTAL: "Orizzontale", SLOPE: "Pendenza", VERTICAL: "Verticale" },
    },
  },
  gravityRelation: {
    en: {
      label: "Gravity relation",
      helperText: "Only used when the axis is vertical.",
      options: {
        ASSISTING: "Gravity assisting",
        OPPOSING: "Gravity opposing",
      },
    },
    "zh-cn": {
      label: "重力关系",
      helperText: "仅在垂直工况下使用。",
      options: {
        ASSISTING: "重力同向",
        OPPOSING: "重力反向",
      },
    },
    de: {
      label: "Gravitationsrichtung",
      helperText: "Wird nur bei vertikalen Fällen verwendet.",
      options: { ASSISTING: "Mit der Schwerkraft", OPPOSING: "Gegen die Schwerkraft" },
    },
    fr: {
      label: "Relation à la gravité",
      helperText: "Utilisé uniquement pour les cas verticaux.",
      options: { ASSISTING: "Gravité favorable", OPPOSING: "Gravité opposée" },
    },
    it: {
      label: "Relazione con la gravità",
      helperText: "Usato solo nei casi verticali.",
      options: { ASSISTING: "Gravità favorevole", OPPOSING: "Gravità contraria" },
    },
  },
  loadType: {
    en: {
      label: "Rotary object type",
      helperText: "Choose the closest inertia model.",
      options: {
        OBJECT: "Rotating load",
        LOAD: "Rotating load",
        BEAM_OR_GATE: "Beam or gate",
        TABLE: "Rotary table",
      },
    },
    "zh-cn": {
      label: "旋转对象类型",
      helperText: "选择最接近的惯量模型。",
      options: {
        OBJECT: "旋转负荷",
        LOAD: "旋转负荷",
        BEAM_OR_GATE: "梁体 / 门体",
        TABLE: "旋转工作台",
      },
    },
    de: {
      label: "Typ des rotierenden Körpers",
      helperText: "Wählen Sie das passendste Trägheitsmodell.",
      options: { OBJECT: "Rotierende Last", LOAD: "Rotierende Last", BEAM_OR_GATE: "Balken / Tor", TABLE: "Rundtisch" },
    },
    fr: {
      label: "Type d'objet rotatif",
      helperText: "Choisissez le modèle d'inertie le plus proche.",
      options: { OBJECT: "Charge rotative", LOAD: "Charge rotative", BEAM_OR_GATE: "Poutre / porte", TABLE: "Table rotative" },
    },
    it: {
      label: "Tipo di oggetto rotante",
      helperText: "Scegli il modello di inerzia più vicino.",
      options: { OBJECT: "Carico rotativo", LOAD: "Carico rotativo", BEAM_OR_GATE: "Trave / portella", TABLE: "Tavola rotante" },
    },
  },
};

function localizeField<T extends { key?: string; label?: string }>(field: T, locale: Locale) {
  if (!field.key) {
    return field;
  }

  return {
    ...field,
    label: fieldLabelByLocale[field.key]?.[locale] ?? field.label,
  };
}

export function localizeScenarioCatalog(catalog: ScenarioCatalog, locale: Locale) {
  const localeKey = locale === "zh-cn" ? "zh-cn" : "en";

  return {
    ...catalog,
    entries: catalog.entries.map((entry) => ({
      ...entry,
      name: entryCopy[entry.key]?.[localeKey]?.name ?? entry.name,
      description: entryCopy[entry.key]?.[localeKey]?.description ?? entry.description,
    })),
    families: catalog.families.map((family) => ({
      ...family,
      name: familyCopy[family.key]?.[localeKey]?.name ?? family.name,
      description: familyCopy[family.key]?.[localeKey]?.description ?? family.description,
      guideQuestions: family.guideQuestions.map((question) => ({
        ...question,
        label: guideQuestionCopy[question.key]?.[localeKey]?.label ?? question.label,
        helperText:
          guideQuestionCopy[question.key]?.[localeKey]?.helperText ?? question.helperText,
        options: question.options.map((option) => ({
          ...option,
          label:
            guideQuestionCopy[question.key]?.[localeKey]?.options[option.value] ?? option.label,
        })),
      })),
    })),
    variants: catalog.variants.map((variant) => ({
      ...variant,
      name: variantNameByLocale[variant.key]?.[localeKey] ?? variant.name,
      inputSchemaJson: {
        ...variant.inputSchemaJson,
        fields: Array.isArray(variant.inputSchemaJson.fields)
          ? variant.inputSchemaJson.fields.map((field) => localizeField(field, locale))
          : variant.inputSchemaJson.fields,
      },
    })),
  };
}
