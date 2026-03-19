"use client";

import  { useState, useMemo } from "react";
import PaperSelector from "@/components/pastpapers/PaperSelector"; // Adjust path if needed
import { FileText, Columns, Layout, Eye, EyeOff, Sidebar, SidebarClose } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PastPapers() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isSideBySide, setIsSideBySide] = useState(false);
    const [isMsHidden, setIsMsHidden] = useState(false);
    const [isSelectorHidden, setIsSelectorHidden] = useState(false);

    const msUrl = useMemo(() => {
        if (!pdfUrl) return null;
        if (pdfUrl.includes("_ms_")) return pdfUrl;
        return pdfUrl.replace("_qp_", "_ms_");
    }, [pdfUrl]);

    const qpUrl = useMemo(() => {
        if (!pdfUrl) return null;
        if (pdfUrl.includes("_qp_")) return pdfUrl;
        return pdfUrl.replace("_ms_", "_qp_");
    }, [pdfUrl]);

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
            {/* Controls Header (Desktop Only) */}
            <div className="hidden lg:flex items-center justify-end mb-4 gap-6 px-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectorHidden(!isSelectorHidden)}
                    className="flex items-center gap-2 mr-auto"
                >
                    {isSelectorHidden ? (
                        <><Sidebar className="w-4 h-4" /> Show Selector</>
                    ) : (
                        <><SidebarClose className="w-4 h-4" /> Hide Selector</>
                    )}
                </Button>
                {pdfUrl && isSideBySide && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMsHidden(!isMsHidden)}
                        className="flex items-center gap-2"
                    >
                        {isMsHidden ? (
                            <><Eye className="w-4 h-4" /> Show Mark Scheme</>
                        ) : (
                            <><EyeOff className="w-4 h-4" /> Hide Mark Scheme</>
                        )}
                    </Button>
                )}
                <div className="flex items-center space-x-2">
                    <Switch
                        id="side-by-side-mode"
                        checked={isSideBySide}
                        onCheckedChange={setIsSideBySide}
                    />
                    <Label htmlFor="side-by-side-mode" className="flex items-center gap-2 cursor-pointer">
                        {isSideBySide ? <Columns className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                        Side-by-Side View
                    </Label>
                </div>
            </div>

            {/* Main Layout - Full Screen minus padding */}
            <main className="flex-1 flex flex-col lg:flex-row h-full gap-6 overflow-hidden">

                {/* Left Column: Selector */}
                <section className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 overflow-y-auto pb-4 scrollbar-hide transition-all duration-300 ${isSelectorHidden ? 'lg:hidden' : 'block'}`}>
                    <PaperSelector onOpen={handleOpenPaper} onTypeChange={handleTypeChange} />
                </section>

                {/* Right Column: PDF Embed (Hidden on mobile/tablet) */}
                <section className="hidden lg:flex flex-1 gap-4 overflow-hidden">
                    {!pdfUrl ? (
                        <div className="flex-1 rounded-xl border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500 shadow-inner">
                            <div className="bg-muted p-6 rounded-full mb-4">
                                <FileText className="w-12 h-12 opacity-50" />
                            </div>
                            <h2 className="text-lg font-medium text-foreground">No Document Selected</h2>
                            <p className="text-sm mt-1 max-w-sm text-center">
                                Use the menu on the left to select a syllabus, year, and paper.
                                The document will appear here.
                            </p>
                        </div>
                    ) : isSideBySide ? (
                        <div className="flex-1 flex gap-4 overflow-hidden">
                            {/* Question Paper */}
                            <div className="flex-1 rounded-xl border bg-muted/30 overflow-hidden relative shadow-inner">
                                <iframe
                                    src={qpUrl!}
                                    className="w-full h-full border-0"
                                    title="Question Paper Viewer"
                                    allowFullScreen
                                />
                                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold border">
                                    Question Paper
                                </div>
                            </div>
                            {/* Mark Scheme */}
                            <div className="flex-1 rounded-xl border bg-muted/30 overflow-hidden relative shadow-inner">
                                <iframe
                                    src={msUrl!}
                                    className={`w-full h-full border-0 transition-all duration-300 ${isMsHidden ? 'blur-sm' : ''}`}
                                    title="Mark Scheme Viewer"
                                    allowFullScreen
                                />
                                {isMsHidden && (
                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                                        <div className="bg-muted p-4 rounded-full mb-3">
                                            <EyeOff className="w-8 h-8 opacity-50 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">Mark Scheme Hidden</p>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="mt-4"
                                            onClick={() => setIsMsHidden(false)}
                                        >
                                            Show Mark Scheme
                                        </Button>
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold border z-20">
                                    Mark Scheme
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 rounded-xl border bg-muted/30 overflow-hidden relative shadow-inner">
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border-0"
                                title="PDF Viewer"
                                allowFullScreen
                            />
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}