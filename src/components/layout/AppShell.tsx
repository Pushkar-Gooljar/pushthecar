import { Outlet, NavLink, useParams } from "react-router-dom";
import { SUBJECTS } from "../../lib/subjects";
import { cn } from "../../lib/utils";
import { BookOpen } from "lucide-react";

export default function AppShell() {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 border-r border-border flex flex-col py-6 px-3 gap-1">
                <div className="flex items-center gap-2 px-3 mb-6">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm tracking-tight">RevisionHub</span>
                </div>

                <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Subjects
                </p>

                {SUBJECTS.map((subject) => (
                    <NavLink
                        key={subject.id}
                        to={`/subject/${subject.id}`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                isActive
                                    ? "bg-secondary text-secondary-foreground font-medium"
                                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            )
                        }
                    >
                        <span className={cn("h-2 w-2 rounded-full", subject.color)} />
                        {subject.label}
                    </NavLink>
                ))}
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-border flex items-center px-6 shrink-0">
                    <Breadcrumb />
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// Simple breadcrumb that reads from the current URL
function Breadcrumb() {
    const params = useParams();
    const subject = SUBJECTS.find((s) => s.id === params.subjectId);

    return (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <NavLink to="/" className="hover:text-foreground transition-colors">
                Home
            </NavLink>
            {subject && (
                <>
                    <span>/</span>
                    <NavLink
                        to={`/subject/${subject.id}`}
                        className="hover:text-foreground transition-colors"
                    >
                        {subject.label}
                    </NavLink>
                </>
            )}
            {params.topicSlug && (
                <>
                    <span>/</span>
                    <span className="text-foreground">
            {decodeURIComponent(params.topicSlug)}
          </span>
                </>
            )}
        </nav>
    );
}