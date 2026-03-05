import { Query } from "appwrite";
import { databases } from "./client";
import type { QuestionGroup, QuestionFilters } from "@/types";

const PAGE_SIZE = 25;

// ── Fetch a page of questions with optional filters ────────────────────────
export async function listQuestions(
    databaseId: string,
    collectionId: string,
    filters: QuestionFilters = {},
    cursor?: string,
): Promise<{ documents: QuestionGroup[]; hasMore: boolean }> {
    const queries: string[] = [
        Query.limit(PAGE_SIZE),
        Query.orderAsc("topic"),
    ];

    if (filters.topic)    queries.push(Query.equal("topic", filters.topic));
    if (filters.subtopic) queries.push(Query.equal("subtopic", filters.subtopic));
    if (filters.search)   queries.push(Query.search("canonical_text", filters.search));
    if (cursor)           queries.push(Query.cursorAfter(cursor));

    const res = await databases.listDocuments(databaseId, collectionId, queries);

    return {
        documents: res.documents as unknown as QuestionGroup[],
        hasMore: res.documents.length === PAGE_SIZE,
    };
}

// ── Fetch distinct topic names for a subject ───────────────────────────────
export async function listTopics(
    databaseId: string,
    collectionId: string,
): Promise<string[]> {
    // Fetch enough to cover all topics; topics are indexed so this is fast
    const res = await databases.listDocuments(databaseId, collectionId, [
        Query.limit(5000),
        Query.select(["topic"]),
        Query.orderAsc("topic"),
    ]);

    const unique = [...new Set(res.documents.map((d: any) => d.topic as string))];
    return unique.filter((t) => t !== "Unclassified");
}

// ── Fetch subtopics for a given topic ─────────────────────────────────────
export async function listSubtopics(
    databaseId: string,
    collectionId: string,
    topic: string,
): Promise<string[]> {
    const res = await databases.listDocuments(databaseId, collectionId, [
        Query.limit(5000),
        Query.equal("topic", topic),
        Query.select(["subtopic"]),
        Query.orderAsc("subtopic"),
    ]);

    return [...new Set(res.documents.map((d: any) => d.subtopic as string))];
}

// ─��� Fetch a random sample of N questions (for quiz mode) ───────────────────
export async function fetchQuizQuestions(
    databaseId: string,
    collectionId: string,
    filters: QuestionFilters,
    count: number = 10,
): Promise<QuestionGroup[]> {
    // Appwrite doesn't have random order — fetch a page and shuffle client-side
    const queries: string[] = [Query.limit(Math.min(count * 3, 100))];

    if (filters.topic)    queries.push(Query.equal("topic", filters.topic));
    if (filters.subtopic) queries.push(Query.equal("subtopic", filters.subtopic));

    const res = await databases.listDocuments(databaseId, collectionId, queries);
    const all = res.documents as unknown as QuestionGroup[];

    // Fisher-Yates shuffle then slice
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }

    return all.slice(0, count);
}