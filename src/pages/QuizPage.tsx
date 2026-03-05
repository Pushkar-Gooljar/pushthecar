import { useState } from "react";
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { getSubject } from "../lib/subjects";
import { fetchQuizQuestions } from "../appwrite/database";
import type { QuestionGroup, QuizSession, QuizAnswer } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export default function QuizPage() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [searchParams] = useSearchParams();
    const subject = getSubject(subjectId ?? "");

    const [session, setSession] = useState<QuizSession | null>(null);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);

    if (!subject) return <Navigate to="/" replace />;

    // ── Start a new quiz ─────────────────────────────────────────────────────
    async function startQuiz() {
        if (!subject) return;
        setLoading(true);
        const filters = {
            topic: searchParams.get("topic") ?? undefined,
            subtopic: searchParams.get("subtopic") ?? undefined,
        };
        const questions = await fetchQuizQuestions(
            subject.databaseId,
            subject.collectionId,
            filters,
            10,
        );
        setSession({
            questions,
            answers: [],
            status: "active",
            startedAt: new Date(),
        });
        setCurrent(0);
        setRevealed(false);
        setLoading(false);
    }

    // ── Idle screen ───────────────────────────────────────────────────────────
    if (!session || session.status === "idle") {
        return (
            <div className="max-w-md mx-auto flex flex-col items-center gap-4 pt-12">
                <h1 className="text-2xl font-bold">{subject.label} Quiz</h1>
                <p className="text-sm text-muted-foreground text-center">
                    10 random questions from{" "}
                    {searchParams.get("topic") ?? "all topics"}.
                </p>
                <Button onClick={startQuiz} disabled={loading} size="lg">
                    {loading ? "Loading…" : "Start Quiz"}
                </Button>
            </div>
        );
    }

    const q = session.questions[current];
    const totalAnswered = session.answers.length;
    const progress = Math.round((totalAnswered / session.questions.length) * 100);

    // ── Complete screen ───────────────────────────────────────────────────────
    if (session.status === "complete") {
        const correct = session.answers.filter((a) => a.correct).length;
        const score = Math.round((correct / session.questions.length) * 100);

        return (
            <div className="max-w-lg mx-auto pt-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Quiz Complete!</h1>
                    <p className="text-4xl font-bold text-primary mb-1">{score}%</p>
                    <p className="text-sm text-muted-foreground">
                        {correct} / {session.questions.length} correct
                    </p>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                    {session.questions.map((question, idx) => {
                        const answer = session.answers[idx];
                        return (
                            <Card key={question.$id}>
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        {answer?.correct ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                        )}
                                        <p className="text-sm leading-relaxed">{question.canonical_text}</p>
                                    </div>
                                    <div className="flex gap-1 mt-2 ml-8">
                                        <Badge variant="secondary" className="text-xs">
                                            {question.subtopic}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <Button onClick={startQuiz} disabled={loading}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // ── Active quiz card ──────────────────────────────────────────────────────
    function markAndAdvance(correct: boolean) {
        if (!session) return;
        const answer: QuizAnswer = {
            questionId: q.$id,
            selectedIndex: null,
            correct,
        };
        const newAnswers = [...session.answers, answer];
        const isLast = current >= session.questions.length - 1;

        setSession({
            ...session,
            answers: newAnswers,
            status: isLast ? "complete" : "active",
        });

        if (!isLast) {
            setCurrent((c) => c + 1);
            setRevealed(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>
            Question {current + 1} of {session.questions.length}
          </span>
                    <span>{progress}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Question card */}
            <Card className="mb-4">
                <CardHeader>
                    <div className="flex gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{q.topic}</Badge>
                        <Badge variant="outline" className="text-xs">{q.subtopic}</Badge>
                    </div>
                    <CardTitle className="text-base font-normal leading-relaxed">
                        {q.canonical_text}
                    </CardTitle>
                </CardHeader>

                {revealed && (
                    <CardContent>
                        <Separator className="mb-3" />
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                            Appeared in
                        </p>
                        <div className="flex flex-col gap-1">
                            {q.appearances?.slice(0, 3).map((app) => (
                                <div
                                    key={app.$id}
                                    className="flex items-center justify-between text-xs bg-muted rounded px-3 py-2"
                                >
                                    <span className="font-mono">{app.paper_id}</span>
                                    <span>Q{app.q_num}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Action buttons */}
            {!revealed ? (
                <Button className="w-full" onClick={() => setRevealed(true)}>
                    Show Answer / Past Papers
                </Button>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => markAndAdvance(false)}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Didn't know
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => markAndAdvance(true)}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Got it
                    </Button>
                </div>
            )}
        </div>
    );
}