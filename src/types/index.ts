// ── Appwrite document shape ────────────────────────────────────────────────
export interface Appearance {
    $id: string;
    paper_id: string;      // e.g. "9702_s21_qp_12"
    q_num: string;         // e.g. "28"
    peer_similarity_score: number;
    exact_text: string;
}

export interface QuestionGroup {
    $id: string;
    group_id: string;
    cluster_size: number;
    keywords: string[];
    canonical_text: string;
    topic: string;
    subtopic: string;
    concept: string;
    appearances: Appearance[];
}

// ── Subject registry — add new subjects here ──────────────────────────────
export interface Subject {
    id: string;          // URL slug, e.g. "physics" | "chemistry"
    label: string;       // Display name
    color: string;       // Tailwind colour class for accent
    databaseId: string;
    collectionId: string;
}

// ── Quiz session ───────────────────────────────────────────────────────────
export type QuizStatus = "idle" | "active" | "complete";

export interface QuizAnswer {
    questionId: string;
    selectedIndex: number | null;
    correct: boolean;
}

export interface QuizSession {
    questions: QuestionGroup[];
    answers: QuizAnswer[];
    status: QuizStatus;
    startedAt: Date;
}

// ── Filter state ───────────────────────────────────────────────────────────
export interface QuestionFilters {
    topic?: string;
    subtopic?: string;
    search?: string;
}