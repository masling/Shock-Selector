export type KnowledgeCategory = {
  slug: string;
  title: string;
  description: string;
  intent: string;
};

export type KnowledgeArticle = {
  slug: string;
  categorySlug: string;
  title: string;
  shortTitle: string;
  description: string;
  intent: string;
  audience: Array<"engineer" | "buyer">;
  questions: string[];
  directAnswer: string;
  requiredInputs: string[];
  formulas: Array<{
    name: string;
    formula: string;
    unit: string;
    explanation: string;
  }>;
  steps: Array<{
    name: string;
    text: string;
  }>;
  commonMistakes: string[];
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
  sourceNotes: string[];
};

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    slug: "calculations",
    title: "Shock Absorber Calculations",
    description:
      "PDF-backed sizing questions that can be answered now using application data, energy checks and catalog rating logic.",
    intent: "engineering_calculation",
  },
  {
    slug: "selection-guides",
    title: "Selection Guides",
    description:
      "Guides for narrowing product families by motion type, drive source and installation constraints.",
    intent: "selection_guidance",
  },
  {
    slug: "applications",
    title: "Application Notes",
    description:
      "Application-led guidance for conveyors, packaging machines, rotary tables, cylinders and heavy equipment.",
    intent: "application_research",
  },
  {
    slug: "replacement-cross-reference",
    title: "Replacement & Cross Reference",
    description:
      "Content for buyers replacing existing industrial shock absorbers or comparing alternatives to known brands.",
    intent: "replacement_inquiry",
  },
  {
    slug: "installation-troubleshooting",
    title: "Installation & Troubleshooting",
    description:
      "Installation checks, failure symptoms and field issues such as side load, bottoming out, oil leakage and overheating.",
    intent: "technical_support",
  },
  {
    slug: "buyer-faq",
    title: "Buyer FAQ",
    description:
      "Procurement-oriented answers for RFQs, samples, lead time, customization, CAD, datasheets and export supply.",
    intent: "buyer_procurement",
  },
];

export const calculationArticles: KnowledgeArticle[] = [
  {
    slug: "what-data-is-needed-for-shock-absorber-calculation",
    categorySlug: "calculations",
    title: "What Data Is Needed for Industrial Shock Absorber Calculation?",
    shortTitle: "Required Calculation Data",
    description:
      "A practical checklist of the application data needed before sizing an industrial shock absorber.",
    intent: "pre_calculation_requirements",
    audience: ["engineer", "buyer"],
    questions: [
      "What data is needed to select an industrial shock absorber?",
      "What information should I send for a shock absorber RFQ?",
      "What application data is required for heavy duty buffer selection?",
    ],
    directAnswer:
      "At minimum, collect motion direction, moving weight, impact velocity, available stroke, drive or thrust force if present, cycles per hour, and temperature or environmental constraints. Heavy-duty custom-orifice buffers also need mounting method and any safety or corrosion requirements.",
    requiredInputs: [
      "motionDirection",
      "movingMassKg",
      "impactVelocityMps",
      "availableStrokeMm",
      "driveForceN",
      "cyclesPerHour",
      "temperatureEnvironment",
      "mountingMethod",
    ],
    formulas: [],
    steps: [
      {
        name: "Define the motion",
        text: "Identify whether the motion is horizontal, vertical, inclined or rotary, because gravity and inertia are handled differently.",
      },
      {
        name: "Collect the stopping values",
        text: "Record moving weight, impact velocity, available absorber stroke and any drive force that continues pushing into the stop.",
      },
      {
        name: "Check duty and environment",
        text: "Record cycles per hour, ambient temperature, corrosive exposure, side load risk and mounting constraints before selecting the product family.",
      },
    ],
    commonMistakes: [
      "Using catalog stroke without confirming actual usable machine stroke.",
      "Ignoring a pneumatic cylinder or motor force that continues to push during deceleration.",
      "Sizing only by energy per cycle and forgetting energy per hour.",
    ],
    relatedLinks: [
      { label: "Open the engineer sizing tool", href: "/selector/engineer" },
      { label: "Send application data for review", href: "/contact" },
    ],
    sourceNotes: [
      "The full product catalog p.39 and p.50 list required application data for EI/ED heavy-duty buffers: vertical or horizontal motion, weight, impact velocity, thrust force when needed, cycles per hour, temperature/environment and safety conditions.",
    ],
  },
  {
    slug: "how-to-calculate-impact-energy-for-shock-absorber",
    categorySlug: "calculations",
    title: "How to Calculate Impact Energy for an Industrial Shock Absorber",
    shortTitle: "Impact Energy",
    description:
      "Use moving mass and impact velocity to estimate the kinetic energy that the absorber must handle per cycle.",
    intent: "impact_energy_calculation",
    audience: ["engineer"],
    questions: [
      "How do I calculate shock absorber impact energy?",
      "What is energy per cycle for an industrial shock absorber?",
      "How do mass and velocity affect shock absorber size?",
    ],
    directAnswer:
      "For a moving mass, the base impact energy is kinetic energy: E = 1/2 x m x v^2. If gravity or an external drive force continues acting during the stopping stroke, add or subtract that work before comparing the result with the absorber energy-per-cycle rating.",
    requiredInputs: [
      "movingMassKg",
      "impactVelocityMps",
      "availableStrokeMm",
      "driveForceN",
      "gravityRelation",
    ],
    formulas: [
      {
        name: "Kinetic energy",
        formula: "E = 1/2 x m x v^2",
        unit: "N m",
        explanation:
          "m is moving mass in kg and v is impact velocity in m/s. The result is the base energy to absorb per impact.",
      },
      {
        name: "External-force work",
        formula: "W = F x s",
        unit: "N m",
        explanation:
          "F is drive force in N and s is stopping stroke in m. Add this when the drive keeps pushing into the stop.",
      },
    ],
    steps: [
      {
        name: "Calculate base kinetic energy",
        text: "Use moving mass and impact velocity to calculate the energy carried by the moving object.",
      },
      {
        name: "Add drive or gravity work",
        text: "Add pneumatic, motor, external-force or gravity work when those forces assist the impact.",
      },
      {
        name: "Compare with catalog energy rating",
        text: "Select a model whose energy-per-cycle capacity is above the calculated requirement with margin.",
      },
    ],
    commonMistakes: [
      "Treating weight and mass as the same unit.",
      "Using average speed instead of impact speed at the stop.",
      "Forgetting that velocity is squared, so a small speed increase can require a much larger absorber.",
    ],
    relatedLinks: [
      { label: "Calculate a motion case", href: "/selector/engineer" },
      { label: "Read required data checklist", href: "/knowledge-center/calculations/what-data-is-needed-for-shock-absorber-calculation" },
    ],
    sourceNotes: [
      "The full product catalog tables use energy per cycle (Nm/C) as a primary product rating across EK, EN, EI and ED families.",
    ],
  },
  {
    slug: "how-to-check-energy-per-hour-for-shock-absorber",
    categorySlug: "calculations",
    title: "How to Check Energy per Hour for Shock Absorber Selection",
    shortTitle: "Energy per Hour",
    description:
      "Why the same absorber can pass single-impact energy but fail under high cycle frequency.",
    intent: "energy_per_hour_calculation",
    audience: ["engineer", "buyer"],
    questions: [
      "How do I calculate energy per hour for a shock absorber?",
      "Why does cycle rate matter for shock absorber selection?",
      "Can a shock absorber pass energy per cycle but fail in continuous operation?",
    ],
    directAnswer:
      "Energy per hour is the calculated energy per cycle multiplied by the number of impacts per hour. The selected model must satisfy both energy per cycle and energy per hour ratings, because repeated impacts create heat and duty-cycle limits.",
    requiredInputs: [
      "energyPerCycleNm",
      "cyclesPerHour",
      "ambientTemperature",
      "coolingCondition",
    ],
    formulas: [
      {
        name: "Energy per hour",
        formula: "ETC = E x cyclesPerHour",
        unit: "N m/h",
        explanation:
          "E is absorbed energy per cycle. ETC is the hourly energy load that must stay within the catalog rating.",
      },
    ],
    steps: [
      {
        name: "Calculate energy per cycle",
        text: "Start with the total stopping energy required for one impact.",
      },
      {
        name: "Multiply by cycle rate",
        text: "Multiply by the expected number of impacts per hour under normal operation.",
      },
      {
        name: "Check heat-duty capacity",
        text: "Compare the result with the catalog energy-per-hour rating, then review high-frequency families when needed.",
      },
    ],
    commonMistakes: [
      "Selecting only by maximum energy per impact.",
      "Using ideal cycle rate instead of maximum production cycle rate.",
      "Ignoring hot environments that reduce thermal margin.",
    ],
    relatedLinks: [
      { label: "High-cycle shock absorber families", href: "/products/super-long-life-shock-absorbers" },
      { label: "Open buyer quick filter", href: "/selector/buyer" },
    ],
    sourceNotes: [
      "The full product catalog tables list both maximum energy per cycle (ET) and energy per hour (ETC), which makes this an answerable calculation topic.",
    ],
  },
  {
    slug: "how-to-calculate-average-impact-force",
    categorySlug: "calculations",
    title: "How to Estimate Average Impact Force from Energy and Stroke",
    shortTitle: "Average Impact Force",
    description:
      "A simple way to estimate average stopping force before checking catalog force limits.",
    intent: "impact_force_calculation",
    audience: ["engineer"],
    questions: [
      "How do I calculate average impact force for a shock absorber?",
      "How does shock absorber stroke affect impact force?",
      "Why does a longer stroke reduce stopping force?",
    ],
    directAnswer:
      "Average stopping force can be estimated by dividing total absorbed energy by stopping stroke in meters. This is an average value; actual peak force depends on damping design, adjustment setting, velocity and product family.",
    requiredInputs: [
      "totalEnergyNm",
      "availableStrokeMm",
      "productFamily",
      "impactVelocityMps",
    ],
    formulas: [
      {
        name: "Average impact force",
        formula: "Favg = E / s",
        unit: "N",
        explanation:
          "E is total absorbed energy in N m and s is stopping stroke in meters.",
      },
    ],
    steps: [
      {
        name: "Calculate total energy",
        text: "Include kinetic, drive-force and gravity components where relevant.",
      },
      {
        name: "Convert stroke to meters",
        text: "Use actual usable absorber stroke, not just available installation space.",
      },
      {
        name: "Compare with force rating",
        text: "Check catalog maximum impact force and review whether the machine frame can handle the load.",
      },
    ],
    commonMistakes: [
      "Using millimeters directly in the formula without converting to meters.",
      "Treating average force as peak force.",
      "Choosing too short a stroke and creating unnecessarily high stopping force.",
    ],
    relatedLinks: [
      { label: "Open guided sizing", href: "/selector/engineer" },
      { label: "Request review for a force-limited application", href: "/contact" },
    ],
    sourceNotes: [
      "The full product catalog tables expose stroke (S), energy per cycle and maximum impact force, allowing a direct explanation of the energy-stroke-force relationship.",
    ],
  },
  {
    slug: "how-to-size-shock-absorber-for-horizontal-motion",
    categorySlug: "calculations",
    title: "How to Size a Shock Absorber for Horizontal Linear Motion",
    shortTitle: "Horizontal Motion",
    description:
      "Calculate a horizontal moving mass by kinetic energy, then add drive force if the actuator continues pushing.",
    intent: "horizontal_motion_sizing",
    audience: ["engineer"],
    questions: [
      "How do I size a shock absorber for horizontal motion?",
      "How do I calculate a shock absorber for a sliding carriage?",
      "How do I choose a shock absorber for a conveyor stop?",
    ],
    directAnswer:
      "For horizontal free motion, start with kinetic energy from mass and impact velocity. If a cylinder, motor or external force continues pushing during the stopping stroke, add F x s to the energy requirement and check energy per cycle, energy per hour, stroke and force ratings.",
    requiredInputs: [
      "movingMassKg",
      "impactVelocityMps",
      "availableStrokeMm",
      "driveForceN",
      "cyclesPerHour",
    ],
    formulas: [
      {
        name: "Horizontal kinetic energy",
        formula: "E = 1/2 x m x v^2",
        unit: "N m",
        explanation: "Base energy for a horizontal load approaching the stop.",
      },
      {
        name: "Drive work during stop",
        formula: "W = F x s",
        unit: "N m",
        explanation: "Add when the actuator continues pushing while the absorber compresses.",
      },
    ],
    steps: [
      {
        name: "Start with free-motion energy",
        text: "Calculate energy from mass and impact velocity.",
      },
      {
        name: "Add actuator contribution",
        text: "For cylinder, motor or force-driven axes, add drive work across the stroke.",
      },
      {
        name: "Filter suitable models",
        text: "Use stroke, energy per cycle, energy per hour and maximum impact force to shortlist models.",
      },
    ],
    commonMistakes: [
      "Ignoring drive force on powered axes.",
      "Using conveyor speed before acceleration instead of actual speed at impact.",
      "Ignoring side load when the stop is not aligned with the motion axis.",
    ],
    relatedLinks: [
      { label: "Horizontal free-motion calculator", href: "/selector/engineer?entryKey=linear_free_motion" },
      { label: "Cylinder-driven sizing", href: "/selector/engineer?entryKey=linear_cylinder_driven" },
    ],
    sourceNotes: [
      "The full product catalog application data asks for horizontal or vertical motion, weight, impact velocity, thrust force if needed and cycles per hour.",
    ],
  },
  {
    slug: "how-to-size-shock-absorber-for-vertical-motion",
    categorySlug: "calculations",
    title: "How to Size a Shock Absorber for Vertical Motion",
    shortTitle: "Vertical Motion",
    description:
      "Add gravity work when the load moves downward into the absorber and subtract it when gravity opposes the stop.",
    intent: "vertical_motion_sizing",
    audience: ["engineer"],
    questions: [
      "How do I size a shock absorber for vertical motion?",
      "How does gravity affect shock absorber calculation?",
      "How do I calculate a shock absorber for a vertical falling load?",
    ],
    directAnswer:
      "Vertical sizing starts with kinetic energy, then adjusts for gravity over the stopping stroke. Gravity assists downward impacts and increases the energy to absorb; gravity opposes upward motion and can reduce the absorbed energy requirement.",
    requiredInputs: [
      "movingMassKg",
      "impactVelocityMps",
      "availableStrokeMm",
      "gravityRelation",
      "cyclesPerHour",
    ],
    formulas: [
      {
        name: "Gravity work over stroke",
        formula: "Wg = m x g x s",
        unit: "N m",
        explanation:
          "m is mass in kg, g is 9.80665 m/s2 and s is stopping stroke in meters.",
      },
    ],
    steps: [
      {
        name: "Calculate kinetic energy",
        text: "Use the impact velocity at the moment the load reaches the absorber.",
      },
      {
        name: "Adjust for gravity",
        text: "Add gravity work for downward motion and subtract it for upward motion where gravity opposes the impact.",
      },
      {
        name: "Check rating and safety margin",
        text: "Compare energy, force, stroke and duty cycle against the selected product family.",
      },
    ],
    commonMistakes: [
      "Treating vertical and horizontal cases as identical.",
      "Forgetting gravity work on downward moving masses.",
      "Not checking return force and reset behavior for vertical equipment.",
    ],
    relatedLinks: [
      { label: "Vertical free-motion calculator", href: "/selector/engineer?entryKey=linear_free_motion" },
      { label: "Contact engineering support", href: "/contact" },
    ],
    sourceNotes: [
      "The full product catalog p.39 and p.50 require the user to specify vertical or horizontal motion for heavy-duty absorber application data.",
    ],
  },
  {
    slug: "how-to-size-shock-absorber-for-rotary-motion",
    categorySlug: "calculations",
    title: "How to Size a Shock Absorber for Rotary Motion",
    shortTitle: "Rotary Motion",
    description:
      "Convert rotary motion into rotational energy and absorber stroke at the contact radius.",
    intent: "rotary_motion_sizing",
    audience: ["engineer"],
    questions: [
      "How do I size a shock absorber for rotary motion?",
      "How do I calculate a shock absorber for a rotary table?",
      "How do I select a shock absorber for a swinging arm or gate?",
    ],
    directAnswer:
      "For rotary motion, calculate rotational kinetic energy from inertia and angular speed, then translate the absorber contact radius and stop angle into effective stopping stroke. Beam, gate and rotary-table cases need different inertia assumptions.",
    requiredInputs: [
      "rotatingMassKg",
      "radiusMm",
      "angularSpeedRpm",
      "stopAngleDeg",
      "loadType",
      "gravityRelation",
    ],
    formulas: [
      {
        name: "Angular speed",
        formula: "omega = rpm x 2 x pi / 60",
        unit: "rad/s",
        explanation: "Converts rotational speed into angular velocity.",
      },
      {
        name: "Rotational kinetic energy",
        formula: "E = 1/2 x I x omega^2",
        unit: "N m",
        explanation: "I is the moment of inertia for the rotating body.",
      },
      {
        name: "Arc stroke",
        formula: "s = r x theta",
        unit: "mm",
        explanation: "r is absorber contact radius and theta is stop angle in radians.",
      },
    ],
    steps: [
      {
        name: "Choose the rotary body model",
        text: "Identify whether the case is a rotary load, beam/gate or rotary table.",
      },
      {
        name: "Calculate rotational energy",
        text: "Use inertia and angular speed, then add gravity torque work for vertical rotation if needed.",
      },
      {
        name: "Check effective absorber stroke",
        text: "Use the contact radius and stop angle to confirm that the absorber stroke is sufficient.",
      },
    ],
    commonMistakes: [
      "Using linear velocity without converting the rotary geometry.",
      "Using the wrong inertia model for a beam or gate.",
      "Ignoring gravity torque in vertical rotary motion.",
    ],
    relatedLinks: [
      { label: "Rotary motion calculator", href: "/selector/engineer?entryKey=rotary_motion" },
      { label: "Send a rotary application drawing", href: "/contact" },
    ],
    sourceNotes: [
      "The product catalog describes shock absorber use across linear and rotary/drive-related applications; the current site calculator registry already implements rotary load, beam/gate and table variants.",
    ],
  },
  {
    slug: "how-to-use-shock-absorber-selection-curves",
    categorySlug: "calculations",
    title: "How to Use Shock Absorber Selection Curves",
    shortTitle: "Selection Curves",
    description:
      "What catalog selection curves mean and how they support model or adjustment-setting checks.",
    intent: "selection_curve_explanation",
    audience: ["engineer"],
    questions: [
      "How do I use industrial shock absorber selection curves?",
      "What does total energy vs impact velocity mean?",
      "How do I set an adjustable shock absorber?",
    ],
    directAnswer:
      "Selection curves compare impact velocity with total energy for a model or adjustment setting. A point outside the allowed curve means the absorber may be overloaded; for adjustable models, the usable setting range is limited by the impact velocity and damping curve.",
    requiredInputs: [
      "totalEnergyNm",
      "impactVelocityMps",
      "modelSeries",
      "adjustmentSetting",
    ],
    formulas: [],
    steps: [
      {
        name: "Locate impact velocity",
        text: "Find the velocity value on the model or setting curve.",
      },
      {
        name: "Locate total energy",
        text: "Find the calculated total energy per cycle and compare it with the curve boundary.",
      },
      {
        name: "Stay inside the curve",
        text: "Choose a model or adjustment range where the velocity-energy point sits inside the safe operating envelope.",
      },
    ],
    commonMistakes: [
      "Reading only energy and ignoring velocity.",
      "Using an adjustment setting beyond the velocity limit.",
      "Using selection curves as a replacement for energy-per-hour checks.",
    ],
    relatedLinks: [
      { label: "Calculate energy before reading curves", href: "/knowledge-center/calculations/how-to-calculate-impact-energy-for-shock-absorber" },
      { label: "Open sizing tool", href: "/selector/engineer" },
    ],
    sourceNotes: [
      "The full product catalog p.18 explains adjustable setting range by shock velocity and damping curves; p.28, p.29 and p.34 show EN selection curves using total energy and impact velocity.",
    ],
  },
];

export const selectionGuideArticles: KnowledgeArticle[] = [
  {
    slug: "choose-adjustable-or-non-adjustable-shock-absorber",
    categorySlug: "selection-guides",
    title: "How to Choose Between Adjustable and Non-Adjustable Shock Absorbers",
    shortTitle: "Adjustable vs Non-Adjustable",
    description:
      "A practical selection note for deciding whether an adjustable or self-compensating absorber is the better starting point.",
    intent: "selection_guidance",
    audience: ["engineer", "buyer"],
    questions: [
      "When should I use an adjustable shock absorber?",
      "When is a non-adjustable shock absorber better?",
      "How do I compare adjustable and self-compensating shock absorbers?",
    ],
    directAnswer:
      "Use an adjustable shock absorber when the load, speed or drive force changes enough that damping needs to be tuned on the machine. Use a non-adjustable or self-compensating absorber when the stop condition is repeatable and the goal is tamper-resistant operation with less commissioning effort.",
    requiredInputs: [
      "loadVariation",
      "impactVelocityRange",
      "cycleRate",
      "operatorAccess",
      "commissioningTime",
      "maintenancePolicy",
    ],
    formulas: [],
    steps: [
      {
        name: "Check how stable the application is",
        text: "A repeated end stop with narrow mass and velocity variation usually favors a non-adjustable absorber; frequent product or speed changes may justify adjustment.",
      },
      {
        name: "Decide whether tuning is useful or risky",
        text: "Adjustment helps during commissioning, but it also creates a setting that can be changed later. Use it where controlled tuning is expected.",
      },
      {
        name: "Confirm energy, stroke and duty rating",
        text: "The adjustable/non-adjustable decision does not replace sizing. The selected model still needs enough energy per cycle, energy per hour, stroke and force capacity.",
      },
    ],
    commonMistakes: [
      "Choosing an adjustable model only because it feels more flexible, even when the application is fixed and repeatable.",
      "Ignoring who will control the adjustment setting after installation.",
      "Comparing only thread size and stroke without checking energy and hourly duty.",
    ],
    relatedLinks: [
      { label: "Open sizing tool", href: "/selector/engineer" },
      { label: "Browse shock absorber products", href: "/products/shock-absorbers" },
      { label: "Read energy calculation", href: "/knowledge-center/calculations/how-to-calculate-impact-energy-for-shock-absorber" },
    ],
    sourceNotes: [
      "Adjustable families are useful where damping force needs to be tuned. Non-adjustable/self-compensating families are better suited to stable repeated stop conditions.",
    ],
  },
  {
    slug: "stroke-energy-force-which-rating-to-check-first",
    categorySlug: "selection-guides",
    title: "Stroke, Energy and Force: Which Rating Should Be Checked First?",
    shortTitle: "Rating Check Order",
    description:
      "A short engineering sequence for checking absorber ratings without reducing selection to a single catalog number.",
    intent: "selection_guidance",
    audience: ["engineer"],
    questions: [
      "Which shock absorber rating should be checked first?",
      "Is stroke or energy more important for shock absorber selection?",
      "Why can a shock absorber pass one rating and fail another?",
    ],
    directAnswer:
      "Start with available stroke and required stopping energy, then check energy per hour and impact force. A model is only suitable when all of these ratings make sense together; passing a single rating is not enough for a reliable selection.",
    requiredInputs: [
      "availableStrokeMm",
      "energyPerCycleNm",
      "cyclesPerHour",
      "impactForceLimitN",
      "mountingEnvelope",
      "threadOrMountingType",
    ],
    formulas: [
      {
        name: "Average stopping force",
        formula: "Favg = E / s",
        unit: "N",
        explanation:
          "A shorter stopping stroke increases average force for the same absorbed energy, so stroke and force should be reviewed together.",
      },
    ],
    steps: [
      {
        name: "Confirm usable stroke",
        text: "Check the machine can physically use the absorber stroke without bottoming out or hitting a mechanical stop first.",
      },
      {
        name: "Check energy per cycle",
        text: "Calculate the energy of one impact, including drive force or gravity where relevant.",
      },
      {
        name: "Check duty and force",
        text: "Multiply by cycle rate for hourly energy, then compare estimated stopping force with absorber and machine limits.",
      },
    ],
    commonMistakes: [
      "Selecting by stroke alone because the product fits the space.",
      "Checking energy per cycle but ignoring repeated high-frequency operation.",
      "Choosing a very short stroke and then discovering the frame sees excessive stopping force.",
    ],
    relatedLinks: [
      { label: "Calculate average impact force", href: "/knowledge-center/calculations/how-to-calculate-average-impact-force" },
      { label: "Check energy per hour", href: "/knowledge-center/calculations/how-to-check-energy-per-hour-for-shock-absorber" },
      { label: "Open buyer quick filter", href: "/selector/buyer" },
    ],
    sourceNotes: [
      "Product rating tables commonly list stroke, energy per cycle, energy per hour and maximum impact force because these limits must be checked together.",
    ],
  },
];

export const applicationArticles: KnowledgeArticle[] = [
  {
    slug: "shock-absorbers-for-conveyor-stops-and-transfer-systems",
    categorySlug: "applications",
    title: "Shock Absorbers for Conveyor Stops and Transfer Systems",
    shortTitle: "Conveyor and Transfer Stops",
    description:
      "How to review stopping duty in pallet transfer, roller conveyor and material-handling stations before selecting an absorber.",
    intent: "application_research",
    audience: ["engineer", "buyer"],
    questions: [
      "How do I choose a shock absorber for a conveyor stop?",
      "What data is needed for a pallet transfer stop?",
      "Why do conveyor stops wear out faster than expected?",
    ],
    directAnswer:
      "For a conveyor or transfer stop, use the highest arriving mass, actual impact velocity and maximum transfer frequency as the starting case. Then check whether accumulation, a powered drive or poor alignment adds force or side load during the absorber stroke. The model must satisfy single-impact energy, hourly duty and the available mechanical stroke together.",
    requiredInputs: [
      "maximumPalletMassKg",
      "impactVelocityMps",
      "transferCyclesPerHour",
      "availableStrokeMm",
      "driveForceN",
      "accumulationCondition",
      "stopperAlignment",
    ],
    formulas: [
      {
        name: "Base moving energy",
        formula: "E = 1/2 x m x v^2",
        unit: "N m",
        explanation:
          "Use the heaviest transfer load and its impact velocity at the stopping position. Powered drive work must be reviewed separately when it remains active during deceleration.",
      },
    ],
    steps: [
      {
        name: "Use the worst arriving load",
        text: "Base the selection on the heaviest pallet, fixture or workpiece that can reach the stop, including carriers and attachments.",
      },
      {
        name: "Measure the speed at the stop",
        text: "Transfer speed set upstream is not always the speed at impact. Check the motion at the actual stopping point, especially on declining or powered sections.",
      },
      {
        name: "Review duty and alignment",
        text: "A conveyor stop is a repeated impact point. Confirm hourly cycles, stopper geometry and guidance so the absorber is loaded axially rather than used as a locating element.",
      },
    ],
    commonMistakes: [
      "Using the nominal payload while omitting the pallet, carrier and fixture mass.",
      "Ignoring product accumulation that changes the effective mass or creates a second push into the stop.",
      "Using the absorber as the only positional stop without a suitable mechanical reference.",
    ],
    relatedLinks: [
      { label: "Calculate impact energy", href: "/knowledge-center/calculations/how-to-calculate-impact-energy-for-shock-absorber" },
      { label: "Check energy per hour", href: "/knowledge-center/calculations/how-to-check-energy-per-hour-for-shock-absorber" },
      { label: "Open the engineer sizing tool", href: "/selector/engineer" },
    ],
    sourceNotes: [
      "Transfer-system selection should be based on the moving assembly, impact velocity, duty cycle and available stopping stroke, rather than conveyor payload alone.",
    ],
  },
  {
    slug: "heavy-duty-buffers-for-cranes-rails-and-large-moving-structures",
    categorySlug: "applications",
    title: "Heavy Duty Buffers for Cranes, Rails and Large Moving Structures",
    shortTitle: "Heavy Duty Buffer Applications",
    description:
      "A selection framework for large moving masses where buffer travel, mounting structure and safety conditions are as important as energy.",
    intent: "application_research",
    audience: ["engineer", "buyer"],
    questions: [
      "How do I select a buffer for a crane or rail stop?",
      "What information is needed for heavy duty buffer sizing?",
      "Why is buffer stroke important for large moving structures?",
    ],
    directAnswer:
      "For crane, rail and large moving-structure stops, calculate the maximum credible moving mass and impact speed, then confirm that the available buffer stroke keeps stopping force within the equipment and foundation limits. Include grade, wind, powered travel force, end-stop arrangement, mounting method and safety requirements before choosing a heavy-duty buffer.",
    requiredInputs: [
      "movingMassKg",
      "maximumImpactVelocityMps",
      "availableBufferStrokeMm",
      "trackGrade",
      "driveForceN",
      "windOrExternalForceN",
      "mountingMethod",
      "safetyRequirement",
    ],
    formulas: [
      {
        name: "Average stopping force",
        formula: "Favg = E / s",
        unit: "N",
        explanation:
          "For the same kinetic energy, longer usable buffer stroke reduces average stopping force. Actual force distribution depends on the buffer characteristic and application geometry.",
      },
    ],
    steps: [
      {
        name: "Define the credible impact case",
        text: "Use the maximum expected travel speed and moving mass, not only a normal operating case. State whether the buffer is for routine stopping, an emergency end stop or both.",
      },
      {
        name: "Account for external work",
        text: "Review grade, wind, towing or powered drive force that can add energy while the buffer is compressing.",
      },
      {
        name: "Verify the complete end-stop system",
        text: "Check buffer travel, foundation, mounting brackets, mechanical stops and the protected structure as one system before approving the model.",
      },
    ],
    commonMistakes: [
      "Using normal operating speed for an emergency or runaway end-stop case.",
      "Selecting a high-energy buffer without confirming the structure can use its full stroke.",
      "Ignoring rail grade, wind or continued drive force during compression.",
    ],
    relatedLinks: [
      { label: "Read required calculation data", href: "/knowledge-center/calculations/what-data-is-needed-for-shock-absorber-calculation" },
      { label: "Calculate average impact force", href: "/knowledge-center/calculations/how-to-calculate-average-impact-force" },
      { label: "Send an application for review", href: "/contact" },
    ],
    sourceNotes: [
      "Heavy-duty buffer selection requires motion direction, weight, impact velocity, thrust or external force, cycles, environment and safety conditions in addition to mounting information.",
    ],
  },
  {
    slug: "shock-absorber-selection-for-pneumatic-cylinder-end-stops",
    categorySlug: "applications",
    title: "Shock Absorber Selection for Pneumatic Cylinder End Stops",
    shortTitle: "Pneumatic Cylinder End Stops",
    description:
      "How to review cylinder-driven stops where thrust force continues during absorber compression.",
    intent: "application_research",
    audience: ["engineer", "buyer"],
    questions: [
      "How do I select a shock absorber for a pneumatic cylinder?",
      "Should cylinder thrust force be included in shock absorber sizing?",
      "Why does a cylinder end stop need more than mass and velocity?",
    ],
    directAnswer:
      "For pneumatic cylinder end stops, calculate the moving mass energy and add the work done by cylinder thrust over the absorber stroke. The absorber must handle both the impact energy and the continuing drive force while staying within hourly duty and force limits.",
    requiredInputs: [
      "movingMassKg",
      "impactVelocityMps",
      "cylinderBoreMm",
      "airPressureBar",
      "availableStrokeMm",
      "cyclesPerHour",
      "mountingAlignment",
    ],
    formulas: [
      {
        name: "Cylinder thrust work",
        formula: "W = F x s",
        unit: "N m",
        explanation:
          "F is cylinder thrust and s is absorber stroke in meters. Add this when pressure continues pushing during the stop.",
      },
    ],
    steps: [
      {
        name: "Identify the actual impact speed",
        text: "Use the speed at the end of travel, not only the nominal cylinder speed from the catalog or valve setting.",
      },
      {
        name: "Add cylinder thrust contribution",
        text: "If air pressure remains applied during deceleration, include the force acting across the absorber stroke.",
      },
      {
        name: "Review alignment and return behavior",
        text: "Cylinder stops often fail from side load, poor alignment or insufficient reset time rather than energy alone.",
      },
    ],
    commonMistakes: [
      "Sizing the absorber as if the moving load were free motion while the cylinder is still pushing.",
      "Ignoring pressure variation between commissioning and production settings.",
      "Mounting the absorber off-axis and creating side load on the piston rod.",
    ],
    relatedLinks: [
      { label: "Open cylinder-driven sizing", href: "/selector/engineer?entryKey=linear_cylinder_driven" },
      { label: "Read impact energy calculation", href: "/knowledge-center/calculations/how-to-calculate-impact-energy-for-shock-absorber" },
      { label: "Send application data", href: "/contact" },
    ],
    sourceNotes: [
      "Cylinder-driven applications should be treated as powered motion when thrust continues during deceleration.",
    ],
  },
];

export const replacementArticles: KnowledgeArticle[] = [
  {
    slug: "why-similar-stroke-and-thread-size-are-not-enough-for-replacement",
    categorySlug: "replacement-cross-reference",
    title: "Why Similar Stroke and Thread Size Are Not Enough for Shock Absorber Replacement",
    shortTitle: "Beyond Stroke and Thread",
    description:
      "Why a physically compatible absorber can still create a poor replacement outcome when damping and duty are not checked.",
    intent: "replacement_inquiry",
    audience: ["buyer", "engineer"],
    questions: [
      "Can I replace a shock absorber with the same stroke and thread size?",
      "Why does a replacement shock absorber bottom out even when it fits?",
      "Which ratings should be compared for shock absorber cross reference?",
    ],
    directAnswer:
      "Matching stroke and thread size only confirms part of the mechanical fit. A replacement also needs compatible energy per cycle, energy per hour, damping behavior, impact force, return time, body envelope and mounting condition. A unit can fit the bracket but still bottom out, overheat or transmit excessive force if these operating limits differ.",
    requiredInputs: [
      "existingModel",
      "strokeMm",
      "threadSize",
      "energyPerCycleNm",
      "energyPerHourNm",
      "impactForceLimitN",
      "returnTime",
      "mountingEnvelope",
    ],
    formulas: [],
    steps: [
      {
        name: "Confirm the mechanical interface",
        text: "Compare thread, stroke, body diameter, extended length, cap or flange arrangement and available adjustment access.",
      },
      {
        name: "Compare the operating ratings",
        text: "Check energy per cycle, hourly duty, force limit and speed range against the real machine condition, not only against the old nameplate.",
      },
      {
        name: "Review the reason for replacement",
        text: "If the old unit leaked, bottomed out or loosened repeatedly, correct the application or installation cause before specifying an equivalent.",
      },
    ],
    commonMistakes: [
      "Assuming every M20 or M25 body with the same stroke has the same damping capacity.",
      "Ignoring return time in high-cycle applications where the absorber may not reset before the next impact.",
      "Treating a failed original part as proof that the previous selection was correct.",
    ],
    relatedLinks: [
      { label: "Read the replacement checklist", href: "/knowledge-center/replacement-cross-reference/what-to-check-before-replacing-an-industrial-shock-absorber" },
      { label: "Check rating order", href: "/knowledge-center/selection-guides/stroke-energy-force-which-rating-to-check-first" },
      { label: "Send replacement details", href: "/contact" },
    ],
    sourceNotes: [
      "Replacement comparison should combine dimensional compatibility with catalog energy, duty, force and adjustment limits.",
    ],
  },
  {
    slug: "what-to-check-before-replacing-an-industrial-shock-absorber",
    categorySlug: "replacement-cross-reference",
    title: "What to Check Before Replacing an Existing Industrial Shock Absorber",
    shortTitle: "Replacement Checks",
    description:
      "A replacement checklist for confirming that a similar-looking absorber will also work in the application.",
    intent: "replacement_inquiry",
    audience: ["engineer", "buyer"],
    questions: [
      "What should I check before replacing a shock absorber?",
      "Can I replace a shock absorber by matching stroke and thread?",
      "What information is needed for a shock absorber cross reference?",
    ],
    directAnswer:
      "Before replacing an absorber, confirm the original model, stroke, thread or mounting type, body envelope, energy per cycle, cycle rate, impact speed, load, drive force and installation condition. Stroke and thread size help with fit, but they do not confirm damping capacity or service life.",
    requiredInputs: [
      "existingModel",
      "strokeMm",
      "threadOrMounting",
      "bodyEnvelope",
      "movingMassKg",
      "impactVelocityMps",
      "cyclesPerHour",
      "failureSymptoms",
    ],
    formulas: [],
    steps: [
      {
        name: "Separate fit from function",
        text: "First confirm the mechanical envelope, then separately check energy, duty and force requirements.",
      },
      {
        name: "Record why the old unit is being replaced",
        text: "A leaking, overheated or bottomed-out absorber may indicate a sizing or installation issue, not only normal wear.",
      },
      {
        name: "Compare the operating limits",
        text: "Use catalog ratings and application data to confirm that the replacement has sufficient capacity with margin.",
      },
    ],
    commonMistakes: [
      "Treating the replacement as a dimensional match only.",
      "Ignoring a change in machine speed, payload or cycle rate since the original unit was installed.",
      "Replacing a failed absorber without checking alignment, side load or bottoming-out marks.",
    ],
    relatedLinks: [
      { label: "Send replacement data", href: "/contact" },
      { label: "Browse products", href: "/products" },
      { label: "Read required data checklist", href: "/knowledge-center/calculations/what-data-is-needed-for-shock-absorber-calculation" },
    ],
    sourceNotes: [
      "Replacement review should include both catalog dimensions and application operating values, especially when failure symptoms are present.",
    ],
  },
];

export const troubleshootingArticles: KnowledgeArticle[] = [
  {
    slug: "side-load-alignment-and-mounting-errors-in-shock-absorber-applications",
    categorySlug: "installation-troubleshooting",
    title: "Side Load, Alignment and Mounting Errors in Shock Absorber Applications",
    shortTitle: "Side Load and Alignment",
    description:
      "How off-axis contact, inadequate guidance and incorrect mounting shorten absorber life even when the energy rating appears adequate.",
    intent: "technical_support",
    audience: ["engineer"],
    questions: [
      "What is side load on an industrial shock absorber?",
      "Why does a shock absorber piston rod wear or bend?",
      "How should a shock absorber be aligned with the moving load?",
    ],
    directAnswer:
      "An industrial shock absorber is designed to receive force substantially along its axis. Side load occurs when the moving member contacts the rod off-center or when the machine guides allow the load to sweep sideways during compression. Correct the guide, striker geometry and mounting alignment so the absorber controls axial deceleration instead of carrying lateral motion or locating the mechanism.",
    requiredInputs: [
      "contactPointGeometry",
      "guideClearance",
      "mountingSurfaceFlatness",
      "absorberAxisAlignment",
      "movingMemberDeflection",
      "impactSpeedMps",
    ],
    formulas: [],
    steps: [
      {
        name: "Inspect the contact pattern",
        text: "Look for asymmetric marks on the striker, rod or stop face. A centered contact should remain centered through the usable absorber stroke.",
      },
      {
        name: "Check guidance independently",
        text: "The machine guides should control the moving mass. Do not rely on the shock absorber rod to correct lateral travel or misalignment.",
      },
      {
        name: "Verify mounting under load",
        text: "Confirm brackets, lock nuts and mounting surfaces stay rigid at impact. Alignment can change when a thin bracket or long arm deflects.",
      },
    ],
    commonMistakes: [
      "Checking alignment only while the machine is stationary and unloaded.",
      "Using a narrow striker face that contacts the rod at an angle.",
      "Trying to solve lateral motion with a larger absorber instead of improving machine guidance.",
    ],
    relatedLinks: [
      { label: "Diagnose bottoming out", href: "/knowledge-center/installation-troubleshooting/common-causes-of-shock-absorber-bottoming-out" },
      { label: "Read pneumatic cylinder end-stop guidance", href: "/knowledge-center/applications/shock-absorber-selection-for-pneumatic-cylinder-end-stops" },
      { label: "Contact technical support", href: "/contact" },
    ],
    sourceNotes: [
      "Mounting and alignment review is necessary because an otherwise suitable energy rating does not protect a shock absorber from lateral load or guide-system deflection.",
    ],
  },
  {
    slug: "common-causes-of-shock-absorber-bottoming-out",
    categorySlug: "installation-troubleshooting",
    title: "Common Causes of Shock Absorber Bottoming Out",
    shortTitle: "Bottoming Out Causes",
    description:
      "How to diagnose a hard stop at the end of stroke before simply moving to a larger absorber.",
    intent: "technical_support",
    audience: ["engineer"],
    questions: [
      "Why is my shock absorber bottoming out?",
      "What causes a hard stop at the end of absorber stroke?",
      "Should I choose a larger absorber if bottoming out happens?",
    ],
    directAnswer:
      "Bottoming out usually means the absorber is reaching the end of its stroke before the energy has been controlled. The cause can be insufficient stroke, underestimated impact energy, excessive drive force, high cycle heating, wrong adjustment setting, side load or a mechanical stop interfering with absorber travel.",
    requiredInputs: [
      "visibleStrokeUse",
      "impactMarks",
      "movingMassKg",
      "impactVelocityMps",
      "driveForceN",
      "cyclesPerHour",
      "mountingAlignment",
      "adjustmentSetting",
    ],
    formulas: [],
    steps: [
      {
        name: "Confirm full stroke is available",
        text: "Check whether the machine allows the absorber to use its rated stroke or whether another stop is contacted first.",
      },
      {
        name: "Recalculate the energy case",
        text: "Review mass, speed, gravity and drive force. A small velocity increase can create a large energy increase.",
      },
      {
        name: "Inspect installation and heat conditions",
        text: "Side load, high cycle rate and incorrect adjustment can produce bottoming symptoms even when the nominal model looks close.",
      },
    ],
    commonMistakes: [
      "Replacing the absorber with the same model without checking whether the application changed.",
      "Assuming bottoming out always means the product is defective.",
      "Increasing damping adjustment without checking whether the machine frame can accept the higher force.",
    ],
    relatedLinks: [
      { label: "Calculate impact energy", href: "/knowledge-center/calculations/how-to-calculate-impact-energy-for-shock-absorber" },
      { label: "Calculate average impact force", href: "/knowledge-center/calculations/how-to-calculate-average-impact-force" },
      { label: "Contact engineering support", href: "/contact" },
    ],
    sourceNotes: [
      "Bottoming-out diagnosis should review sizing, duty and installation together because the same symptom can come from several different causes.",
    ],
  },
];

export const buyerFaqArticles: KnowledgeArticle[] = [
  {
    slug: "how-to-compare-shock-absorber-quotations-beyond-unit-price",
    categorySlug: "buyer-faq",
    title: "How to Compare Shock Absorber Quotations Beyond Unit Price",
    shortTitle: "Comparing Quotations",
    description:
      "A procurement check for comparing quotations by technical fit, traceability and delivery scope rather than unit price alone.",
    intent: "buyer_procurement",
    audience: ["buyer", "engineer"],
    questions: [
      "How should I compare industrial shock absorber quotations?",
      "What should be checked besides shock absorber unit price?",
      "How do I compare replacement shock absorber offers?",
    ],
    directAnswer:
      "Compare quotations against the confirmed application first: model or proposed family, stroke, mounting interface, energy and duty ratings, adjustment type, material or environmental requirement, documentation, quantity, lead time and warranty or support scope. A lower unit price is not a like-for-like comparison if the offered absorber has a different duty rating, service life expectation or technical assumption.",
    requiredInputs: [
      "proposedModel",
      "strokeMm",
      "energyPerCycleNm",
      "energyPerHourNm",
      "mountingInterface",
      "environmentRequirement",
      "quantity",
      "leadTime",
      "documentationScope",
    ],
    formulas: [],
    steps: [
      {
        name: "Make the technical basis explicit",
        text: "Ask each supplier to state the assumed mass, speed, duty cycle and mounting condition behind the proposed model.",
      },
      {
        name: "Normalize the scope",
        text: "Compare the same quantity, shipping basis, documentation, accessories and commercial terms before evaluating price differences.",
      },
      {
        name: "Check lifecycle risk",
        text: "For critical stops, include availability, replacement traceability and technical support in the decision rather than treating the absorber as a generic dimensional part.",
      },
    ],
    commonMistakes: [
      "Comparing unit price before confirming that the proposals meet the same operating ratings.",
      "Accepting an equivalent claim without a stated model, datasheet or application assumption.",
      "Omitting the delivery, documentation and after-sales scope from the comparison sheet.",
    ],
    relatedLinks: [
      { label: "Prepare a complete RFQ", href: "/knowledge-center/buyer-faq/what-information-should-be-included-in-a-shock-absorber-rfq" },
      { label: "Read replacement checks", href: "/knowledge-center/replacement-cross-reference/what-to-check-before-replacing-an-industrial-shock-absorber" },
      { label: "Request an application review", href: "/contact" },
    ],
    sourceNotes: [
      "A technically comparable quotation identifies the proposed product, relevant operating ratings, commercial scope and any assumptions requiring confirmation.",
    ],
  },
  {
    slug: "what-information-should-be-included-in-a-shock-absorber-rfq",
    categorySlug: "buyer-faq",
    title: "What Information Should Be Included in a Shock Absorber RFQ?",
    shortTitle: "RFQ Data Checklist",
    description:
      "A concise RFQ checklist that helps purchasing teams receive a technically useful quotation.",
    intent: "buyer_procurement",
    audience: ["buyer", "engineer"],
    questions: [
      "What information should I include in a shock absorber RFQ?",
      "How can I get a faster shock absorber quotation?",
      "What data helps suppliers recommend the right shock absorber?",
    ],
    directAnswer:
      "A useful RFQ should include the target model if known, application description, moving mass, impact velocity, stroke or space limit, drive force, cycles per hour, mounting style, environment, quantity, delivery expectation and any drawing or photo. If some values are unknown, state that clearly so the quotation can separate assumptions from confirmed data.",
    requiredInputs: [
      "targetModel",
      "applicationDescription",
      "movingMassKg",
      "impactVelocityMps",
      "availableStrokeMm",
      "driveForceN",
      "cyclesPerHour",
      "environment",
      "quantity",
      "drawingsOrPhotos",
    ],
    formulas: [],
    steps: [
      {
        name: "Start with the application, not only the part number",
        text: "Part numbers help with replacement, but application context helps avoid quoting a part that fits physically but fails technically.",
      },
      {
        name: "Mark confirmed and estimated values",
        text: "Separate measured values from assumptions, especially speed, mass and cycle rate.",
      },
      {
        name: "Attach drawings or photos when possible",
        text: "Mounting space, rod alignment and surrounding structure often affect the recommendation.",
      },
    ],
    commonMistakes: [
      "Sending only thread size and stroke while omitting speed, mass and cycle rate.",
      "Requesting a direct replacement without explaining why the existing unit is being changed.",
      "Not mentioning environment, corrosion exposure, temperature or safety requirements.",
    ],
    relatedLinks: [
      { label: "Send application data", href: "/contact" },
      { label: "Open buyer quick filter", href: "/selector/buyer" },
      { label: "Read required calculation data", href: "/knowledge-center/calculations/what-data-is-needed-for-shock-absorber-calculation" },
    ],
    sourceNotes: [
      "RFQ quality improves when purchasing and engineering data are combined: model target, application conditions, mounting constraints and commercial quantity.",
    ],
  },
];

export const knowledgeArticles = [
  ...calculationArticles,
  ...selectionGuideArticles,
  ...applicationArticles,
  ...replacementArticles,
  ...troubleshootingArticles,
  ...buyerFaqArticles,
];

export function getKnowledgeCategory(slug: string) {
  return knowledgeCategories.find((category) => category.slug === slug) ?? null;
}

export function getKnowledgeArticle(slug: string) {
  return knowledgeArticles.find((article) => article.slug === slug) ?? null;
}

export function getKnowledgeArticlesByCategory(categorySlug: string) {
  return knowledgeArticles.filter((article) => article.categorySlug === categorySlug);
}

export function getKnowledgeArticlePath(article: KnowledgeArticle) {
  return `/knowledge-center/${article.categorySlug}/${article.slug}`;
}
