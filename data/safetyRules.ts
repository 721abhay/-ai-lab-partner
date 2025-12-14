import { Chemical, ReactionResult, SafetyLevel } from '../types';

// Helper to check if ID matches
const is = (c: Chemical, id: string) => c.id === id;
// Helper to check keywords in name/common name
const has = (c: Chemical, term: string) => c.name.toLowerCase().includes(term) || c.commonName.toLowerCase().includes(term);

export const analyzeReaction = (c1: Chemical, c2: Chemical): ReactionResult => {
  const ids = [c1.id, c2.id].sort(); // Sort to handle (A+B) same as (B+A)
  const names = [c1.commonName, c2.commonName].join(' + ');

  // --- SPECIFIC DANGEROUS COMBINATIONS ---

  // 1. Bleach + Ammonia = Chloramine Gas
  if ((has(c1, 'bleach') && has(c2, 'ammonia')) || (has(c2, 'bleach') && has(c1, 'ammonia'))) {
    return {
      safe: false,
      severity: SafetyLevel.EXTREME,
      alertTitle: 'TOXIC GAS ALERT',
      alertMessage: 'Mixing Bleach and Ammonia creates deadly Chloramine gas. Evacuate area immediately if mixed.',
      productName: 'Chloramine Gas',
      visualEffect: 'GAS'
    };
  }

  // 2. Bleach + Acid (Vinegar, Lemon, etc) = Chlorine Gas
  if (has(c1, 'bleach') && (has(c2, 'vinegar') || has(c2, 'acid') || has(c2, 'lemon'))) {
    return {
      safe: false,
      severity: SafetyLevel.EXTREME,
      alertTitle: 'CHLORINE GAS WARNING',
      alertMessage: 'Mixing Bleach with Acids releases toxic Chlorine gas. Causes severe respiratory damage.',
      productName: 'Chlorine Gas',
      visualEffect: 'GAS'
    };
  } else if (has(c2, 'bleach') && (has(c1, 'vinegar') || has(c1, 'acid') || has(c1, 'lemon'))) {
    return {
      safe: false,
      severity: SafetyLevel.EXTREME,
      alertTitle: 'CHLORINE GAS WARNING',
      alertMessage: 'Mixing Bleach with Acids releases toxic Chlorine gas. Causes severe respiratory damage.',
      productName: 'Chlorine Gas',
      visualEffect: 'GAS'
    };
  }

  // 3. Bleach + Rubbing Alcohol = Chloroform
  if ((has(c1, 'bleach') && has(c2, 'alcohol')) || (has(c2, 'bleach') && has(c1, 'alcohol'))) {
    return {
      safe: false,
      severity: SafetyLevel.DANGER,
      alertTitle: 'CHLOROFORM HAZARD',
      alertMessage: 'This combination creates Chloroform and Hydrochloric acid. Highly toxic and dangerous fumes.',
      productName: 'Chloroform',
      visualEffect: 'GAS'
    };
  }

  // 4. Hydrogen Peroxide + Vinegar = Peracetic Acid
  if ((has(c1, 'peroxide') && has(c2, 'vinegar')) || (has(c2, 'peroxide') && has(c1, 'vinegar'))) {
    return {
      safe: false,
      severity: SafetyLevel.DANGER,
      alertTitle: 'CORROSIVE ACID FORMED',
      alertMessage: 'Creates Peracetic Acid, which is highly corrosive and can irritate skin, eyes, and lungs.',
      productName: 'Peracetic Acid',
      visualEffect: 'BUBBLES'
    };
  }

  // 5. Baking Soda + Vinegar (Classic Volcano) - SAFE but messy
  if ((has(c1, 'baking soda') && has(c2, 'vinegar')) || (has(c2, 'baking soda') && has(c1, 'vinegar'))) {
    return {
      safe: true,
      severity: SafetyLevel.SAFE,
      alertTitle: 'SAFE REACTION',
      alertMessage: 'Carbon Dioxide gas is released. Safe to mix, but can overflow containers.',
      productName: 'Carbon Dioxide + Water',
      visualEffect: 'BUBBLES'
    };
  }

  // 6. Calcium Chloride + Water = Exothermic
  if ((has(c1, 'calcium chloride') && has(c2, 'water')) || (has(c2, 'calcium chloride') && has(c1, 'water'))) {
    return {
      safe: true,
      severity: SafetyLevel.CAUTION,
      alertTitle: 'EXOTHERMIC REACTION',
      alertMessage: 'Generates significant heat. Handle glass containers with care.',
      visualEffect: 'BUBBLES'
    };
  }

  // 7. Iodine + Ammonia = Nitrogen Triiodide (Explosive when dry)
  if ((has(c1, 'iodine') && has(c2, 'ammonia')) || (has(c2, 'iodine') && has(c1, 'ammonia'))) {
    return {
      safe: false,
      severity: SafetyLevel.EXTREME,
      alertTitle: 'EXPLOSIVE HAZARD',
      alertMessage: 'Creates Nitrogen Triiodide, a contact explosive that is highly unstable when dry.',
      visualEffect: 'EXPLOSION'
    };
  }

  // 8. Iodine + Cornstarch = Blue/Black Complex (Safe)
  if ((has(c1, 'iodine') && has(c2, 'cornstarch')) || (has(c2, 'iodine') && has(c1, 'cornstarch'))) {
    return {
      safe: true,
      severity: SafetyLevel.SAFE,
      alertTitle: 'COLOR CHANGE',
      alertMessage: 'Indicators starch presence by turning dark blue/black.',
      visualEffect: 'NONE'
    };
  }

  // 9. Water + Acid (Generic Rule: Add Acid to Water, not Water to Acid)
  // Checking mainly for strong acids if we add them, but vinegar is weak.
  if ((c1.formula === 'H₂O' && c2.safetyLevel === SafetyLevel.DANGER) || (c2.formula === 'H₂O' && c1.safetyLevel === SafetyLevel.DANGER)) {
     return {
        safe: false,
        severity: SafetyLevel.CAUTION,
        alertTitle: 'SPLASH HAZARD',
        alertMessage: 'Always add Acid to Water, never Water to Acid to prevent boiling splashes.',
        visualEffect: 'BUBBLES'
     };
  }
  
  // 10. Sodium Bicarbonate + Calcium Chloride = Chalk + Salt + CO2
  if ((has(c1, 'baking soda') && has(c2, 'calcium chloride')) || (has(c2, 'baking soda') && has(c1, 'calcium chloride'))) {
      return {
          safe: true,
          severity: SafetyLevel.SAFE,
          alertTitle: 'PRECIPITATE FORMED',
          alertMessage: 'Forms white Calcium Carbonate (chalk) precipitate and gas.',
          visualEffect: 'BUBBLES'
      };
  }

  // 11. Generic Incompatibility Check from Database
  const conflict = c1.incompatibleWith.find(i => c2.commonName.toLowerCase().includes(i.toLowerCase()) || c2.name.toLowerCase().includes(i.toLowerCase()));
  if (conflict) {
      return {
          safe: false,
          severity: SafetyLevel.DANGER,
          alertTitle: 'INCOMPATIBLE MATERIALS',
          alertMessage: `${c1.commonName} is listed as incompatible with ${c2.commonName}. Do not mix.`,
          visualEffect: 'NONE'
      };
  }
  
  const conflict2 = c2.incompatibleWith.find(i => c1.commonName.toLowerCase().includes(i.toLowerCase()) || c1.name.toLowerCase().includes(i.toLowerCase()));
  if (conflict2) {
      return {
          safe: false,
          severity: SafetyLevel.DANGER,
          alertTitle: 'INCOMPATIBLE MATERIALS',
          alertMessage: `${c2.commonName} is listed as incompatible with ${c1.commonName}. Do not mix.`,
          visualEffect: 'NONE'
      };
  }

  // Default Safe
  return {
    safe: true,
    severity: SafetyLevel.SAFE,
    alertTitle: 'NO REACTION PREDICTED',
    alertMessage: `Mixing ${c1.commonName} and ${c2.commonName} is generally considered safe or non-reactive in this context.`,
    visualEffect: 'NONE'
  };
};