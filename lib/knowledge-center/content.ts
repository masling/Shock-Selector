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

export const knowledgeArticles = calculationArticles;

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
