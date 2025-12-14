
import { Classroom, Student, Assignment, Submission, LabType, IncidentReport, SafetyLevel, Message, Announcement, CurriculumTemplate, LearningResource } from '../types';

export const MOCK_STUDENTS: Student[] = [
    { id: 's1', name: 'Alice Chen', email: 'alice@school.edu', gradeLevel: '10th', avatar: 'AC' },
    { id: 's2', name: 'Bob Smith', email: 'bob@school.edu', gradeLevel: '10th', avatar: 'BS' },
    { id: 's3', name: 'Charlie Davis', email: 'charlie@school.edu', gradeLevel: '10th', avatar: 'CD' },
    { id: 's4', name: 'Diana Prince', email: 'diana@school.edu', gradeLevel: '11th', avatar: 'DP' },
    { id: 's5', name: 'Evan Wright', email: 'evan@school.edu', gradeLevel: '11th', avatar: 'EW' },
];

export const MOCK_CLASSES: Classroom[] = [
    { id: 'c1', name: 'AP Chemistry - Period 3', code: 'CHEM2025A', subject: LabType.CHEMISTRY, studentIds: ['s1', 's2', 's3'], schedule: 'Mon/Wed 10:00 AM' },
    { id: 'c2', name: 'Intro Physics - Period 5', code: 'PHYS101X', subject: LabType.PHYSICS, studentIds: ['s4', 's5'], schedule: 'Tue/Thu 1:00 PM' },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
    { 
        id: 'a1', 
        classId: 'c1', 
        experimentId: 'chem_01', 
        title: 'Volcano Stoichiometry', 
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
        type: 'INDIVIDUAL',
        status: 'ACTIVE',
        rubric: [
            { criteria: 'Safety Adherence', maxPoints: 25, description: 'Followed all PPE guidelines.' },
            { criteria: 'Data Accuracy', maxPoints: 25, description: 'Measurements recorded correctly.' },
            { criteria: 'Analysis', maxPoints: 50, description: 'Correctly identified limiting reactant.' }
        ]
    },
    { 
        id: 'a2', 
        classId: 'c1', 
        experimentId: 'chem_03', 
        title: 'Catalyst Lab', 
        dueDate: new Date(Date.now() - 86400000), // Yesterday
        type: 'GROUP',
        status: 'CLOSED',
        rubric: [
            { criteria: 'Procedure', maxPoints: 50, description: 'Correct execution.' },
            { criteria: 'Conclusion', maxPoints: 50, description: 'Valid scientific conclusion.' }
        ]
    }
];

export const MOCK_SUBMISSIONS: Submission[] = [
    // Assignment 1 (Active)
    { id: 'sub1', assignmentId: 'a1', studentId: 's1', status: 'SUBMITTED', submittedDate: new Date(), timeSpentMinutes: 45, safetyViolations: 0, dataQualityScore: 95 },
    { id: 'sub2', assignmentId: 'a1', studentId: 's2', status: 'IN_PROGRESS', timeSpentMinutes: 15, safetyViolations: 1, dataQualityScore: 0 },
    { id: 'sub3', assignmentId: 'a1', studentId: 's3', status: 'NOT_STARTED', timeSpentMinutes: 0, safetyViolations: 0, dataQualityScore: 0 },
    
    // Assignment 2 (Closed/Graded)
    { id: 'sub4', assignmentId: 'a2', studentId: 's1', status: 'GRADED', submittedDate: new Date(Date.now() - 90000000), timeSpentMinutes: 50, safetyViolations: 0, dataQualityScore: 98, grade: 95, feedback: 'Excellent work on the catalyst explanation.' },
    { id: 'sub5', assignmentId: 'a2', studentId: 's2', status: 'GRADED', submittedDate: new Date(Date.now() - 88000000), timeSpentMinutes: 40, safetyViolations: 2, dataQualityScore: 75, grade: 78, feedback: 'Watch out for safety warnings next time. Good data though.' },
    { id: 'sub6', assignmentId: 'a2', studentId: 's3', status: 'GRADED', submittedDate: new Date(Date.now() - 95000000), timeSpentMinutes: 30, safetyViolations: 0, dataQualityScore: 60, grade: 70, feedback: 'Detailed observations missing.' },
];

export const MOCK_INCIDENTS: IncidentReport[] = [
    {
        id: 'inc1',
        studentId: 's2',
        studentName: 'Bob Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        severity: SafetyLevel.EXTREME,
        description: 'Attempted to mix Bleach and Ammonia in Virtual Lab.',
        chemicalsInvolved: ['Bleach', 'Ammonia'],
        status: 'OPEN'
    },
    {
        id: 'inc2',
        studentId: 's3',
        studentName: 'Charlie Davis',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
        severity: SafetyLevel.CAUTION,
        description: 'Started experiment without safety goggles toggle enabled.',
        chemicalsInvolved: [],
        status: 'RESOLVED',
        resolutionNotes: 'Student completed safety quiz module again.'
    }
];

export const MOCK_MESSAGES: Message[] = [
    { id: 'm1', senderId: 's1', receiverId: 'teacher', content: 'Dr. Scientist, I am confused about the mole calculation in step 3.', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: 'm2', senderId: 'teacher', receiverId: 's1', content: 'Remember to convert grams to moles using the molar mass first, Alice.', timestamp: new Date(Date.now() - 1800000), read: true },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann1', classId: 'c1', title: 'Lab Kit Pickup', content: 'Please pick up your home lab kits from Room 304 by Friday.', date: new Date() },
    { id: 'ann2', classId: 'ALL', title: 'Science Fair', content: 'Science Fair registration is now open! Submit your proposals.', date: new Date(Date.now() - 86400000) }
];

export const MOCK_CURRICULUM: CurriculumTemplate[] = [
    {
        id: 'curr_chem101',
        title: 'Chemistry 101',
        subject: LabType.CHEMISTRY,
        level: 'Beginner',
        experimentIds: ['chem_01', 'chem_02', 'chem_05', 'chem_06'],
        description: 'Introduction to chemical reactions, states of matter, and basic safety.',
        durationWeeks: 4
    },
    {
        id: 'curr_ap_prep',
        title: 'AP Chemistry Prep',
        subject: LabType.CHEMISTRY,
        level: 'AP Prep',
        experimentIds: ['chem_03', 'chem_04', 'chem_11', 'chem_12'],
        description: 'Advanced kinetics, stoichiometry, and thermodynamics for AP readiness.',
        durationWeeks: 8
    },
    {
        id: 'curr_bio_essentials',
        title: 'Biology Essentials',
        subject: LabType.BIOLOGY,
        level: 'Beginner',
        experimentIds: ['bio_01', 'bio_02', 'bio_05'],
        description: 'Foundations of life: Cells, plants, and osmosis.',
        durationWeeks: 6
    },
    {
        id: 'curr_phys_found',
        title: 'Physics Foundations',
        subject: LabType.PHYSICS,
        level: 'Beginner',
        experimentIds: ['phys_01', 'phys_04', 'phys_05'],
        description: 'Forces, motion, and energy basics.',
        durationWeeks: 5
    }
];

export const MOCK_RESOURCES: LearningResource[] = [
    { id: 'res_1', title: 'Volcano Lab Worksheet', type: 'WORKSHEET', url: '#', experimentId: 'chem_01', subject: LabType.CHEMISTRY },
    { id: 'res_2', title: 'Acids and Bases Video', type: 'VIDEO', url: '#', experimentId: 'chem_05', subject: LabType.CHEMISTRY },
    { id: 'res_3', title: 'Cell Structure Quiz', type: 'ANSWER_KEY', url: '#', experimentId: 'bio_02', subject: LabType.BIOLOGY },
    { id: 'res_4', title: 'Newton\'s Laws Guide', type: 'ARTICLE', url: '#', experimentId: 'phys_01', subject: LabType.PHYSICS },
];
