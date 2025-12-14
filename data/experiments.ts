import { Experiment, LabType, DifficultyLevel, SafetyLevel } from '../types';

export const experiments: Experiment[] = [
  // --- CHEMISTRY (12) ---
  {
    id: 'chem_01',
    title: 'Volcano Eruption',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '5 mins',
    durationMinutes: 5,
    materials: ['Baking soda', 'Vinegar', 'Food coloring', 'Dish soap', 'Container'],
    steps: [
      'Place container on a tray to catch spills.',
      'Add 2 tablespoons of baking soda.',
      'Add a squirt of dish soap and food coloring.',
      'Pour in vinegar quickly.',
      'Watch it erupt!'
    ],
    expectedOutput: 'Fizzing, foam, gas bubbles, and rapid expansion.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Keep vinegar away from eyes', 'Prepare for mess'],
    scientificPrinciple: 'Acid-base reaction produces carbon dioxide gas bubbles.',
    advancedPrinciple: 'NaHCO₃ + CH₃COOH → CO₂ + H₂O + CH₃COONa. The rapid release of CO₂ gas creates pressure that pushes the liquid out.',
    realWorldApplication: 'Leavening in baking, some fire extinguishers.',
    funFact: 'This same reaction powers airbags in cars (though using different chemicals)!',
    learningOutcomes: ['Acid-Base Reactions', 'Gas Production', 'States of Matter']
  },
  {
    id: 'chem_02',
    title: 'Color Explosion',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '5 mins',
    durationMinutes: 5,
    materials: ['Milk (Whole)', 'Food coloring', 'Dish soap', 'Cotton swab', 'Plate'],
    steps: [
      'Pour milk onto a plate.',
      'Add drops of different food coloring near the center.',
      'Dip a cotton swab in dish soap.',
      'Touch the soapy swab to the center of the milk.',
      'Observe the colors racing away!'
    ],
    expectedOutput: 'Colorful explosion of dyes spreading rapidly across the milk.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not drink the soapy milk'],
    scientificPrinciple: 'Soap molecules break down fat in milk, causing dyes to spread.',
    advancedPrinciple: 'Surfactants in soap lower the surface tension of the milk and interact with the hydrophobic fat globules, causing movement.',
    realWorldApplication: 'How soap cleans grease off dishes.',
    funFact: 'This works best with whole milk because it has more fat!',
    learningOutcomes: ['Surface Tension', 'Hydrophobic/Hydrophilic interactions']
  },
  {
    id: 'chem_03',
    title: 'Elephant Toothpaste',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['Hydrogen peroxide (3% or 6%)', 'Dry yeast', 'Dish soap', 'Warm water', 'Bottle', 'Food coloring'],
    steps: [
      'Mix yeast with warm water to activate it.',
      'Pour hydrogen peroxide into a bottle.',
      'Add dish soap and food coloring to the bottle.',
      'Pour the yeast mixture into the bottle.',
      'Stand back!'
    ],
    expectedOutput: 'Thick foam erupts from the bottle like giant toothpaste.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Exothermic reaction (creates heat)', 'Do not touch foam immediately', 'Wear goggles'],
    scientificPrinciple: 'Yeast acts as a catalyst to break down hydrogen peroxide rapidly, releasing oxygen gas.',
    advancedPrinciple: '2H₂O₂ → 2H₂O + O₂. The yeast contains catalase, an enzyme that speeds up the decomposition.',
    realWorldApplication: 'Rocket propulsion uses similar rapid gas release.',
    funFact: 'The foam is filled with pure oxygen bubbles.',
    learningOutcomes: ['Catalysts', 'Exothermic Reactions', 'Decomposition']
  },
  {
    id: 'chem_04',
    title: 'Crystal Growth',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '24+ Hours',
    durationMinutes: 1440,
    materials: ['Sugar (or Salt)', 'Water', 'Heat source', 'Jar', 'String', 'Pencil'],
    steps: [
      'Boil water and dissolve as much sugar as possible (supersaturation).',
      'Let cool slightly and pour into jar.',
      'Tie string to pencil and dangle in liquid.',
      'Leave undisturbed for days.'
    ],
    expectedOutput: 'Crystals form and grow on the string.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Hot liquid handling requires supervision.'],
    scientificPrinciple: 'As water cools, sugar molecules bond in orderly patterns.',
    advancedPrinciple: 'Supersaturated solutions are unstable; cooling reduces solubility, forcing the solute to precipitate as crystals.',
    realWorldApplication: 'Semiconductor manufacturing (silicon crystals).',
    funFact: 'The largest crystals on Earth are in the Cave of the Crystals in Mexico, up to 39ft long!',
    learningOutcomes: ['Solubility', 'Supersaturation', 'Crystallization']
  },
  {
    id: 'chem_05',
    title: 'Acid-Base Color Change',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '10 mins',
    durationMinutes: 10,
    materials: ['Baking soda', 'Lemon juice', 'Water', 'Clear cups', 'Red Cabbage Juice (optional)'],
    steps: [
      'Dissolve baking soda in water (Base).',
      'Pour lemon juice in another cup (Acid).',
      'Add indicator (cabbage juice) to see color difference.',
      'Mix them together.'
    ],
    expectedOutput: 'Color shifts from blue/green (base) to pink (acid) or fizzing if mixed.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Avoid getting lemon juice in eyes'],
    scientificPrinciple: 'Acids and Bases are opposites that react to neutralize each other.',
    advancedPrinciple: 'pH scale measures Hydrogen ion concentration. Indicators change structure and color based on pH.',
    realWorldApplication: 'Pool maintenance, soil testing for agriculture.',
    funFact: 'Hydrangeas change flower color based on the soil pH!',
    learningOutcomes: ['pH Scale', 'Neutralization', 'Indicators']
  },
  {
    id: 'chem_06',
    title: 'Slime Creation',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['White glue (PVA)', 'Baking soda', 'Contact lens solution (with boric acid)', 'Food coloring'],
    steps: [
      'Pour glue into a bowl.',
      'Mix in baking soda and food coloring.',
      'Add contact solution slowly while stirring.',
      'Knead with hands until not sticky.'
    ],
    expectedOutput: 'Stretchy, gooey slime.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not eat', 'Wash hands after playing'],
    scientificPrinciple: 'A chemical reaction links the glue strands together to make them rubbery.',
    advancedPrinciple: 'Borate ions cross-link the polyvinyl alcohol (PVA) polymer chains, restricting their movement and increasing viscosity.',
    realWorldApplication: 'Making rubber and plastics.',
    funFact: 'Slime is a non-Newtonian fluid!',
    learningOutcomes: ['Polymers', 'Cross-linking', 'Viscosity']
  },
  {
    id: 'chem_07',
    title: 'Oobleck',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '10 mins',
    durationMinutes: 10,
    materials: ['Cornstarch', 'Water', 'Bowl', 'Food coloring'],
    steps: [
      'Pour cornstarch into bowl.',
      'Add water slowly while mixing with hands.',
      'Stop when it feels like a liquid but turns solid when you punch it.'
    ],
    expectedOutput: 'A fluid that flows like liquid but acts solid under impact.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not pour down drain (clogs pipes). Trash only.'],
    scientificPrinciple: 'Cornstarch particles jam under pressure, then flow like liquid.',
    advancedPrinciple: 'Shear-thickening non-Newtonian fluid. High shear stress increases viscosity drastically.',
    realWorldApplication: 'Body armor research (liquid armor).',
    funFact: 'You can technically run across a pool of Oobleck without sinking!',
    learningOutcomes: ['Non-Newtonian Fluids', 'States of Matter', 'Viscosity']
  },
  {
    id: 'chem_08',
    title: 'Thermal Volcano (Dry Ice)',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.ADVANCED,
    duration: '10 mins',
    durationMinutes: 10,
    materials: ['Dry Ice', 'Warm water', 'Dish soap', 'Container', 'Heavy gloves'],
    steps: [
      'Put warm water and soap in container.',
      'WEAR GLOVES. Drop small piece of dry ice in.',
      'Observe the fog bubbles.'
    ],
    expectedOutput: 'Vigorous bubbling and thick white fog production.',
    safetyLevel: SafetyLevel.DANGER,
    safetyPrecautions: ['EXTREME COLD (-78°C). NEVER touch with skin.', 'Use in well-ventilated area.', 'Adult supervision mandatory.'],
    scientificPrinciple: 'Sublimation: Solid turns directly to gas.',
    advancedPrinciple: 'Dry ice (solid CO₂) sublimates rapidly in warm water, releasing gas that gets trapped in soap bubbles.',
    realWorldApplication: 'Special effects fog, shipping frozen food.',
    funFact: 'Dry ice doesn\'t melt into liquid, it vanishes into gas!',
    learningOutcomes: ['Sublimation', 'States of Matter', 'Thermodynamics']
  },
  {
    id: 'chem_09',
    title: 'Density Tower',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '20 mins',
    durationMinutes: 20,
    materials: ['Honey', 'Corn syrup', 'Dish soap', 'Water', 'Vegetable oil', 'Rubbing alcohol', 'Tall glass'],
    steps: [
      'Pour liquids carefully into the center of the glass.',
      'Order: Honey -> Syrup -> Soap -> Water -> Oil -> Alcohol.',
      'Pour slowly to avoid mixing.',
      'Drop items in to see where they float.'
    ],
    expectedOutput: 'Distinct layers of colored liquids stacked on each other.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not drink'],
    scientificPrinciple: 'Different liquids have different weights (densities), so they stack.',
    advancedPrinciple: 'Density = Mass/Volume. Less dense fluids float on denser fluids due to buoyancy.',
    realWorldApplication: 'Oil spills floating on water.',
    funFact: 'Saturn is less dense than water - it would float in a giant bathtub!',
    learningOutcomes: ['Density', 'Buoyancy', 'Immiscibility']
  },
  {
    id: 'chem_10',
    title: 'Rust Formation',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '3 Days',
    durationMinutes: 4320,
    materials: ['Steel wool', 'Water', 'Salt', 'Vinegar', '3 Jars'],
    steps: [
      'Put steel wool in each jar.',
      'Jar 1: Dry. Jar 2: Water. Jar 3: Salt water.',
      'Leave open to air.',
      'Observe daily.'
    ],
    expectedOutput: 'Orange rust forms fastest in salt water.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Steel wool can be sharp'],
    scientificPrinciple: 'Iron reacts with oxygen and water to form rust.',
    advancedPrinciple: 'Oxidation reaction: 4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃. Salt acts as an electrolyte speeding up electron transfer.',
    realWorldApplication: 'Protecting bridges and cars from corrosion.',
    funFact: 'Mars is red because its surface is covered in rust (Iron Oxide)!',
    learningOutcomes: ['Oxidation', 'Chemical Reactions', 'Catalysts']
  },
  {
    id: 'chem_11',
    title: 'Cabbage pH Indicator',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '30 mins',
    durationMinutes: 30,
    materials: ['Red cabbage', 'Boiling water', 'Strain/Filter', 'Household liquids (Soap, Vinegar, Soda)'],
    steps: [
      'Chop cabbage and soak in boiling water for 10 mins.',
      'Strain the purple liquid.',
      'Pour into small cups.',
      'Add different household items to each cup.'
    ],
    expectedOutput: 'Purple liquid changes to Red (Acid), Blue (Neutral), Green/Yellow (Base).',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Hot water handling'],
    scientificPrinciple: 'Cabbage juice changes color based on how acidic a liquid is.',
    advancedPrinciple: 'Anthocyanin pigment creates a conjugated system that absorbs different light wavelengths at different pH levels.',
    realWorldApplication: 'Testing water quality.',
    funFact: 'You can eat the experiment (if you tested edible things)!',
    learningOutcomes: ['pH Scale', 'Indicators', 'Acids and Bases']
  },
  {
    id: 'chem_12',
    title: 'Fountain Reaction (Mentos)',
    subject: LabType.CHEMISTRY,
    difficulty: DifficultyLevel.ADVANCED,
    duration: '5 mins',
    durationMinutes: 5,
    materials: ['Diet Coke (2L)', 'Mentos mints', 'Paper tube'],
    steps: [
      'GO OUTSIDE.',
      'Open soda bottle.',
      'Stack Mentos in tube.',
      'Drop all Mentos in at once and run away.'
    ],
    expectedOutput: 'Huge foam geyser erupts immediately.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Perform outdoors only', 'Sticky mess', 'Projectile liquid'],
    scientificPrinciple: 'Mentos surface roughness causes rapid release of gas bubbles.',
    advancedPrinciple: 'Nucleation: The pits on the candy surface provide sites for dissolved CO₂ to come out of solution rapidly.',
    realWorldApplication: 'Degassing liquids in manufacturing.',
    funFact: 'The record for highest Mentos geyser is over 29 feet!',
    learningOutcomes: ['Nucleation', 'Gas Solubility', 'Physical Reactions']
  },

  // --- BIOLOGY (10) ---
  {
    id: 'bio_01',
    title: 'Plant Growth Tracking',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '2 Weeks',
    durationMinutes: 20160,
    materials: ['Bean seeds', 'Soil', 'Cup', 'Water', 'Sunlight'],
    steps: [
      'Plant seed 1 inch deep in soil.',
      'Water gently.',
      'Place in sunlight.',
      'Measure height every day.'
    ],
    expectedOutput: 'Seed germinates, sprout emerges, leaves unfold.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Wash hands after handling soil'],
    scientificPrinciple: 'Plants grow by converting sunlight to energy.',
    advancedPrinciple: 'Photosynthesis: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂. Auxins control growth direction.',
    realWorldApplication: 'Agriculture and farming.',
    funFact: 'Bamboo can grow up to 35 inches in a single day!',
    learningOutcomes: ['Germination', 'Photosynthesis', 'Plant Anatomy']
  },
  {
    id: 'bio_02',
    title: 'Microscopic Cell Observation',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '30 mins',
    durationMinutes: 30,
    materials: ['Onion', 'Microscope', 'Slide', 'Iodine stain', 'Tweezers'],
    steps: [
      'Peel thin skin from onion layer.',
      'Place flat on slide.',
      'Add drop of iodine.',
      'Cover and view under microscope.'
    ],
    expectedOutput: 'Visible brick-like cell walls and dark nuclei.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Glass slides are sharp', 'Iodine stains skin/clothes'],
    scientificPrinciple: 'Cells are the building blocks of life.',
    advancedPrinciple: 'Eukaryotic plant cells have rigid cell walls made of cellulose and a distinct nucleus containing DNA.',
    realWorldApplication: 'Medical diagnosis of diseases.',
    funFact: 'The average human body has 30 trillion cells!',
    learningOutcomes: ['Microscopy', 'Cell Structure', 'Organelles']
  },
  {
    id: 'bio_03',
    title: 'Strawberry DNA Extraction',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '20 mins',
    durationMinutes: 20,
    materials: ['Strawberry', 'Ziploc bag', 'Dish soap', 'Salt', 'Rubbing alcohol (cold)', 'Coffee filter'],
    steps: [
      'Mash strawberry in bag with soap and salt.',
      'Filter liquid into a cup.',
      'Gently pour cold alcohol on top.',
      'Look for white strands appearing.'
    ],
    expectedOutput: 'Clumps of white, stringy DNA precipitate.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not drink extraction liquid'],
    scientificPrinciple: 'Soap breaks cells, alcohol makes DNA come out of solution.',
    advancedPrinciple: 'Lysis buffer (soap) breaks lipid membranes. Salt neutralizes DNA charge. Ethanol precipitates DNA.',
    realWorldApplication: 'Forensic science and genetic testing.',
    funFact: 'Humans share 60% of their DNA with strawberries!',
    learningOutcomes: ['DNA Structure', 'Cell Lysis', 'Genetics']
  },
  {
    id: 'bio_04',
    title: 'Enzyme Activity (Catalase)',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '10 mins',
    durationMinutes: 10,
    materials: ['Yeast (or raw liver)', 'Hydrogen peroxide', 'Cup'],
    steps: [
      'Put yeast in a cup.',
      'Add hydrogen peroxide.',
      'Observe rapid bubbling.'
    ],
    expectedOutput: 'Vigorous bubbling (Oxygen gas).',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Do not touch liquid'],
    scientificPrinciple: 'Enzymes are biological machines that speed up reactions.',
    advancedPrinciple: 'Catalase enzyme lowers activation energy for H₂O₂ decomposition.',
    realWorldApplication: 'Our liver uses this to detoxify blood.',
    funFact: 'One catalase molecule can break down millions of hydrogen peroxide molecules per second!',
    learningOutcomes: ['Enzymes', 'Catalysis', 'Metabolism']
  },
  {
    id: 'bio_05',
    title: 'Osmosis Demo (Naked Egg)',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '3 Days',
    durationMinutes: 4320,
    materials: ['Egg (shell dissolved in vinegar)', 'Water', 'Corn syrup', 'Cups'],
    steps: [
      'Place "naked" egg in water (wait 24h).',
      'Place another "naked" egg in corn syrup (wait 24h).',
      'Compare sizes.'
    ],
    expectedOutput: 'Water egg swells (huge). Syrup egg shrivels (tiny).',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Wash hands after handling raw eggs'],
    scientificPrinciple: 'Water moves through the egg skin to balance salt/sugar levels.',
    advancedPrinciple: 'Osmosis: Solvent moves from low solute concentration (hypotonic) to high solute concentration (hypertonic) across semi-permeable membrane.',
    realWorldApplication: 'Kidney dialysis, preserving food with salt.',
    funFact: 'Drinking salt water makes you dehydrated because of osmosis pulling water OUT of your cells.',
    learningOutcomes: ['Osmosis', 'Semi-permeable Membranes', 'Tonicity']
  },
  {
    id: 'bio_06',
    title: 'Bacterial Growth',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '5 Days',
    durationMinutes: 7200,
    materials: ['Agar plates (or gelatin)', 'Cotton swabs', 'Tape', 'Warm spot'],
    steps: [
      'Swab different surfaces (phone, door handle, mouth).',
      'Rub gently on agar plate.',
      'Tape shut and label.',
      'Wait 3-5 days. DO NOT OPEN.'
    ],
    expectedOutput: 'Visible spots (colonies) of bacteria and mold growing.',
    safetyLevel: SafetyLevel.DANGER,
    safetyPrecautions: ['NEVER open plates after growth (could grow pathogens).', 'Dispose of whole plate in trash.'],
    scientificPrinciple: 'Microbes grow rapidly when they have food and warmth.',
    advancedPrinciple: 'Binary fission allows exponential growth of bacterial colonies.',
    realWorldApplication: 'Testing antibiotics, food safety.',
    funFact: 'There are more bacteria in your mouth than people on Earth!',
    learningOutcomes: ['Microbiology', 'Bacterial Growth', 'Hygiene']
  },
  {
    id: 'bio_07',
    title: 'Photosynthesis Measurement',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '30 mins',
    durationMinutes: 30,
    materials: ['Water plant (Elodea)', 'Glass jar', 'Water', 'Lamp/Sunlight'],
    steps: [
      'Place plant in water jar.',
      'Put near strong light.',
      'Watch for tiny bubbles rising from leaves.',
      'Count bubbles per minute.'
    ],
    expectedOutput: 'Stream of bubbles rising from the plant.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['None'],
    scientificPrinciple: 'Plants release oxygen bubbles when making food from light.',
    advancedPrinciple: 'Oxygen is a byproduct of the light-dependent reactions in the thylakoid membranes of chloroplasts.',
    realWorldApplication: 'Oxygen production for space stations.',
    funFact: 'Over 50% of Earth\'s oxygen comes from ocean plants (phytoplankton), not trees!',
    learningOutcomes: ['Photosynthesis', 'Gas Exchange', 'Plant Biology']
  },
  {
    id: 'bio_08',
    title: 'Cell Division Observation',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.ADVANCED,
    duration: '45 mins',
    durationMinutes: 45,
    materials: ['Prepared Onion Root Tip Slide', 'Microscope'],
    steps: [
      'Focus microscope on root tip (where growth happens).',
      'Look for cells with dark chromosomes visible.',
      'Identify stages: Prophase, Metaphase, Anaphase, Telophase.'
    ],
    expectedOutput: 'Cells in different stages of dividing.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Glass handling'],
    scientificPrinciple: 'Cells split in half to create new cells.',
    advancedPrinciple: 'Mitosis is the process of nuclear division, ensuring each daughter cell gets identical genetic material.',
    realWorldApplication: 'Cancer research (uncontrolled cell division).',
    funFact: 'Your body makes 2 million new red blood cells every second!',
    learningOutcomes: ['Mitosis', 'Cell Cycle', 'Chromosomes']
  },
  {
    id: 'bio_09',
    title: 'Protein Precipitation',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['Egg white', 'Rubbing alcohol', 'Lemon juice', 'Hot water', 'Cups'],
    steps: [
      'Put egg white in 3 cups.',
      'Add hot water to one, lemon juice to another, alcohol to third.',
      'Observe white clumps forming.'
    ],
    expectedOutput: 'Clear egg white turns solid white (cooks) chemically.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not eat experiments'],
    scientificPrinciple: 'Heat and acid change the shape of protein molecules.',
    advancedPrinciple: 'Denaturation disrupts the secondary and tertiary structure of proteins, causing them to coagulate.',
    realWorldApplication: 'Cooking food, cheese making.',
    funFact: 'Cooking an egg is just chemical denaturation!',
    learningOutcomes: ['Proteins', 'Denaturation', 'Biochemistry']
  },
  {
    id: 'bio_10',
    title: 'Yeast Fermentation',
    subject: LabType.BIOLOGY,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '1 Hour',
    durationMinutes: 60,
    materials: ['Yeast', 'Sugar', 'Warm water', 'Bottle', 'Balloon'],
    steps: [
      'Mix yeast, sugar, and warm water in bottle.',
      'Put balloon over mouth of bottle.',
      'Wait 30-60 mins.'
    ],
    expectedOutput: 'Balloon inflates on its own.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['None'],
    scientificPrinciple: 'Yeast eats sugar and burps out carbon dioxide gas.',
    advancedPrinciple: 'Anaerobic respiration (Fermentation): C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂.',
    realWorldApplication: 'Making bread rise, brewing fuel ethanol.',
    funFact: 'Yeast is a fungus, related to mushrooms!',
    learningOutcomes: ['Fermentation', 'Respiration', 'Microorganisms']
  },

  // --- PHYSICS (12) ---
  {
    id: 'phys_01',
    title: 'Pendulum Period',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['String', 'Weight (washer)', 'Stopwatch', 'Ruler'],
    steps: [
      'Tie weight to string.',
      'Pull back slightly and release.',
      'Time 10 swings and divide by 10.',
      'Change string length and repeat.'
    ],
    expectedOutput: 'Shorter string = Faster swing. Weight doesn\'t matter.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['None'],
    scientificPrinciple: 'A pendulum\'s timing depends on length, not weight.',
    advancedPrinciple: 'Period T = 2π√(L/g). Mass cancels out in the equation of motion.',
    realWorldApplication: 'Grandfather clocks.',
    funFact: 'A pendulum at the North Pole swings faster than at the Equator because gravity is stronger!',
    learningOutcomes: ['Simple Harmonic Motion', 'Gravity', 'Period']
  },
  {
    id: 'phys_02',
    title: 'Free Fall & Gravity',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '10 mins',
    durationMinutes: 10,
    materials: ['Heavy ball', 'Light ball', 'Ladder/Chair'],
    steps: [
      'Stand safely on chair.',
      'Drop heavy and light ball at EXACT same time.',
      'Listen for them hitting floor.'
    ],
    expectedOutput: 'They hit the ground at the same time.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Fall hazard - be careful on chair'],
    scientificPrinciple: 'Gravity pulls all objects equally, regardless of weight.',
    advancedPrinciple: 'Acceleration due to gravity (g) is constant (~9.8m/s²). Force is proportional to mass (F=ma), so acceleration is independent of mass.',
    realWorldApplication: 'Parachuting (ignoring air resistance).',
    funFact: 'On the Moon, a hammer and feather hit the ground at the same time!',
    learningOutcomes: ['Gravity', 'Acceleration', 'Mass vs Weight']
  },
  {
    id: 'phys_03',
    title: 'Inclined Plane Friction',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '20 mins',
    durationMinutes: 20,
    materials: ['Board (ramp)', 'Toy car', 'Stopwatch', 'Books'],
    steps: [
      'Prop ramp on 1 book.',
      'Time the car rolling down.',
      'Prop ramp on 4 books.',
      'Time the car again.'
    ],
    expectedOutput: 'Steeper ramp makes car go faster.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['None'],
    scientificPrinciple: 'Steeper hills pull things down harder against friction.',
    advancedPrinciple: 'Component of gravitational force parallel to the plane increases with angle (mg sin θ).',
    realWorldApplication: 'Wheelchair ramps, runaway truck ramps.',
    funFact: 'Galileo used ramps to slow down gravity so he could measure it with his pulse!',
    learningOutcomes: ['Forces', 'Friction', 'Vectors']
  },
  {
    id: 'phys_04',
    title: 'Simple Machines: Lever',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['Ruler', 'Pencil (fulcrum)', 'Heavy object', 'Coins'],
    steps: [
      'Put pencil under ruler.',
      'Put heavy object on one end.',
      'Push down on other end to lift it.',
      'Move pencil closer to heavy object and try again.'
    ],
    expectedOutput: 'It gets easier to lift when fulcrum is close to the load.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Pinching fingers'],
    scientificPrinciple: 'Levers trade distance for force.',
    advancedPrinciple: 'Torque balance: Force1 × Distance1 = Force2 × Distance2.',
    realWorldApplication: 'Seesaws, crowbars, scissors.',
    funFact: 'Archimedes said "Give me a lever long enough and I shall move the world."',
    learningOutcomes: ['Mechanical Advantage', 'Torque', 'Work']
  },
  {
    id: 'phys_05',
    title: 'Magnetic Field Visualization',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '10 mins',
    durationMinutes: 10,
    materials: ['Bar magnet', 'Iron filings', 'Paper'],
    steps: [
      'Put magnet on table.',
      'Cover with paper.',
      'Sprinkle filings on paper.',
      'Tap gently.'
    ],
    expectedOutput: 'Filings form curved lines connecting North and South poles.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not eat filings', 'Do not inhale dust'],
    scientificPrinciple: 'Magnets have invisible force fields around them.',
    advancedPrinciple: 'Ferromagnetic materials align with magnetic flux lines.',
    realWorldApplication: 'MRI machines, compasses.',
    funFact: 'Earth is a giant magnet, which is why compasses work!',
    learningOutcomes: ['Magnetism', 'Fields', 'Poles']
  },
  {
    id: 'phys_06',
    title: 'Light Refraction (Prism)',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '10 mins',
    durationMinutes: 10,
    materials: ['Prism (or glass of water)', 'Flashlight', 'White paper'],
    steps: [
      'Darken room.',
      'Shine light through prism onto paper.',
      'Rotate prism until rainbow appears.'
    ],
    expectedOutput: 'White light splits into a rainbow.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Do not look at bright lights'],
    scientificPrinciple: 'Light bends when it enters glass, splitting colors.',
    advancedPrinciple: 'Refraction: Different wavelengths of light bend at different angles (Snell\'s Law) due to speed change in medium.',
    realWorldApplication: 'Rainbows, eyeglasses, fiber optics.',
    funFact: 'Pink is not in the rainbow! It\'s a mix of red and violet that our brain invents.',
    learningOutcomes: ['Optics', 'Refraction', 'Spectrum']
  },
  {
    id: 'phys_07',
    title: 'Density & Buoyancy',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.BEGINNER,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['Bowl of water', 'Orange (peeled vs unpeeled)', 'Aluminum foil'],
    steps: [
      'Put unpeeled orange in water (Floats).',
      'Peel it and put it back (Sinks!).',
      'Ball up foil (sinks). Make boat shape (floats).'
    ],
    expectedOutput: 'Shape and air pockets change ability to float.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['None'],
    scientificPrinciple: 'Objects float if they are lighter than the water they push away.',
    advancedPrinciple: 'Archimedes\' Principle: Buoyant force equals weight of displaced fluid.',
    realWorldApplication: 'Steel ships floating.',
    funFact: 'A bowling ball usually sinks, but a bowling ball made of pumice would float!',
    learningOutcomes: ['Buoyancy', 'Density', 'Displacement']
  },
  {
    id: 'phys_08',
    title: 'Sound Wave Visualization',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['Bowl', 'Plastic wrap', 'Uncooked rice', 'Speaker'],
    steps: [
      'Cover bowl tight with plastic wrap.',
      'Sprinkle rice on top.',
      'Hold near speaker playing bass music.',
      'Watch rice dance.'
    ],
    expectedOutput: 'Rice jumps in patterns based on the sound.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Loud noise'],
    scientificPrinciple: 'Sound is a vibration that travels through air.',
    advancedPrinciple: 'Sound waves transfer energy to the membrane, creating standing wave patterns (Chladni figures).',
    realWorldApplication: 'Eardrums, microphones.',
    funFact: 'Sound travels 4 times faster in water than in air!',
    learningOutcomes: ['Waves', 'Vibration', 'Frequency']
  },
  {
    id: 'phys_09',
    title: 'Collision & Momentum',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.ADVANCED,
    duration: '20 mins',
    durationMinutes: 20,
    materials: ['Marbles', 'Ruler track'],
    steps: [
      'Place marble in middle.',
      'Flick another marble at it.',
      'Observe speed transfer.',
      'Try hitting a row of 3 marbles.'
    ],
    expectedOutput: 'Moving marble stops, stationary marble shoots off.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Choking hazard'],
    scientificPrinciple: 'Movement energy is passed from one object to another.',
    advancedPrinciple: 'Conservation of Momentum: Total momentum of a closed system remains constant.',
    realWorldApplication: 'Billiards/Pool, car crash safety.',
    funFact: 'Newton\'s Cradle is the most famous toy demonstrating this!',
    learningOutcomes: ['Momentum', 'Collisions', 'Energy Transfer']
  },
  {
    id: 'phys_10',
    title: 'Velocity & Acceleration',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: '20 mins',
    durationMinutes: 20,
    materials: ['Ramp', 'Ball', 'Tape measures', 'Stopwatch'],
    steps: [
      'Mark ramp at 1ft, 2ft, 3ft.',
      'Release ball.',
      'Measure time to reach each mark.'
    ],
    expectedOutput: 'Ball covers more distance in less time as it goes down.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['None'],
    scientificPrinciple: 'Gravity makes falling things speed up continuously.',
    advancedPrinciple: 'Uniform acceleration: Distance d = ½at². Velocity increases linearly, distance increases quadratically.',
    realWorldApplication: 'Roller coasters.',
    funFact: 'A skydiver speeds up until air resistance matches gravity (terminal velocity).',
    learningOutcomes: ['Kinematics', 'Speed vs Velocity', 'Acceleration']
  },
  {
    id: 'phys_11',
    title: 'Simple Pendulum Energy',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.ADVANCED,
    duration: '15 mins',
    durationMinutes: 15,
    materials: ['Pendulum', 'Cardboard target'],
    steps: [
      'Hold pendulum to your nose.',
      'Release it (DO NOT PUSH).',
      'Stand still. It will swing back but stop just before your nose.',
      'Now push it and see what happens (don\'t use your nose!).'
    ],
    expectedOutput: 'Pendulum never swings higher than it started.',
    safetyLevel: SafetyLevel.CAUTION,
    safetyPrecautions: ['Don\'t actually hit your nose if you push it'],
    scientificPrinciple: 'Energy cannot be created, only lost to friction.',
    advancedPrinciple: 'Conservation of Energy: PE converts to KE and back. Height cannot increase without added energy.',
    realWorldApplication: 'Demolition wrecking balls.',
    funFact: 'If you push the pendulum, you add energy, and it WILL hit you!',
    learningOutcomes: ['Conservation of Energy', 'Potential Energy', 'Kinetic Energy']
  },
  {
    id: 'phys_12',
    title: 'Pulley Systems',
    subject: LabType.PHYSICS,
    difficulty: DifficultyLevel.ADVANCED,
    duration: '25 mins',
    durationMinutes: 25,
    materials: ['Pulleys (or spools)', 'String', 'Weight (gallon of water)'],
    steps: [
      'Lift weight directly (Heavy).',
      'Rig string through one pulley above (Same weight, better angle).',
      'Rig string through one pulley on weight and one above (Half weight!).'
    ],
    expectedOutput: 'More pulleys make it feel lighter.',
    safetyLevel: SafetyLevel.SAFE,
    safetyPrecautions: ['Heavy lifting'],
    scientificPrinciple: 'Pulleys spread the weight across multiple strings.',
    advancedPrinciple: 'Mechanical Advantage equals the number of rope segments supporting the load.',
    realWorldApplication: 'Cranes, elevators, window blinds.',
    funFact: 'Archimedes used pulleys to pull a ship onto land by himself!',
    learningOutcomes: ['Mechanical Advantage', 'Tension', 'Simple Machines']
  }
];

// --- Helper Functions ---

export const getExperiments = () => experiments;

export const getExperimentById = (id: string) => experiments.find(e => e.id === id);

export const getExperimentsBySubject = (subject: LabType) => {
  return experiments.filter(e => e.subject === subject);
};

export const getExperimentsByDifficulty = (level: DifficultyLevel) => {
  return experiments.filter(e => e.difficulty === level);
};

export const searchExperiments = (query: string): Experiment[] => {
  const lowerQ = query.toLowerCase();
  return experiments.filter(e => 
    e.title.toLowerCase().includes(lowerQ) || 
    e.scientificPrinciple.toLowerCase().includes(lowerQ) ||
    e.materials.some(m => m.toLowerCase().includes(lowerQ))
  );
};

export const getRecommendedExperiments = (level: DifficultyLevel): Experiment[] => {
  return experiments.filter(e => e.difficulty === level).slice(0, 5);
};