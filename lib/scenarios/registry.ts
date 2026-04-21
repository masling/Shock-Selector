import {
  scenarioCatalogQuerySchema,
  type GravityRelationValue,
  type LoadTypeValue,
  type MotionKindValue,
  type OrientationValue,
  type ScenarioEntryKey,
  type ScenarioFamilyKey,
} from "@/lib/scenarios/schemas";

type ScenarioGuideQuestion = {
  key: string;
  label: string;
  helperText: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

export type ScenarioEntryDefinition = {
  key: ScenarioEntryKey;
  name: string;
  description: string;
  motionKind: MotionKindValue;
  familyKeys: ScenarioFamilyKey[];
};

export type ScenarioFamilyDefinition = {
  key: ScenarioFamilyKey;
  name: string;
  description: string;
  entryKey: ScenarioEntryKey;
  motionKind: MotionKindValue;
  sortOrder: number;
  guideQuestions: ScenarioGuideQuestion[];
};

export type ScenarioVariantDefinition = {
  key: string;
  familyKey: ScenarioFamilyKey;
  entryKey: ScenarioEntryKey;
  name: string;
  motionKind: MotionKindValue;
  orientation: OrientationValue;
  driveType: "FREE" | "FORCE" | "MOTOR" | "CYLINDER";
  loadType: LoadTypeValue | null;
  gravityRelation: GravityRelationValue;
  isImplemented: boolean;
  sortOrder: number;
  inputSchemaJson: Record<string, unknown>;
  outputSchemaJson: Record<string, unknown>;
  formulaMetaJson: Record<string, unknown>;
};

function numberField(
  key: string,
  label: string,
  unit: string,
  extra?: Record<string, unknown>,
) {
  return {
    key,
    type: "number",
    label,
    unit,
    required: true,
    ...extra,
  };
}

function createLinearInputSchema(extraFields: Array<Record<string, unknown>>) {
  return {
    version: 1,
    fields: [
      numberField("movingMassKg", "Moving mass", "kg"),
      numberField("velocityMs", "Impact velocity", "m/s"),
      numberField("strokeMm", "Available stroke", "mm"),
      ...extraFields,
    ],
  };
}

function createRotaryInputSchema(extraFields: Array<Record<string, unknown>>) {
  return {
    version: 1,
    fields: [
      numberField("angularSpeedRpm", "Angular speed", "rpm"),
      numberField("leverArmMm", "Lever arm", "mm"),
      numberField("stopAngleDeg", "Stop angle", "deg"),
      ...extraFields,
    ],
  };
}

function createCommonOutputSchema() {
  return {
    version: 1,
    fields: [
      { key: "absorbedEnergyNm", label: "Absorbed energy", unit: "Nm" },
      { key: "averageImpactForceN", label: "Average impact force", unit: "N" },
      { key: "recommendedFamilyKey", label: "Recommended family" },
    ],
  };
}

const scenarioEntries: ScenarioEntryDefinition[] = [
  {
    key: "linear_free_motion",
    name: "Linear Motion · Free Motion",
    description: "For horizontal sliding, slope travel and vertical free-fall cases without an active drive source.",
    motionKind: "LINEAR",
    familyKeys: ["linear_free_motion"],
  },
  {
    key: "linear_force_driven",
    name: "Linear Motion · Force Driven",
    description: "For external-force-driven linear motion where pushing force contributes to the impact energy.",
    motionKind: "LINEAR",
    familyKeys: ["linear_force_driven"],
  },
  {
    key: "linear_motor_driven",
    name: "Linear Motion · Motor Driven",
    description: "For servo or motor-driven axes where power and deceleration stroke determine absorber sizing.",
    motionKind: "LINEAR",
    familyKeys: ["linear_motor_driven"],
  },
  {
    key: "linear_cylinder_driven",
    name: "Linear Motion · Cylinder Driven",
    description: "For pneumatic cylinder axes with thrust-based stopping energy and vertical gravity corrections.",
    motionKind: "LINEAR",
    familyKeys: ["linear_cylinder_driven"],
  },
  {
    key: "rotary_motion",
    name: "Rotary Motion",
    description: "For rotating loads, beams, gates and rotary tables routed by load model and gravity direction.",
    motionKind: "ROTARY",
    familyKeys: ["rotary_load", "rotary_beam_or_gate", "rotary_table"],
  },
];

const scenarioFamilies: ScenarioFamilyDefinition[] = [
  {
    key: "linear_free_motion",
    name: "Linear Free Motion",
    description: "Shared calculator family for horizontal, slope and vertical drop cases.",
    entryKey: "linear_free_motion",
    motionKind: "LINEAR",
    sortOrder: 1,
    guideQuestions: [
      {
        key: "orientation",
        label: "Motion orientation",
        helperText: "Choose how the moving object approaches the end stop.",
        options: [
          { value: "HORIZONTAL", label: "Horizontal" },
          { value: "SLOPE", label: "Slope" },
          { value: "VERTICAL", label: "Vertical drop" },
        ],
      },
    ],
  },
  {
    key: "linear_force_driven",
    name: "Linear Force Driven",
    description: "Shared calculator family for horizontal and vertical externally driven motion.",
    entryKey: "linear_force_driven",
    motionKind: "LINEAR",
    sortOrder: 2,
    guideQuestions: [
      {
        key: "orientation",
        label: "Motion orientation",
        helperText: "Vertical cases add a gravity-direction follow-up.",
        options: [
          { value: "HORIZONTAL", label: "Horizontal" },
          { value: "VERTICAL", label: "Vertical" },
        ],
      },
      {
        key: "gravityRelation",
        label: "Gravity relation",
        helperText: "Only used when the axis is vertical.",
        options: [
          { value: "ASSISTING", label: "Gravity assisting" },
          { value: "OPPOSING", label: "Gravity opposing" },
        ],
      },
    ],
  },
  {
    key: "linear_motor_driven",
    name: "Linear Motor Driven",
    description: "Shared calculator family for motorized horizontal and vertical axes.",
    entryKey: "linear_motor_driven",
    motionKind: "LINEAR",
    sortOrder: 3,
    guideQuestions: [
      {
        key: "orientation",
        label: "Motion orientation",
        helperText: "Motor-driven vertical axes need gravity direction for routing.",
        options: [
          { value: "HORIZONTAL", label: "Horizontal" },
          { value: "VERTICAL", label: "Vertical" },
        ],
      },
      {
        key: "gravityRelation",
        label: "Gravity relation",
        helperText: "Only used when the axis is vertical.",
        options: [
          { value: "ASSISTING", label: "Gravity assisting" },
          { value: "OPPOSING", label: "Gravity opposing" },
        ],
      },
    ],
  },
  {
    key: "linear_cylinder_driven",
    name: "Linear Cylinder Driven",
    description: "Shared calculator family for pneumatic cylinder stopping cases.",
    entryKey: "linear_cylinder_driven",
    motionKind: "LINEAR",
    sortOrder: 4,
    guideQuestions: [
      {
        key: "orientation",
        label: "Motion orientation",
        helperText: "Cylinder-driven vertical axes add a gravity relation question.",
        options: [
          { value: "HORIZONTAL", label: "Horizontal" },
          { value: "VERTICAL", label: "Vertical" },
        ],
      },
      {
        key: "gravityRelation",
        label: "Gravity relation",
        helperText: "Only used when the axis is vertical.",
        options: [
          { value: "ASSISTING", label: "Gravity assisting" },
          { value: "OPPOSING", label: "Gravity opposing" },
        ],
      },
    ],
  },
  {
    key: "rotary_load",
    name: "Rotary Load",
    description: "Rotating load as the main inertia model, with vertical gravity variants.",
    entryKey: "rotary_motion",
    motionKind: "ROTARY",
    sortOrder: 5,
    guideQuestions: [
      {
        key: "loadType",
        label: "Rotary object type",
        helperText: "Use this family when the load itself is the rotating body.",
        options: [{ value: "LOAD", label: "Load" }],
      },
      {
        key: "orientation",
        label: "Rotation orientation",
        helperText: "Vertical rotation adds a gravity direction question.",
        options: [
          { value: "HORIZONTAL", label: "Horizontal" },
          { value: "VERTICAL", label: "Vertical" },
        ],
      },
      {
        key: "gravityRelation",
        label: "Gravity relation",
        helperText: "Only used when the load rotates in a vertical plane.",
        options: [
          { value: "ASSISTING", label: "Gravity assisting" },
          { value: "OPPOSING", label: "Gravity opposing" },
        ],
      },
    ],
  },
  {
    key: "rotary_beam_or_gate",
    name: "Rotary Beam Or Gate",
    description: "Rotating beam or gate inertia model with gravity torque variants.",
    entryKey: "rotary_motion",
    motionKind: "ROTARY",
    sortOrder: 6,
    guideQuestions: [
      {
        key: "loadType",
        label: "Rotary object type",
        helperText: "Use this family for beam, flap, arm or gate-style bodies.",
        options: [{ value: "BEAM_OR_GATE", label: "Beam or gate" }],
      },
      {
        key: "orientation",
        label: "Rotation orientation",
        helperText: "Vertical rotation adds a gravity direction question.",
        options: [
          { value: "HORIZONTAL", label: "Horizontal" },
          { value: "VERTICAL", label: "Vertical" },
        ],
      },
      {
        key: "gravityRelation",
        label: "Gravity relation",
        helperText: "Only used when the body rotates in a vertical plane.",
        options: [
          { value: "ASSISTING", label: "Gravity assisting" },
          { value: "OPPOSING", label: "Gravity opposing" },
        ],
      },
    ],
  },
  {
    key: "rotary_table",
    name: "Rotary Table",
    description: "Dedicated calculator family for rotary tables and turntable-like structures.",
    entryKey: "rotary_motion",
    motionKind: "ROTARY",
    sortOrder: 7,
    guideQuestions: [
      {
        key: "loadType",
        label: "Rotary object type",
        helperText: "This family is reserved for table and worktable models.",
        options: [{ value: "TABLE", label: "Table" }],
      },
      {
        key: "orientation",
        label: "Rotation orientation",
        helperText: "The MVP covers horizontal rotary tables first.",
        options: [{ value: "HORIZONTAL", label: "Horizontal" }],
      },
    ],
  },
];

const scenarioVariants: ScenarioVariantDefinition[] = [
  {
    key: "linear-free-horizontal",
    familyKey: "linear_free_motion",
    entryKey: "linear_free_motion",
    name: "Linear Free Motion · Horizontal",
    motionKind: "LINEAR",
    orientation: "HORIZONTAL",
    driveType: "FREE",
    loadType: "OBJECT",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 1,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_free_motion",
      variantKey: "linear-free-horizontal",
      excelVariantGroup: "horizontal free motion",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "linear-free-slope",
    familyKey: "linear_free_motion",
    entryKey: "linear_free_motion",
    name: "Linear Free Motion · Slope",
    motionKind: "LINEAR",
    orientation: "SLOPE",
    driveType: "FREE",
    loadType: "OBJECT",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 2,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("heightM", "Height", "m"),
        numberField("slopeAngleDeg", "Slope angle", "deg"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_free_motion",
      variantKey: "linear-free-slope",
      excelVariantGroup: "slope free motion",
      criticalStrokeM: 0.075,
    },
  },
  {
    key: "linear-free-vertical-drop",
    familyKey: "linear_free_motion",
    entryKey: "linear_free_motion",
    name: "Linear Free Motion · Vertical Drop",
    motionKind: "LINEAR",
    orientation: "VERTICAL",
    driveType: "FREE",
    loadType: "OBJECT",
    gravityRelation: "ASSISTING",
    isImplemented: true,
    sortOrder: 3,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("heightM", "Height", "m"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_free_motion",
      variantKey: "linear-free-vertical-drop",
      excelVariantGroup: "vertical free drop",
      criticalStrokeM: 0.15,
    },
  },
  {
    key: "linear-force-horizontal",
    familyKey: "linear_force_driven",
    entryKey: "linear_force_driven",
    name: "Linear Force Driven · Horizontal",
    motionKind: "LINEAR",
    orientation: "HORIZONTAL",
    driveType: "FORCE",
    loadType: "OBJECT",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 1,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("pushForceN", "Push force", "N"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_force_driven",
      variantKey: "linear-force-horizontal",
      excelVariantGroup: "horizontal force driven",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "linear-force-vertical-assisting",
    familyKey: "linear_force_driven",
    entryKey: "linear_force_driven",
    name: "Linear Force Driven · Vertical Assisting",
    motionKind: "LINEAR",
    orientation: "VERTICAL",
    driveType: "FORCE",
    loadType: "OBJECT",
    gravityRelation: "ASSISTING",
    isImplemented: true,
    sortOrder: 2,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("pushForceN", "Push force", "N"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_force_driven",
      variantKey: "linear-force-vertical-assisting",
      excelVariantGroup: "vertical force driven assisting gravity",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "linear-force-vertical-opposing",
    familyKey: "linear_force_driven",
    entryKey: "linear_force_driven",
    name: "Linear Force Driven · Vertical Opposing",
    motionKind: "LINEAR",
    orientation: "VERTICAL",
    driveType: "FORCE",
    loadType: "OBJECT",
    gravityRelation: "OPPOSING",
    isImplemented: true,
    sortOrder: 3,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("pushForceN", "Push force", "N"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_force_driven",
      variantKey: "linear-force-vertical-opposing",
      excelVariantGroup: "vertical force driven opposing gravity",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "linear-motor-horizontal",
    familyKey: "linear_motor_driven",
    entryKey: "linear_motor_driven",
    name: "Linear Motor Driven · Horizontal",
    motionKind: "LINEAR",
    orientation: "HORIZONTAL",
    driveType: "MOTOR",
    loadType: "OBJECT",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 1,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("motorPowerKw", "Motor power", "kW"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_motor_driven",
      variantKey: "linear-motor-horizontal",
      excelVariantGroup: "horizontal motor driven",
      criticalStrokeM: 0.3,
    },
  },
  {
    key: "linear-motor-vertical-assisting",
    familyKey: "linear_motor_driven",
    entryKey: "linear_motor_driven",
    name: "Linear Motor Driven · Vertical Assisting",
    motionKind: "LINEAR",
    orientation: "VERTICAL",
    driveType: "MOTOR",
    loadType: "OBJECT",
    gravityRelation: "ASSISTING",
    isImplemented: true,
    sortOrder: 2,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("motorPowerKw", "Motor power", "kW"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_motor_driven",
      variantKey: "linear-motor-vertical-assisting",
      excelVariantGroup: "vertical motor driven assisting gravity",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "linear-motor-vertical-opposing",
    familyKey: "linear_motor_driven",
    entryKey: "linear_motor_driven",
    name: "Linear Motor Driven · Vertical Opposing",
    motionKind: "LINEAR",
    orientation: "VERTICAL",
    driveType: "MOTOR",
    loadType: "OBJECT",
    gravityRelation: "OPPOSING",
    isImplemented: true,
    sortOrder: 3,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("motorPowerKw", "Motor power", "kW"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_motor_driven",
      variantKey: "linear-motor-vertical-opposing",
      excelVariantGroup: "vertical motor driven opposing gravity",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "linear-cylinder-horizontal",
    familyKey: "linear_cylinder_driven",
    entryKey: "linear_cylinder_driven",
    name: "Linear Cylinder Driven · Horizontal",
    motionKind: "LINEAR",
    orientation: "HORIZONTAL",
    driveType: "CYLINDER",
    loadType: "OBJECT",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 1,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("propulsionCylinderCount", "Propulsion cylinder count", "pcs", { required: false }),
        numberField("cylinderInnerDiameterMm", "Cylinder inner diameter", "mm"),
        numberField("cylinderWorkPressureBar", "Cylinder work pressure", "bar"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_cylinder_driven",
      variantKey: "linear-cylinder-horizontal",
      excelVariantGroup: "horizontal cylinder driven",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "linear-cylinder-vertical-assisting",
    familyKey: "linear_cylinder_driven",
    entryKey: "linear_cylinder_driven",
    name: "Linear Cylinder Driven · Vertical Assisting",
    motionKind: "LINEAR",
    orientation: "VERTICAL",
    driveType: "CYLINDER",
    loadType: "OBJECT",
    gravityRelation: "ASSISTING",
    isImplemented: true,
    sortOrder: 2,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("propulsionCylinderCount", "Propulsion cylinder count", "pcs", { required: false }),
        numberField("cylinderInnerDiameterMm", "Cylinder inner diameter", "mm"),
        numberField("cylinderWorkPressureBar", "Cylinder work pressure", "bar"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_cylinder_driven",
      variantKey: "linear-cylinder-vertical-assisting",
      excelVariantGroup: "vertical cylinder driven assisting gravity",
      criticalStrokeM: 0.1,
    },
  },
  {
    key: "linear-cylinder-vertical-opposing",
    familyKey: "linear_cylinder_driven",
    entryKey: "linear_cylinder_driven",
    name: "Linear Cylinder Driven · Vertical Opposing",
    motionKind: "LINEAR",
    orientation: "VERTICAL",
    driveType: "CYLINDER",
    loadType: "OBJECT",
    gravityRelation: "OPPOSING",
    isImplemented: true,
    sortOrder: 3,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("impactObjectWeightKg", "Impact object weight", "kg"),
        numberField("speedMs", "Speed", "m/s"),
        numberField("propulsionCylinderCount", "Propulsion cylinder count", "pcs", { required: false }),
        numberField("cylinderInnerDiameterMm", "Cylinder inner diameter", "mm"),
        numberField("cylinderWorkPressureBar", "Cylinder work pressure", "bar"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "linear_cylinder_driven",
      variantKey: "linear-cylinder-vertical-opposing",
      excelVariantGroup: "vertical cylinder driven opposing gravity",
      criticalStrokeM: 0.125,
    },
  },
  {
    key: "rotary-horizontal-load",
    familyKey: "rotary_load",
    entryKey: "rotary_motion",
    name: "Rotary Load · Horizontal",
    motionKind: "ROTARY",
    orientation: "HORIZONTAL",
    driveType: "FREE",
    loadType: "LOAD",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 1,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("loadWeightKg", "Load weight", "kg"),
        numberField("rotationRadiusM", "Rotation radius", "m"),
        numberField("angularSpeedRadS", "Angular speed", "rad/s"),
        numberField("torqueNm", "Torque", "Nm"),
        numberField("installationRadiusM", "Installation radius", "m"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "rotary_load",
      variantKey: "rotary-horizontal-load",
      excelVariantGroup: "horizontal rotary load",
      criticalStrokeM: 0.0125,
    },
  },
  {
    key: "rotary-vertical-load-assisting",
    familyKey: "rotary_load",
    entryKey: "rotary_motion",
    name: "Rotary Load · Vertical Assisting",
    motionKind: "ROTARY",
    orientation: "VERTICAL",
    driveType: "FREE",
    loadType: "LOAD",
    gravityRelation: "ASSISTING",
    isImplemented: true,
    sortOrder: 2,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("loadWeightKg", "Load weight", "kg"),
        numberField("rotationRadiusM", "Rotation radius", "m"),
        numberField("angularSpeedRadS", "Angular speed", "rad/s"),
        numberField("torqueNm", "Torque", "Nm"),
        numberField("installationRadiusM", "Installation radius", "m"),
        numberField("rotationAngleDeg", "Rotation angle", "deg"),
        numberField("startAngleFromVerticalDeg", "Start angle from vertical", "deg"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "rotary_load",
      variantKey: "rotary-vertical-load-assisting",
      excelVariantGroup: "vertical rotary load assisting gravity",
      criticalStrokeM: 0.025,
    },
  },
  {
    key: "rotary-vertical-load-opposing",
    familyKey: "rotary_load",
    entryKey: "rotary_motion",
    name: "Rotary Load · Vertical Opposing",
    motionKind: "ROTARY",
    orientation: "VERTICAL",
    driveType: "FREE",
    loadType: "LOAD",
    gravityRelation: "OPPOSING",
    isImplemented: true,
    sortOrder: 3,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("loadWeightKg", "Load weight", "kg"),
        numberField("rotationRadiusM", "Rotation radius", "m"),
        numberField("angularSpeedRadS", "Angular speed", "rad/s"),
        numberField("torqueNm", "Torque", "Nm"),
        numberField("installationRadiusM", "Installation radius", "m"),
        numberField("rotationAngleDeg", "Rotation angle", "deg"),
        numberField("startAngleFromVerticalDeg", "Start angle from vertical", "deg"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "rotary_load",
      variantKey: "rotary-vertical-load-opposing",
      excelVariantGroup: "vertical rotary load opposing gravity",
      criticalStrokeM: 0.025,
    },
  },
  {
    key: "rotary-horizontal-beam-or-gate",
    familyKey: "rotary_beam_or_gate",
    entryKey: "rotary_motion",
    name: "Rotary Beam Or Gate · Horizontal",
    motionKind: "ROTARY",
    orientation: "HORIZONTAL",
    driveType: "FREE",
    loadType: "BEAM_OR_GATE",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 1,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("beamWeightKg", "Beam weight", "kg"),
        numberField("beamLengthM", "Length", "m"),
        numberField("beamThicknessM", "Thickness", "m"),
        numberField("angularSpeedRadS", "Angular speed", "rad/s"),
        numberField("torqueNm", "Torque", "Nm"),
        numberField("installationRadiusM", "Installation radius", "m"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "rotary_beam_or_gate",
      variantKey: "rotary-horizontal-beam-or-gate",
      excelVariantGroup: "horizontal rotary beam or gate",
      criticalStrokeM: 0.025,
    },
  },
  {
    key: "rotary-vertical-beam-or-gate-assisting",
    familyKey: "rotary_beam_or_gate",
    entryKey: "rotary_motion",
    name: "Rotary Beam Or Gate · Vertical Assisting",
    motionKind: "ROTARY",
    orientation: "VERTICAL",
    driveType: "FREE",
    loadType: "BEAM_OR_GATE",
    gravityRelation: "ASSISTING",
    isImplemented: true,
    sortOrder: 2,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("gateWeightKg", "Gate weight", "kg"),
        numberField("gateWidthM", "Width", "m"),
        numberField("gateThicknessM", "Thickness", "m"),
        numberField("angularSpeedRadS", "Angular speed", "rad/s"),
        numberField("torqueNm", "Torque", "Nm"),
        numberField("installationRadiusM", "Installation radius", "m"),
        numberField("rotationAngleDeg", "Rotation angle", "deg"),
        numberField("startAngleFromVerticalDeg", "Start angle from vertical", "deg"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "rotary_beam_or_gate",
      variantKey: "rotary-vertical-beam-or-gate-assisting",
      excelVariantGroup: "vertical rotary beam or gate assisting gravity",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "rotary-vertical-beam-or-gate-opposing",
    familyKey: "rotary_beam_or_gate",
    entryKey: "rotary_motion",
    name: "Rotary Beam Or Gate · Vertical Opposing",
    motionKind: "ROTARY",
    orientation: "VERTICAL",
    driveType: "FREE",
    loadType: "BEAM_OR_GATE",
    gravityRelation: "OPPOSING",
    isImplemented: true,
    sortOrder: 3,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("gateWeightKg", "Gate weight", "kg"),
        numberField("gateWidthM", "Width", "m"),
        numberField("gateThicknessM", "Thickness", "m"),
        numberField("angularSpeedRadS", "Angular speed", "rad/s"),
        numberField("torqueNm", "Torque", "Nm"),
        numberField("installationRadiusM", "Installation radius", "m"),
        numberField("rotationAngleDeg", "Rotation angle", "deg"),
        numberField("startAngleFromVerticalDeg", "Start angle from vertical", "deg"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "rotary_beam_or_gate",
      variantKey: "rotary-vertical-beam-or-gate-opposing",
      excelVariantGroup: "vertical rotary beam or gate opposing gravity",
      criticalStrokeM: 0.05,
    },
  },
  {
    key: "rotary-horizontal-table",
    familyKey: "rotary_table",
    entryKey: "rotary_motion",
    name: "Rotary Table · Horizontal",
    motionKind: "ROTARY",
    orientation: "HORIZONTAL",
    driveType: "FREE",
    loadType: "TABLE",
    gravityRelation: "NONE",
    isImplemented: true,
    sortOrder: 1,
    inputSchemaJson: {
      version: 1,
      fields: [
        numberField("absorberCount", "Absorber count", "pcs", { required: false }),
        numberField("cyclesPerHour", "Cycles per hour", "cph", { required: false }),
        numberField("tableWeightKg", "Table weight", "kg"),
        numberField("loadWeightW1Kg", "Load weight (W1)", "kg"),
        numberField("rotationRadiusM", "Rotation radius", "m"),
        numberField("tableDiameterM", "Table diameter", "m"),
        numberField("angularSpeedRadS", "Angular speed", "rad/s"),
        numberField("torqueNm", "Torque", "Nm"),
        numberField("installationRadiusM", "Installation radius", "m"),
      ],
    },
    outputSchemaJson: createCommonOutputSchema(),
    formulaMetaJson: {
      calculatorFamily: "rotary_table",
      variantKey: "rotary-horizontal-table",
      excelVariantGroup: "horizontal rotary table",
      criticalStrokeM: 0.016,
    },
  },
];

export function getScenarioEntries() {
  return scenarioEntries.map((entry) => ({
    ...entry,
    familyCount: entry.familyKeys.length,
    implementedVariantCount: scenarioVariants.filter(
      (variant) => variant.entryKey === entry.key && variant.isImplemented,
    ).length,
    totalVariantCount: scenarioVariants.filter((variant) => variant.entryKey === entry.key).length,
  }));
}

export function getScenarioCatalog(rawInput?: unknown) {
  const input = scenarioCatalogQuerySchema.parse(rawInput ?? {});

  const families = scenarioFamilies.filter((family) => {
    if (input.entryKey && family.entryKey !== input.entryKey) {
      return false;
    }

    if (input.familyKey && family.key !== input.familyKey) {
      return false;
    }

    if (input.motionKind && family.motionKind !== input.motionKind) {
      return false;
    }

    return true;
  });

  const allowedFamilyKeys = new Set(families.map((family) => family.key));

  const variants = scenarioVariants.filter((variant) => {
    if (!allowedFamilyKeys.has(variant.familyKey)) {
      return false;
    }

    if (input.implementedOnly && !variant.isImplemented) {
      return false;
    }

    return true;
  });

  const allowedEntryKeys = new Set(families.map((family) => family.entryKey));
  const entries = getScenarioEntries().filter((entry) => allowedEntryKeys.has(entry.key));

  return {
    filters: input,
    entries,
    families,
    variants,
    counts: {
      entries: entries.length,
      families: families.length,
      variants: variants.length,
      implementedVariants: variants.filter((variant) => variant.isImplemented).length,
    },
  };
}

export function getScenarioFamily(key: ScenarioFamilyDefinition["key"]) {
  return scenarioFamilies.find((family) => family.key === key) ?? null;
}

export function getScenarioVariant(key: string) {
  return scenarioVariants.find((variant) => variant.key === key) ?? null;
}
