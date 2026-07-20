import mongoose, { Schema, Document } from 'mongoose';

// ─── Question Types ─────────────────────────────────────────────────────────
export interface IArenaQuestion {
    question: string;
    options: string[];
    correctAnswer: number;     // Index 0-3
    grade: string | number;             // Class 8, 9, 10, JEE, NEET etc.
    subject: string;
    explanation?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    board?: string;            // Which board this question is from
    topicRef?: string;         // Chapter/topic reference
}

// ─── Per-Player State ────────────────────────────────────────────────────────
export interface IArenaPlayer {
    userId: mongoose.Types.ObjectId;
    socketId?: string;
    firstName: string;
    grade: string | number;
    board: string;             // ← NEW: player's own board (GSEB, CBSE, MSBSHSE etc.)
    team: 'A' | 'B';
    hp: number;
    score: number;
    answersRecord: {
        questionId: number;
        selectedOption: number | null;
        isCorrect: boolean;
        timeMs: number;
        damage: number;
    }[];
    powerups: {
        shield: boolean;
        doubleStrike: boolean;
        freeze: boolean;
        fiftyFifty: boolean;
    };
    powerupsUsed: string[];
    streakCount: number;
    hasFinished: boolean;
    isConnected: boolean;
}


// ─── Team State ──────────────────────────────────────────────────────────────
export interface IArenaTeam {
    label: 'A' | 'B';
    hp: number;
    maxHp: number;
    playerIds: mongoose.Types.ObjectId[];
}

// ─── Round State ─────────────────────────────────────────────────────────────
export interface IRoundState {
    roundIndex: number;
    teamAAnswers: Record<string, { option: number; isCorrect: boolean; timeMs: number }>;
    teamBAnswers: Record<string, { option: number; isCorrect: boolean; timeMs: number }>;
    teamACorrectlyClaimed: boolean;
    teamBCorrectlyClaimed: boolean;
    startedAt: Date;
    finishedAt?: Date;
}

// ─── Main Battle Document ─────────────────────────────────────────────────────
export interface IArenaRoom extends Document {
    roomCode: string;
    hostId: mongoose.Types.ObjectId;
    status: 'WAITING' | 'LOBBY_READY' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
    roomType: 'OPEN_ARENA' | 'TEACHER_ROOM';   // ← NEW
    mode: 'SOLO_VS_AI' | 'SOLO_VS_SOLO' | 'SOLO_VS_DUO' | 'SOLO_VS_TRIO' | 'SOLO_VS_SQUAD'
        | 'DUO_VS_DUO' | 'DUO_VS_TRIO' | 'DUO_VS_SQUAD'
        | 'TRIO_VS_TRIO' | 'TRIO_VS_SQUAD'
        | 'SQUAD_VS_SQUAD' | 'CLASSROOM';
    battleStyle: 'SPEED_RACE' | 'ALTERNATING';
    currentTurn: 'A' | 'B';
    activePlayerId?: mongoose.Types.ObjectId | null;
    activePlayerName?: string;
    teamASizeTarget: number;
    teamBSizeTarget: number;
    subject: string;
    difficulty: string;        // ← NEW
    standard: string;          // ← NEW: "10" | "12_SCI_A" | "undergrad" etc.
    board: string;             // ← NEW: room-level board (TEACHER_ROOM uses this for all; OPEN_ARENA = host's board)
    topic?: string;            // legacy
    topicConcept: string;      // ← NEW: AI-normalized topic (required)
    topicRaw?: string;         // ← NEW: original user-typed topic
    semester?: string;         // ← NEW: "sem3" | "year2" | "foundation" | "prelims" etc.
    invitedStudentIds?: mongoose.Types.ObjectId[];  // ← NEW: teacher room invite list
    playerQuestions: Record<string, IArenaQuestion[]>;
    sharedQuestionSets: Record<string, IArenaQuestion[]>;
    players: IArenaPlayer[];
    teamA: IArenaTeam;
    teamB: IArenaTeam;
    roundStates: IRoundState[];
    currentRound: number;
    totalRounds: number;
    aiDifficulty?: 'ROOKIE' | 'SCHOLAR' | 'GRANDMASTER';
    aiTeam?: 'A' | 'B';
    winnerId?: mongoose.Types.ObjectId | null;
    winnerTeam?: 'A' | 'B' | 'DRAW' | null;
    mvpPlayerId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Sub-Schemas ──────────────────────────────────────────────────────────────
const ArenaPlayerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    socketId: { type: String },
    firstName: { type: String, required: true },
    grade: { type: Schema.Types.Mixed, required: true },
    board: { type: String, default: 'NCERT' },  // ← NEW: per-player board
    team: { type: String, enum: ['A', 'B'], required: true },
    hp: { type: Number, default: 1000 },
    score: { type: Number, default: 0 },
    answersRecord: [{
        questionId: Number,
        selectedOption: { type: Number, default: null },
        isCorrect: { type: Boolean, default: false },
        timeMs: { type: Number, default: 0 },
        damage: { type: Number, default: 0 }
    }],
    powerups: {
        shield: { type: Boolean, default: true },
        doubleStrike: { type: Boolean, default: true },
        freeze: { type: Boolean, default: true },
        fiftyFifty: { type: Boolean, default: true }
    },
    powerupsUsed: [{ type: String }],
    streakCount: { type: Number, default: 0 },
    hasFinished: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: true }
}, { _id: false });

const ArenaTeamSchema = new Schema({
    label: { type: String, enum: ['A', 'B'], required: true },
    hp: { type: Number, required: true },
    maxHp: { type: Number, required: true },
    playerIds: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { _id: false });

const RoundStateSchema = new Schema({
    roundIndex: { type: Number, required: true },
    teamAAnswers: { type: Map, of: Schema.Types.Mixed, default: {} },
    teamBAnswers: { type: Map, of: Schema.Types.Mixed, default: {} },
    teamACorrectlyClaimed: { type: Boolean, default: false },
    teamBCorrectlyClaimed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date }
}, { _id: false });

const ArenaQuestionSchema = new Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    grade: { type: Schema.Types.Mixed, required: true },
    subject: { type: String, required: true },
    explanation: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    board: { type: String },    // ← NEW: which board these questions are for
    topicRef: { type: String }  // ← NEW: which topic/chapter
}, { _id: false });

const ArenaRoomSchema: Schema = new Schema({
    roomCode: { type: String, required: true, unique: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['WAITING', 'LOBBY_READY', 'ACTIVE', 'FINISHED', 'CANCELLED'], default: 'WAITING' },
    mode: {
        type: String,
        enum: ['SOLO_VS_AI','SOLO_VS_SOLO','SOLO_VS_DUO','SOLO_VS_TRIO','SOLO_VS_SQUAD',
               'DUO_VS_DUO','DUO_VS_TRIO','DUO_VS_SQUAD','TRIO_VS_TRIO','TRIO_VS_SQUAD',
               'SQUAD_VS_SQUAD','CLASSROOM'],
        required: true
    },
    battleStyle: { type: String, enum: ['SPEED_RACE', 'ALTERNATING'], default: 'SPEED_RACE' },
    currentTurn: { type: String, enum: ['A', 'B'], default: 'A' },
    activePlayerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    activePlayerName: { type: String, default: '' },
    teamASizeTarget: { type: Number, required: true },
    teamBSizeTarget: { type: Number, required: true },
    subject: { type: String, required: true },
    difficulty: { type: String, default: 'Medium' },     // ← NEW
    standard: { type: String, required: true },          // ← NEW
    board: { type: String, required: true },             // ← NEW (mandatory room-level board)
    topic: { type: String },                             // legacy keep
    topicConcept: { type: String, required: false, default: '' },      // AI-normalized topic (optional fallback)
    topicRaw: { type: String },                          // ← NEW: raw user input
    semester: { type: String },                          // ← NEW: for higher-ed
    invitedStudentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }], // ← NEW: teacher room
    roomType: { type: String, enum: ['OPEN_ARENA', 'TEACHER_ROOM'], default: 'OPEN_ARENA' }, // ← NEW
    playerQuestions: { type: Map, of: [ArenaQuestionSchema], default: {} },
    sharedQuestionSets: { type: Map, of: [ArenaQuestionSchema], default: {} },
    players: [ArenaPlayerSchema],
    teamA: ArenaTeamSchema,
    teamB: ArenaTeamSchema,
    roundStates: [RoundStateSchema],
    currentRound: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 10 },
    aiDifficulty: { type: String, enum: ['ROOKIE', 'SCHOLAR', 'GRANDMASTER'] },
    aiTeam: { type: String, enum: ['A', 'B'] },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    winnerTeam: { type: String, default: null },
    mvpPlayerId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, versionKey: false });

// ─── Helper Constants ─────────────────────────────────────────────────────────
export const ARENA_MODE_SIZES: Record<string, [number, number]> = {
    'SOLO_VS_AI':    [1, 0],
    'SOLO_VS_SOLO':  [1, 1],
    'SOLO_VS_DUO':   [1, 2],
    'SOLO_VS_TRIO':  [1, 3],
    'SOLO_VS_SQUAD': [1, 4],
    'DUO_VS_DUO':    [2, 2],
    'DUO_VS_TRIO':   [2, 3],
    'DUO_VS_SQUAD':  [2, 4],
    'TRIO_VS_TRIO':  [3, 3],
    'TRIO_VS_SQUAD': [3, 4],
    'SQUAD_VS_SQUAD':[4, 4],
    'CLASSROOM':     [15, 15],
};

export const BASE_HP_PER_PLAYER = 1000;

export function calculateTeamHP(teamSize: number, opponentSize: number): number {
    if (teamSize === 0) return 1000; // AI
    if (teamSize < opponentSize) {
        return teamSize * BASE_HP_PER_PLAYER * (opponentSize / teamSize);
    }
    return teamSize * BASE_HP_PER_PLAYER;
}

// Legacy export so existing imports don't break during migration
export default mongoose.model<IArenaRoom>('ArenaRoom', ArenaRoomSchema);
