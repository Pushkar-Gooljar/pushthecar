import { useEffect, useState, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getSubject } from "../lib/subjects";
import { listQuestions } from "../appwrite/database";
import type { QuestionGroup, QuestionFilters } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function TopicPage() {
    const { subjectId, topicSlug } = useParams<{
        subjectId: string;
        topicSlug: string;
    }>();
    const subject = getSubject(subjectId ?? "");
    const topic = topicSlug ? decodeURIComponent(topicSlug) : "";

    const [questions, setQuestions] = useState<QuestionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(false);

    const load = useCallback(
        async (reset = false) => {
            if (!subject) return;
            setLoading(true);
            const filters: QuestionFilters = { topic };
            const res = await listQuestions(
                subject.databaseId,
                subject.collectionId,
                filters,
                reset ? undefined : cursor,
            );
            setQuestions((prev) => (reset ? res.documents : [...prev, ...res.documents]));
            setHasMore(res.hasMore);
            if (res.documents.length > 0)
                setCursor(res.documents[res.documents.length - 1].$id);
            setLoading(false);
        },
        [subject?.id, topic, cursor],
    );

    useEffect(() => {
        setQuestions([]);
        setCursor(undefined);
        load(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject?.id, topic]);

    if (!subject) return <Navigate to="/" replace />;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold mb-1">{topic}</h1>
            <p className="text-sm text-muted-foreground mb-6">
                {subject.label} · {questions.length} question group
                {questions.length !== 1 ? "s" : ""} loaded
            </p>

            <div className="flex flex-col gap-3">
                {loading && questions.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-lg" />
                    ))
                    : questions.map((q) => <QuestionCard key={q.$id} question={q} />)}
            </div>

            {hasMore && (
                <div className="mt-4 flex justify-center">
                    <Button variant="outline" onClick={() => load(false)} disabled={loading}>
                        {loading ? "Loading…" : "Load more"}
                    </Button>
                </div>
            )}
        </div>
    );
}

// ── Individual question card ───────────────────────────────────────────────
function QuestionCard({ question }: { question: QuestionGroup }) {
    const [open, setOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-sm font-normal leading-relaxed flex-1">
                        {question.canonical_text}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setOpen((o) => !o)}
                    >
                        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                    <Badge variant="secondary" className="text-xs">
                        {question.subtopic}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {question.concept}
                    </Badge>
                    {question.keywords.slice(0, 3).map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs text-muted-foreground">
                            {kw}
                        </Badge>
                    ))}
                </div>
            </CardHeader>

            {open && (
                <CardContent className="pt-0">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Appeared in {question.appearances?.length ?? 0} paper
                        {(question.appearances?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                    <ScrollArea className="h-32">
                        <div className="flex flex-col gap-1">
                            {question.appearances?.map((app) => (
                                <div
                                    key={app.$id}
                                    className="flex items-center justify-between text-xs bg-muted rounded px-3 py-2"
                                >
                                    <span className="font-mono">{app.paper_id}</span>
                                    <span className="text-muted-foreground">Q{app.q_num}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {(app.peer_similarity_score * 100).toFixed(0)}% similar
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            )}
        </Card>
    );
}