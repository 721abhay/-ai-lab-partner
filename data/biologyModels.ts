export type BioType = 'CELL_ANIMAL' | 'MITOSIS' | 'DNA' | 'ENZYME' | 'PHOTOSYNTHESIS';

export interface BioLabel {
    id: string;
    title: string;
    description: string;
}

export interface BiologyModel {
    id: string; // Experiment ID
    type: BioType;
    name: string;
    description: string;
    labels: BioLabel[]; // Interactive parts
}

export const BIOLOGY_MODELS: Record<string, BiologyModel> = {
    'bio_02': {
        id: 'bio_02',
        type: 'CELL_ANIMAL',
        name: 'Animal Cell Structure',
        description: 'Interactive 3D Cutaway of an Animal Cell',
        labels: [
            { id: 'nucleus', title: 'Nucleus', description: 'The control center containing DNA.' },
            { id: 'mitochondria', title: 'Mitochondria', description: 'Powerhouse of the cell; generates ATP energy.' },
            { id: 'ribosome', title: 'Ribosomes', description: 'Tiny factories that synthesize proteins.' },
            { id: 'er', title: 'Endoplasmic Reticulum', description: 'Network for protein and lipid synthesis/transport.' },
            { id: 'golgi', title: 'Golgi Apparatus', description: 'Modifies, sorts, and packages proteins.' },
            { id: 'lysosome', title: 'Lysosome', description: 'Digestive system of the cell.' }
        ]
    },
    'bio_08': {
        id: 'bio_08',
        type: 'MITOSIS',
        name: 'Cell Division (Mitosis)',
        description: 'The process of a cell dividing into two identical daughter cells.',
        labels: [
            { id: 'prophase', title: 'Prophase', description: 'Chromosomes condense, nuclear envelope breaks down.' },
            { id: 'metaphase', title: 'Metaphase', description: 'Chromosomes align at the cell equator.' },
            { id: 'anaphase', title: 'Anaphase', description: 'Sister chromatids pull apart to opposite poles.' },
            { id: 'telophase', title: 'Telophase', description: 'Nuclear membranes reform, cell divides (cytokinesis).' }
        ]
    },
    'bio_03': {
        id: 'bio_03',
        type: 'DNA',
        name: 'DNA Double Helix',
        description: 'Deoxyribonucleic acid structure and base pairing.',
        labels: [
            { id: 'backbone', title: 'Sugar-Phosphate Backbone', description: 'Structural framework of DNA.' },
            { id: 'base_at', title: 'Adenine-Thymine', description: 'Base pair held by 2 hydrogen bonds.' },
            { id: 'base_gc', title: 'Guanine-Cytosine', description: 'Base pair held by 3 hydrogen bonds.' }
        ]
    },
    'bio_04': {
        id: 'bio_04',
        type: 'ENZYME',
        name: 'Enzyme Action',
        description: 'Lock and Key model of enzyme catalysis.',
        labels: [
            { id: 'enzyme', title: 'Enzyme', description: 'Protein catalyst with an active site.' },
            { id: 'substrate', title: 'Substrate', description: 'Reactant that fits into the enzyme.' },
            { id: 'product', title: 'Product', description: 'Result of the reaction released by the enzyme.' }
        ]
    },
    'bio_07': {
        id: 'bio_07',
        type: 'PHOTOSYNTHESIS',
        name: 'Photosynthesis',
        description: 'Conversion of light energy into chemical energy in chloroplasts.',
        labels: [
            { id: 'chloroplast', title: 'Chloroplast', description: 'Organelle where photosynthesis occurs.' },
            { id: 'photon', title: 'Light Energy', description: 'Photons absorbed by chlorophyll.' },
            { id: 'h2o', title: 'Water Splitting', description: 'Produces Oxygen and Protons.' }
        ]
    }
};

export const getBiologyModel = (id: string): BiologyModel | null => {
    return BIOLOGY_MODELS[id] || null;
};