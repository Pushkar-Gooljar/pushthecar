"use client";

import  { useState } from "react";
import PaperSelector from "@/components/pastpapers/PaperSelector"; // Adjust path if needed
import { FileText } from "lucide-react";

export default function PastPapers() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleOpenPaper = (fullUrl: string) => {
        // Detect mobile, iPad, or screens smaller than standard desktop (1024px)
        const isMobileOrTablet =
            window.innerWidth < 1024 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 2); // Catches modern iPads

        if (isMobileOrTablet) {
            // Open in new tab on mobile/tablet
            window.open(fullUrl, "_blank", "noopener,noreferrer");
        } else {
            // Embed on desktop
            setPdfUrl(fullUrl);
        }
    };

    // Instantly swap the currently loaded PDF if the toggle changes
    const handleTypeChange = (type: "qp" | "ms") => {
        if (pdfUrl) {
            if (type === "ms") {
                setPdfUrl(pdfUrl.replace("_qp_", "_ms_"));
            } else {
                setPdfUrl(pdfUrl.replace("_ms_", "_qp_"));
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col p-4">
            {/* Main Layout - Full Screen minus padding */}
            <main className="flex-1 flex flex-col lg:flex-row h-full gap-6">

                {/* Left Column: Selector */}
                <section className="w-full lg:w-[400px] xl:w-[450px] shrink-0 overflow-y-auto pb-4 scrollbar-hide">
                    <PaperSelector onOpen={handleOpenPaper} onTypeChange={handleTypeChange} />
                </section>

                {/* Right Column: PDF Embed (Hidden on mobile/tablet) */}
                <section className="hidden lg:flex flex-1 rounded-xl border bg-muted/30 overflow-hidden relative shadow-inner">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl} // Removed #toolbar=0 to show default PDF tools
                            className="w-full h-full border-0"
                            title="PDF Viewer"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
                            <div className="bg-muted p-6 rounded-full mb-4">
                                <FileText className="w-12 h-12 opacity-50" />
                            </div>
                            <h2 className="text-lg font-medium text-foreground">No Document Selected</h2>
                            <p className="text-sm mt-1 max-w-sm text-center">
                                Use the menu on the left to select a syllabus, year, and paper.
                                The document will appear here.
                            </p>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}