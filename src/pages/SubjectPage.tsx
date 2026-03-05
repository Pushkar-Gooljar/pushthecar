import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getSubject } from "../lib/subjects";
import { listTopics } from "../appwrite/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";

export default function SubjectPage() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const subject = getSubject(subjectId ?? "");

    const [topics, setTopics] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subject) return;
        setLoading(true);
        listTopics(subject.databaseId, subject.collectionId)
            .then(setTopics)
            .finally(() => setLoading(false));
    }, [subject?.id]);

    if (!subject) return <Navigate to="/" replace />;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{subject.label}</h1>
                    <p className="text-sm text-muted-foreground">Select a topic to revise</p>
                </div>
                <Link to={`/subject/${subject.id}/quiz`}>
                    <Button size="sm">
                        <Zap className="h-4 w-4 mr-1" />
                        Quick Quiz
                    </Button>
                </Link>
            </div>

            {/* Topic grid */}
            <div className="grid gap-3 sm:grid-cols-2">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                    ))
                    : topics.map((topic) => (
                        <Link
                            key={topic}
                            to={`/subject/${subject.id}/topic/${encodeURIComponent(topic)}`}
                        >
                            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm font-medium">{topic}</CardTitle>
                                </CardHeader>
                                <CardContent>
                    <span className="text-xs text-muted-foreground">
                      View questions →
                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
            </div>
        </div>
    );
}