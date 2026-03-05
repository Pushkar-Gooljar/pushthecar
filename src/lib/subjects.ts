import type { Subject } from "@/types";

// ── Add new subjects here — no code changes elsewhere needed ───────────────
export const SUBJECTS: Subject[] = [
    {
        id: "physics",
        label: "Physics",
        color: "bg-blue-500",
        databaseId: "physics_p1_db",
        collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_GROUPS ?? "question_groups",
    },
    // Add chemistry, biology, etc. here later:
    // {
    //   id: "chemistry",
    //   label: "Chemistry",
    //   color: "bg-green-500",
    //   databaseId: "chemistry_db",
    //   collectionId: "question_groups",
    // },
];

export function getSubject(id: string): Subject | undefined {
    return SUBJECTS.find((s) => s.id === id);
}