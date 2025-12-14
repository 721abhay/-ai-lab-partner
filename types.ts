
export enum ViewState {
  HOME = 'HOME',
  REAL_LAB = 'REAL_LAB',
  VIRTUAL_LAB = 'VIRTUAL_LAB',
  DATA = 'DATA',
  SETTINGS = 'SETTINGS',
  SAFETY_TRAINING = 'SAFETY_TRAINING',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD'
}

export enum LabType {
  CHEMISTRY = 'CHEMISTRY',
  BIOLOGY = 'BIOLOGY',
  PHYSICS = 'PHYSICS',
  NONE = 'NONE'
}

export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum SafetyLevel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGER = 'DANGER',
  EXTREME = 'EXTREME'
}

export enum NarrationMode {
  KID = 'KID',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  SILENT = 'SILENT'
}

export type LanguageCode = 'en-US' | 'es-ES' | 'zh-CN' | 'hi-IN' | 'fr-FR' | 'de-DE' | 'ar-SA';

export interface AppSettings {
  notifications: boolean;
  visuals: {
    brightness: number;
    textSize: 'sm' | 'md' | 'lg';
  };
  audio: boolean;
  narrationMode: NarrationMode;
  language: LanguageCode;
  voiceSpeed: number;
  difficulty: DifficultyLevel;
  defaultMode: ViewState.REAL_LAB | ViewState.VIRTUAL_LAB;
  safetyMode: boolean;
  lowPowerMode: boolean;
  cameraResolution?: 'low' | 'medium' | 'high';
  // Accessibility
  highContrast: boolean;
  colorblindMode: 'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA';
}

// --- VIRTUAL LAB TYPES ---
export interface LabItem {
    id: string;
    name: string;
    type: 'CHEMICAL' | 'EQUIPMENT' | 'TOOL';
    icon: string; // Emoji or icon name
    color?: string; // Hex for 3D model
    quantity?: number; // mL or g
    state?: 'SOLID' | 'LIQUID' | 'GAS';
    temperature?: number;
    contents?: string[]; // IDs of chemicals inside (for beakers)
    x?: number; // 3D Position
    y?: number;
    z?: number;
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    color: string;
    size: number;
    type: 'BUBBLE' | 'SMOKE' | 'FIRE' | 'LIQUID' | 'GAS_CLOUD';
}

// --- ANALYTICS ---
export interface AnalyticsEvent {
    eventName: string;
    properties?: Record<string, any>;
    timestamp: number;
    userId?: string;
    sessionId?: string;
}

export interface UserTraits {
    id: string;
    role: 'student' | 'teacher';
    gradeLevel?: string;
    experimentsCompleted: number;
}

// --- OFFLINE & CONTENT TYPES ---
export type ContentPackId = 'CORE' | 'CHEMISTRY' | 'BIOLOGY' | 'PHYSICS';

export interface ContentPack {
    id: ContentPackId;
    name: string;
    sizeMB: number;
    downloaded: boolean;
    lastUpdated?: Date;
}

export interface StorageStats {
    used: number; // bytes
    quota: number; // bytes
    videoCount: number;
}

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: string;
  summary: string;
  xpos: number;
  ypos: number;
  shells: number[];
  electron_configuration: string;
  electronegativity_pauling?: number;
}

export interface Chemical {
  id: string;
  name: string;
  commonName: string;
  formula: string;
  subject: LabType;
  emoji: string;
  state: 'SOLID' | 'LIQUID' | 'GAS' | 'PLASMA' | 'ITEM';
  density: string;
  boilingPoint: string;
  freezingPoint: string;
  solubility: string;
  pH?: number | string;
  description: string;
  safetyLevel: SafetyLevel;
  healthHazards: string[];
  firstAid: string;
  incompatibleWith: string[];
  storage: string;
  applications: string;
  link: string;
  isAcid?: boolean;
  isBase?: boolean;
  isOxidizer?: boolean;
}

export interface ReactionResult {
  safe: boolean;
  severity: SafetyLevel;
  alertTitle: string;
  alertMessage: string;
  productName?: string;
  visualEffect?: 'EXPLOSION' | 'GAS' | 'BUBBLES' | 'FIRE' | 'NONE' | 'GAS_CLOUD';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface IncidentLog {
  id: string;
  timestamp: Date;
  chem1: string;
  chem2: string;
  outcome: string;
}

export interface Experiment {
  id: string;
  title: string;
  subject: LabType;
  difficulty: DifficultyLevel;
  duration: string;
  durationMinutes: number;
  materials: string[];
  steps: string[];
  expectedOutput: string;
  safetyLevel: SafetyLevel;
  safetyPrecautions: string[];
  scientificPrinciple: string;
  advancedPrinciple?: string;
  realWorldApplication?: string;
  funFact?: string;
  learningOutcomes?: string[];
  ngssCodes?: string[]; 
}

export interface DataPoint {
  timestamp: number;
  timeStr: string;
  intensity: number;
  foamHeight: number;
  bubbleCount: number;
  colorR: number;
  colorG: number;
  colorB: number;
  audioLevel: number;
}

export interface ExperimentSession {
  id: string;
  date: Date;
  name: string;
  data: DataPoint[];
  peakIntensity: number;
  duration: number;
}

export interface PhysicsConstant {
    name: string;
    symbol: string;
    value: string;
    unit: string;
    description: string;
}

// --- TEACHER & CLASSROOM TYPES ---

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel: string;
  avatar: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  subject: LabType;
  studentIds: string[];
  schedule: string;
}

export interface Assignment {
  id: string;
  classId: string;
  experimentId: string;
  title: string;
  dueDate: Date;
  type: 'INDIVIDUAL' | 'GROUP' | 'DEMO';
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED';
  rubric: RubricItem[];
}

export interface RubricItem {
  criteria: string;
  maxPoints: number;
  description: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  submittedDate?: Date;
  timeSpentMinutes: number;
  safetyViolations: number;
  dataQualityScore: number; 
  grade?: number;
  feedback?: string;
  experimentData?: DataPoint[]; 
}

export interface IncidentReport {
    id: string;
    studentId: string;
    studentName: string;
    timestamp: Date;
    severity: SafetyLevel;
    description: string;
    chemicalsInvolved: string[];
    status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
    resolutionNotes?: string;
}

export interface Message {
    id: string;
    senderId: string; 
    receiverId: string; 
    content: string;
    timestamp: Date;
    read: boolean;
}

export interface Announcement {
    id: string;
    classId: string; 
    title: string;
    content: string;
    date: Date;
}

// --- NEW CURRICULUM & RESOURCE TYPES ---

export interface CurriculumTemplate {
    id: string;
    title: string;
    subject: LabType;
    level: 'Beginner' | 'Advanced' | 'AP Prep';
    experimentIds: string[];
    description: string;
    durationWeeks: number;
}

export interface LearningResource {
    id: string;
    title: string;
    type: 'VIDEO' | 'WORKSHEET' | 'ANSWER_KEY' | 'ARTICLE';
    url: string; 
    experimentId?: string; 
    subject: LabType;
}