import { Separator } from "@/components/ui/separator";
import { Github } from "lucide-react";
import { ownerConfig } from "@/config/sites";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-auto w-full">
            <Separator className="mb-8" />
            <div className="container mx-auto max-w-4xl px-6 pb-10">
                <div className="flex flex-col items-center gap-4 text-center">
                    <blockquote className="max-w-lg italic text-muted-foreground text-sm">
                        &ldquo;{ownerConfig.quote}&rdquo;
                        <span className="block mt-1 not-italic text-xs text-muted-foreground/70">
              &mdash; {ownerConfig.quoteAuthor}
            </span>
                    </blockquote>

                    <img src="/gp-logo.svg" alt="" width={50} />

                    <a
                        href={ownerConfig.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Github className="h-5 w-5" />
                        <span>GitHub</span>
                    </a>

                    <p className="text-xs text-muted-foreground">
                        &copy; {year} PG. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}