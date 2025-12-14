
import { LabItem, LabType } from '../types';

export const SHELF_ITEMS: Record<LabType, { chemicals: LabItem[], equipment: LabItem[] }> = {
    [LabType.CHEMISTRY]: {
        chemicals: [
            { id: 'chem_vinegar', name: 'Vinegar', type: 'CHEMICAL', icon: '🏺', color: '#fef3c7', state: 'LIQUID', quantity: 500 },
            { id: 'chem_baking_soda', name: 'Baking Soda', type: 'CHEMICAL', icon: '🧂', color: '#ffffff', state: 'SOLID', quantity: 200 },
            { id: 'chem_bleach', name: 'Bleach', type: 'CHEMICAL', icon: '🧪', color: '#fef9c3', state: 'LIQUID', quantity: 500 },
            { id: 'chem_ammonia', name: 'Ammonia', type: 'CHEMICAL', icon: '🧴', color: '#bfdbfe', state: 'LIQUID', quantity: 500 },
            { id: 'chem_peroxide', name: 'Hydrogen Peroxide', type: 'CHEMICAL', icon: '🫧', color: '#e0f2fe', state: 'LIQUID', quantity: 250 },
            { id: 'chem_dye_red', name: 'Red Dye', type: 'CHEMICAL', icon: '🔴', color: '#ef4444', state: 'LIQUID', quantity: 50 },
            { id: 'chem_dye_blue', name: 'Blue Dye', type: 'CHEMICAL', icon: '🔵', color: '#3b82f6', state: 'LIQUID', quantity: 50 },
            { id: 'chem_yeast', name: 'Yeast', type: 'CHEMICAL', icon: '🍞', color: '#d4a373', state: 'SOLID', quantity: 100 },
            { id: 'chem_soap', name: 'Dish Soap', type: 'CHEMICAL', icon: '🧼', color: '#10b981', state: 'LIQUID', quantity: 300 },
            { id: 'chem_water', name: 'Water', type: 'CHEMICAL', icon: '💧', color: '#38bdf8', state: 'LIQUID', quantity: 1000 },
        ],
        equipment: [
            { id: 'eq_beaker', name: 'Beaker (250ml)', type: 'EQUIPMENT', icon: '🥛', color: '#ffffff', contents: [] },
            { id: 'eq_flask', name: 'Flask', type: 'EQUIPMENT', icon: '🏺', color: '#ffffff', contents: [] },
            { id: 'eq_burner', name: 'Bunsen Burner', type: 'TOOL', icon: '🔥', color: '#333333' },
            { id: 'eq_thermometer', name: 'Thermometer', type: 'TOOL', icon: '🌡️', color: '#ef4444' },
            { id: 'eq_rod', name: 'Stirring Rod', type: 'TOOL', icon: '🥢', color: '#9ca3af' },
            { id: 'eq_scale', name: 'Digital Scale', type: 'TOOL', icon: '⚖️', color: '#cbd5e1' },
        ]
    },
    [LabType.BIOLOGY]: {
        chemicals: [
            { id: 'bio_water', name: 'Distilled Water', type: 'CHEMICAL', icon: '💧', color: '#38bdf8', state: 'LIQUID' },
            { id: 'bio_iodine', name: 'Iodine Stain', type: 'CHEMICAL', icon: '🟤', color: '#92400e', state: 'LIQUID' },
            { id: 'bio_blue', name: 'Methylene Blue', type: 'CHEMICAL', icon: '🔵', color: '#1e3a8a', state: 'LIQUID' },
            { id: 'bio_alcohol', name: 'Alcohol', type: 'CHEMICAL', icon: '🩹', color: '#ffffff', state: 'LIQUID' },
        ],
        equipment: [
            { id: 'eq_microscope', name: 'Microscope', type: 'TOOL', icon: '🔬', color: '#333333' },
            { id: 'eq_slide_onion', name: 'Slide: Onion', type: 'EQUIPMENT', icon: '🧅', color: '#ffffff' },
            { id: 'eq_slide_cheek', name: 'Slide: Cheek', type: 'EQUIPMENT', icon: '🧬', color: '#ffffff' },
            { id: 'eq_petri', name: 'Petri Dish', type: 'EQUIPMENT', icon: '🧫', color: '#ffffff' },
            { id: 'eq_dropper', name: 'Pipette', type: 'TOOL', icon: '🧪', color: '#ffffff' },
        ]
    },
    [LabType.PHYSICS]: {
        chemicals: [], 
        equipment: [
            // Tools
            { id: 'tool_ruler', name: 'Ruler (1m)', type: 'TOOL', icon: '📏', color: '#facc15' },
            { id: 'tool_stopwatch', name: 'Stopwatch', type: 'TOOL', icon: '⏱️', color: '#334155' },
            { id: 'tool_scale', name: 'Digital Scale', type: 'TOOL', icon: '⚖️', color: '#94a3b8' },
            { id: 'tool_force', name: 'Force Gauge', type: 'TOOL', icon: '💪', color: '#ef4444' },
            { id: 'tool_thermometer', name: 'Thermometer', type: 'TOOL', icon: '🌡️', color: '#ef4444' },
            
            // Experiment Items
            { id: 'phys_ball_steel', name: 'Steel Ball', type: 'EQUIPMENT', icon: '⚪', color: '#94a3b8' },
            { id: 'phys_ball_wood', name: 'Wood Ball', type: 'EQUIPMENT', icon: '🟤', color: '#d4a373' },
            { id: 'phys_ramp', name: 'Ramp', type: 'TOOL', icon: '📐', color: '#888888' },
            { id: 'phys_spring', name: 'Spring', type: 'TOOL', icon: '➰', color: '#64748b' },
            { id: 'phys_pendulum', name: 'Pendulum', type: 'TOOL', icon: '🕰️', color: '#333333' },
            { id: 'phys_magnet', name: 'Magnet', type: 'TOOL', icon: '🧲', color: '#ef4444' },
            { id: 'phys_prism', name: 'Glass Prism', type: 'TOOL', icon: '💎', color: '#a5f3fc' },
        ]
    },
    [LabType.NONE]: {
        chemicals: [],
        equipment: []
    }
};
