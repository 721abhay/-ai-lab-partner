
export type PhysicsType = 'PENDULUM' | 'FREE_FALL' | 'INCLINED_PLANE' | 'MAGNET' | 'REFRACTION' | 'SOUND' | 'SPRING' | 'COLLISION' | 'WAVE';

export interface PhysicsModel {
    id: string; // Experiment ID
    type: PhysicsType;
    name: string;
    params: {
        [key: string]: number | string | boolean;
    };
    labels: string[];
}

export const PHYSICS_MODELS: Record<string, PhysicsModel> = {
    'phys_01': {
        id: 'phys_01',
        type: 'PENDULUM',
        name: 'Simple Pendulum',
        params: { length: 2, gravity: 9.8, startAngle: Math.PI / 4 },
        labels: ['Period: T = 2π√(L/g)', 'PE + KE = Constant']
    },
    'phys_02': {
        id: 'phys_02',
        type: 'FREE_FALL',
        name: 'Free Fall & Gravity',
        params: { height: 10, gravity: 9.8 },
        labels: ['g = 9.8 m/s²', 'v = gt', 'd = ½gt²']
    },
    'phys_03': {
        id: 'phys_03',
        type: 'INCLINED_PLANE',
        name: 'Inclined Plane Forces',
        params: { angle: 30, friction: 0.1 },
        labels: ['F_net = mg sin(θ) - F_fric']
    },
    'phys_05': {
        id: 'phys_05',
        type: 'MAGNET',
        name: 'Magnetic Field',
        params: { strength: 1 },
        labels: ['North to South Field Lines']
    },
    'phys_06': {
        id: 'phys_06',
        type: 'REFRACTION',
        name: 'Light Refraction',
        params: { ior1: 1.0, ior2: 1.5, angle: 45 },
        labels: ['Snell\'s Law: n₁sinθ₁ = n₂sinθ₂']
    },
    'phys_08': {
        id: 'phys_08',
        type: 'WAVE',
        name: 'Standing Waves',
        params: { frequency: 2, amplitude: 1, tension: 10 },
        labels: ['v = fλ', 'Nodes & Antinodes']
    },
    'phys_09': {
        id: 'phys_09',
        type: 'COLLISION',
        name: 'Elastic Collision',
        params: { m1: 2, v1: 3, m2: 2, v2: -3, elasticity: 1 },
        labels: ['p_total = p1 + p2 = constant']
    },
    'phys_10': { // Reusing FREE_FALL logic but different label/focus
        id: 'phys_10',
        type: 'FREE_FALL',
        name: 'Velocity & Acceleration',
        params: { height: 20, gravity: 9.8 },
        labels: ['v = at', 'x = ½at²']
    },
    'phys_11': { // Reusing PENDULUM logic
        id: 'phys_11',
        type: 'PENDULUM',
        name: 'Energy Conservation',
        params: { length: 3, gravity: 9.8, startAngle: Math.PI / 3 },
        labels: ['E_tot = PE + KE']
    },
    'phys_spring': { // Custom ID for generic spring tool if not in experiment list
        id: 'spring_demo',
        type: 'SPRING',
        name: 'Hooke\'s Law',
        params: { k: 5, mass: 2, damping: 0.05 },
        labels: ['F = -kx', 'SHM']
    }
};

export const getPhysicsModel = (id: string): PhysicsModel | null => {
    return PHYSICS_MODELS[id] || null;
};
