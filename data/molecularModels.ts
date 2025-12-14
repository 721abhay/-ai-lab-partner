// Data for 3D Molecular Visualizations

export interface AtomData {
    id: string;
    element: 'H' | 'C' | 'O' | 'Na' | 'Cl' | 'N';
    x: number;
    y: number;
    z: number;
    radius: number;
    color: string;
    // Atomic Properties
    atomicNumber: number;
    atomicMass: number;
    electronegativity: number;
}

export interface ReactionStage {
    label: string;
    atoms: AtomData[];
    bonds: [string, string][]; // IDs of connected atoms
    description: string;
}

export interface ReactionModel {
    id: string;
    name: string;
    equation: string;
    enthalpy?: string; // e.g. -98 kJ/mol
    visualEffect?: 'NONE' | 'BUBBLES' | 'GAS_CLOUD';
    reactants: ReactionStage;
    products: ReactionStage;
}

// CPK Coloring & Atomic Data
const ATOM_DEFS = {
    H: { color: '#FFFFFF', radius: 0.3, num: 1, mass: 1.008, en: 2.20 },
    C: { color: '#909090', radius: 0.5, num: 6, mass: 12.011, en: 2.55 },
    N: { color: '#3050F8', radius: 0.5, num: 7, mass: 14.007, en: 3.04 },
    O: { color: '#FF0D0D', radius: 0.45, num: 8, mass: 15.999, en: 3.44 },
    Na: { color: '#AB5CF2', radius: 0.6, num: 11, mass: 22.990, en: 0.93 },
    Cl: { color: '#1FF01F', radius: 0.55, num: 17, mass: 35.45, en: 3.16 },
};

const createAtom = (id: string, element: keyof typeof ATOM_DEFS, x: number, y: number, z: number): AtomData => {
    const def = ATOM_DEFS[element];
    return {
        id,
        element,
        x, y, z,
        radius: def.radius,
        color: def.color,
        atomicNumber: def.num,
        atomicMass: def.mass,
        electronegativity: def.en
    };
};

// 1. Vinegar (CH3COOH) + Baking Soda (NaHCO3)
export const VINEGAR_BAKING_SODA: ReactionModel = {
    id: 'chem_01',
    name: 'Vinegar + Baking Soda',
    equation: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂',
    enthalpy: '+28 kJ/mol (Endothermic)',
    visualEffect: 'BUBBLES',
    reactants: {
        label: 'Reactants',
        description: 'Acetic Acid (Vinegar) meets Sodium Bicarbonate (Baking Soda)',
        atoms: [
            // Acetic Acid
            createAtom('aa_c1', 'C', -2, 0, 0),
            createAtom('aa_h1', 'H', -2.6, 0.5, 0),
            createAtom('aa_h2', 'H', -2, -0.5, 0.5),
            createAtom('aa_h3', 'H', -2, -0.5, -0.5),
            createAtom('aa_c2', 'C', -1, 0, 0),
            createAtom('aa_o1', 'O', -0.5, 1, 0),
            createAtom('aa_o2', 'O', -0.5, -1, 0),
            createAtom('aa_h4', 'H', 0.2, -0.8, 0),
            // Sodium Bicarbonate
            createAtom('sb_na', 'Na', 2.5, 0.5, 0),
            createAtom('sb_o1', 'O', 1.5, 0, 0),
            createAtom('sb_c1', 'C', 2, -1, 0),
            createAtom('sb_o2', 'O', 2.5, -2, 0),
            createAtom('sb_o3', 'O', 1, -1.5, 0),
            createAtom('sb_h1', 'H', 0.5, -0.8, 0),
        ],
        bonds: [
            ['aa_c1', 'aa_h1'], ['aa_c1', 'aa_h2'], ['aa_c1', 'aa_h3'], ['aa_c1', 'aa_c2'],
            ['aa_c2', 'aa_o1'], ['aa_c2', 'aa_o2'], ['aa_o2', 'aa_h4'],
            ['sb_c1', 'sb_o1'], ['sb_c1', 'sb_o2'], ['sb_c1', 'sb_o3'], ['sb_o3', 'sb_h1']
        ]
    },
    products: {
        label: 'Products',
        description: 'Sodium Acetate + Water + Carbon Dioxide Gas',
        atoms: [
            // Sodium Acetate
            createAtom('aa_c1', 'C', -2, 0, 0),
            createAtom('aa_h1', 'H', -2.6, 0.5, 0),
            createAtom('aa_h2', 'H', -2, -0.5, 0.5),
            createAtom('aa_h3', 'H', -2, -0.5, -0.5),
            createAtom('aa_c2', 'C', -1, 0, 0),
            createAtom('aa_o1', 'O', -0.5, 1, 0),
            createAtom('aa_o2', 'O', -0.5, -1, 0),
            createAtom('sb_na', 'Na', 0.5, -1, 0), // Na moved
            // Water
            createAtom('sb_o3', 'O', 2, 2, 0),
            createAtom('sb_h1', 'H', 1.5, 2.5, 0),
            createAtom('aa_h4', 'H', 2.5, 2.5, 0), // H moved
            // CO2
            createAtom('sb_c1', 'C', 3, -1, 0),
            createAtom('sb_o1', 'O', 3, -0.2, 0),
            createAtom('sb_o2', 'O', 3, -1.8, 0),
        ],
        bonds: [
            ['aa_c1', 'aa_h1'], ['aa_c1', 'aa_h2'], ['aa_c1', 'aa_h3'], ['aa_c1', 'aa_c2'],
            ['aa_c2', 'aa_o1'], ['aa_c2', 'aa_o2'],
            ['sb_o3', 'sb_h1'], ['sb_o3', 'aa_h4'],
            ['sb_c1', 'sb_o1'], ['sb_c1', 'sb_o2']
        ]
    }
};

// 2. Hydrogen Peroxide Decomposition
export const HYDROGEN_PEROXIDE_DECOMPOSITION: ReactionModel = {
    id: 'bio_04', // Also chem_03
    name: 'Hydrogen Peroxide Decomposition',
    equation: '2H₂O₂ → 2H₂O + O₂',
    enthalpy: '-196 kJ/mol (Exothermic)',
    visualEffect: 'BUBBLES',
    reactants: {
        label: 'Reactants',
        description: 'Two Hydrogen Peroxide molecules (unstable)',
        atoms: [
            // Mol 1
            createAtom('m1_o1', 'O', -1, 0.5, 0),
            createAtom('m1_o2', 'O', -1.5, -0.5, 0.5),
            createAtom('m1_h1', 'H', -0.2, 0.5, -0.2),
            createAtom('m1_h2', 'H', -2.2, -0.5, 0.7),
            // Mol 2
            createAtom('m2_o1', 'O', 1, 0.5, 0),
            createAtom('m2_o2', 'O', 1.5, -0.5, -0.5),
            createAtom('m2_h1', 'H', 0.2, 0.5, 0.2),
            createAtom('m2_h2', 'H', 2.2, -0.5, -0.7),
        ],
        bonds: [
            ['m1_o1', 'm1_o2'], ['m1_o1', 'm1_h1'], ['m1_o2', 'm1_h2'],
            ['m2_o1', 'm2_o2'], ['m2_o1', 'm2_h1'], ['m2_o2', 'm2_h2']
        ]
    },
    products: {
        label: 'Products',
        description: 'Two Water molecules and Oxygen gas',
        atoms: [
            // Water 1
            createAtom('m1_o1', 'O', -1.5, -1, 0),
            createAtom('m1_h1', 'H', -0.8, -0.5, 0),
            createAtom('m1_h2', 'H', -2.2, -0.5, 0),
            // Water 2
            createAtom('m2_o1', 'O', 1.5, -1, 0),
            createAtom('m2_h1', 'H', 0.8, -0.5, 0),
            createAtom('m2_h2', 'H', 2.2, -0.5, 0),
            // Oxygen Gas (O2) - Rising
            createAtom('m1_o2', 'O', -0.3, 2, 0),
            createAtom('m2_o2', 'O', 0.3, 2, 0),
        ],
        bonds: [
            ['m1_o1', 'm1_h1'], ['m1_o1', 'm1_h2'], // H2O
            ['m2_o1', 'm2_h1'], ['m2_o1', 'm2_h2'], // H2O
            ['m1_o2', 'm2_o2'] // O=O
        ]
    }
};

// 3. Bleach + Ammonia (Hazard)
export const BLEACH_AMMONIA: ReactionModel = {
    id: 'chem_hazard_01',
    name: 'Bleach + Ammonia',
    equation: 'NaOCl + NH₃ → NH₂Cl + NaOH',
    enthalpy: 'Exothermic',
    visualEffect: 'GAS_CLOUD',
    reactants: {
        label: 'Reactants',
        description: 'Sodium Hypochlorite (Bleach) and Ammonia',
        atoms: [
            // Bleach (NaOCl)
            createAtom('bl_na', 'Na', -2, 0, 0),
            createAtom('bl_o', 'O', -1, 0, 0),
            createAtom('bl_cl', 'Cl', -0.5, 1, 0),
            // Ammonia (NH3)
            createAtom('am_n', 'N', 2, 0, 0),
            createAtom('am_h1', 'H', 2, 1, 0),
            createAtom('am_h2', 'H', 1.2, -0.5, 0.5),
            createAtom('am_h3', 'H', 2.8, -0.5, 0.5),
        ],
        bonds: [
            ['bl_o', 'bl_cl'], // O-Cl bond in Hypochlorite ion
            ['am_n', 'am_h1'], ['am_n', 'am_h2'], ['am_n', 'am_h3']
        ]
    },
    products: {
        label: 'Products',
        description: 'TOXIC Chloramine Gas and Sodium Hydroxide',
        atoms: [
            // Chloramine (NH2Cl) - Toxic Gas
            createAtom('am_n', 'N', 0, 2, 0),
            createAtom('am_h1', 'H', -0.8, 2.2, 0),
            createAtom('am_h2', 'H', 0.8, 2.2, 0),
            createAtom('bl_cl', 'Cl', 0, 3, 0), // Cl joined N
            // Sodium Hydroxide (NaOH)
            createAtom('bl_na', 'Na', -1.5, -2, 0),
            createAtom('bl_o', 'O', -0.5, -2, 0),
            createAtom('am_h3', 'H', 0.2, -1.8, 0), // H from ammonia joined O
        ],
        bonds: [
            ['am_n', 'am_h1'], ['am_n', 'am_h2'], ['am_n', 'bl_cl'], // Chloramine
            ['bl_o', 'am_h3'] // Hydroxide
        ]
    }
};

export const getReactionModel = (experimentId: string): ReactionModel | null => {
    switch (experimentId) {
        case 'chem_01': return VINEGAR_BAKING_SODA;
        case 'chem_03': return HYDROGEN_PEROXIDE_DECOMPOSITION;
        case 'bio_04': return HYDROGEN_PEROXIDE_DECOMPOSITION;
        case 'hazard_mix': return BLEACH_AMMONIA;
        default: return null;
    }
};