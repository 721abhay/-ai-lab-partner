import { analyzeReaction } from '../data/safetyRules';
import { SafetyLevel, Chemical } from '../types';

// Add declarations for test runner (Jest/Mocha) since types might be missing
declare var describe: (name: string, fn: () => void) => void;
declare var test: (name: string, fn: () => void) => void;

// Mock Chemical Factory
const createChem = (name: string, id: string, incompatibleWith: string[] = []): Chemical => ({
    id, name, commonName: name, formula: 'X', subject: 'CHEMISTRY' as any,
    emoji: '🧪', state: 'LIQUID', density: '1', boilingPoint: '100', freezingPoint: '0',
    solubility: 'Soluble', description: 'Test Chem', safetyLevel: SafetyLevel.SAFE,
    healthHazards: [], firstAid: 'N/A', incompatibleWith, storage: 'Shelf', applications: 'Test', link: ''
});

describe('Safety Analysis System', () => {
    
    test('Identifies Bleach + Ammonia as EXTREME danger', () => {
        const bleach = createChem('Bleach', 'c1');
        const ammonia = createChem('Ammonia', 'c2');
        const result = analyzeReaction(bleach, ammonia);
        
        if (result.severity !== SafetyLevel.EXTREME) {
            throw new Error(`Expected EXTREME severity, got ${result.severity}`);
        }
        if (!result.alertTitle.includes('TOXIC GAS')) {
            throw new Error('Expected Toxic Gas alert');
        }
    });

    test('Identifies Baking Soda + Vinegar as SAFE', () => {
        const soda = createChem('Baking Soda', 'c3');
        const vinegar = createChem('Vinegar', 'c4');
        const result = analyzeReaction(soda, vinegar);

        if (result.severity !== SafetyLevel.SAFE) {
            throw new Error(`Expected SAFE, got ${result.severity}`);
        }
    });

    test('Respects Generic Incompatibility List', () => {
        const chemA = createChem('Chemical A', 'cA', ['Chemical B']);
        const chemB = createChem('Chemical B', 'cB');
        
        const result = analyzeReaction(chemA, chemB);
        
        if (result.severity !== SafetyLevel.DANGER) {
            throw new Error(`Expected DANGER from generic list, got ${result.severity}`);
        }
    });

});