
import { NarrationMode } from '../types';

export interface NarrationScript {
    intro: string;
    steps: string[];
    conclusion: string;
}

// Default fallback generator if no specific script exists
export const generateDefaultScript = (title: string, steps: string[], principle: string, mode: NarrationMode): NarrationScript => {
    if (mode === NarrationMode.KID) {
        return {
            intro: `Hi there! Today we are going to do a super cool experiment called ${title}! Put on your safety goggles!`,
            steps: steps.map(s => `Okay, next: ${s}. You're doing great!`),
            conclusion: `Yay! We did it! ${principle} That was awesome!`
        };
    } else if (mode === NarrationMode.TEACHER) {
        return {
            intro: `Welcome class. Today's module is ${title}. Please verify your safety equipment is ready.`,
            steps: steps.map(s => `Proceed to the next phase: ${s}. Observe carefully.`),
            conclusion: `Experiment concluded. Analysis: ${principle}. Please record your data.`
        };
    } else {
        // Student
        return {
            intro: `Starting experiment: ${title}.`,
            steps: steps,
            conclusion: `Finished. Principle demonstrated: ${principle}.`
        };
    }
};

// Specific scripts for popular experiments
export const NARRATION_SCRIPTS: Record<string, Record<NarrationMode, NarrationScript>> = {
    'chem_01': { // Volcano
        [NarrationMode.KID]: {
            intro: "Are you ready to make a mountain explode? We're building a Volcano! Grab your baking soda and vinegar!",
            steps: [
                "First, put your container on a tray so we don't make a mess.",
                "Now, dump in two big spoons of baking soda. That's our mountain base!",
                "Add a squirt of dish soap and some red food coloring to make it look like lava!",
                "Here comes the fun part! Pour in the vinegar fast and watch out!"
            ],
            conclusion: "Boom! Did you see that lava flow? The vinegar and baking soda mixed to make super fizzy gas bubbles!"
        },
        [NarrationMode.STUDENT]: {
            intro: "We will be observing an acid-base reaction using sodium bicarbonate and acetic acid.",
            steps: [
                "Secure the reaction vessel on a spill tray.",
                "Add sodium bicarbonate to the vessel.",
                "Add surfactant and dye for visual tracking.",
                "Add acetic acid rapidly to initiate the reaction."
            ],
            conclusion: "Reaction complete. The decomposition produced carbon dioxide gas, creating the foam eruption."
        },
        [NarrationMode.TEACHER]: {
            intro: "Today's demonstration illustrates gas evolution. We will mix a weak acid and a weak base.",
            steps: [
                "Prepare the containment area.",
                "Introduce the solid reactant, NaHCO3.",
                "Add visual indicators and surfactant to trap the gas.",
                "Introduce the liquid reactant, CH3COOH, to catalyze the release of CO2."
            ],
            conclusion: "Observe the stoichiometry in action. The rate of gas production correlates to the concentration of reactants."
        },
        [NarrationMode.SILENT]: { intro: "", steps: [], conclusion: "" }
    },
    'chem_03': { // Elephant Toothpaste
        [NarrationMode.KID]: {
            intro: "Let's make toothpaste for an ELEPHANT! It's going to be huge and foamy!",
            steps: [
                "Mix the yeast with warm water. This wakes up the tiny yeast helpers!",
                "Pour the peroxide into a bottle. Be careful!",
                "Add soap and colors. Make it pretty!",
                "Pour in the yeast water and stand back! Here it comes!"
            ],
            conclusion: "Wow! Look at all that foam! The yeast helped the bubbles escape super fast!"
        },
        [NarrationMode.STUDENT]: {
            intro: "We are catalyzing the decomposition of hydrogen peroxide using yeast.",
            steps: [
                "Activate the yeast catalyst with warm water.",
                "Prepare the substrate: Hydrogen Peroxide in the flask.",
                "Add surfactant to trap oxygen bubbles.",
                "Add the catalyst and observe the exothermic reaction."
            ],
            conclusion: "Success. The catalase enzyme rapidly broke down the peroxide into water and oxygen gas."
        },
        [NarrationMode.TEACHER]: {
            intro: "This experiment demonstrates enzymatic catalysis using catalase found in yeast.",
            steps: [
                "Hydrate the biological catalyst.",
                "Prepare the H2O2 solution.",
                "Add indicators.",
                "Initiate the reaction. Note the heat generation."
            ],
            conclusion: "The rapid evolution of O2 gas demonstrates the efficiency of biological catalysts compared to inorganic ones."
        },
        [NarrationMode.SILENT]: { intro: "", steps: [], conclusion: "" }
    }
};
