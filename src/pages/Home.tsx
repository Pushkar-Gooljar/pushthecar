import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBJECTS } from "../lib/subjects";
import { cn } from "../lib/utils";

export default function Home() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-1">Revision Hub</h1>
            <p className="text-muted-foreground mb-8 text-sm">
                Pick a subject to start revising past paper questions.
            </p>

            <div className="grid gap-4">
                {SUBJECTS.map((subject) => (
                    <Link key={subject.id} to={`/subject/${subject.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <span className={cn("h-3 w-3 rounded-full", subject.color)} />
                                    <CardTitle className="text-base">{subject.label}</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Browse topics, filter by concept, or start a quiz.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="secondary">Browse topics →</Badge>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}