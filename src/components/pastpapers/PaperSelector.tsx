"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define the structure of the JSON data we are fetching
type PaperTree = {
    [year: string]: {
        [series: string]: {
            [paper: string]: string[];
        };
    };
};

const HARDCODED_SYLLABUSES = [
    { code: "9701", name: "Chemistry" },
    { code: "9702", name: "Physics" },
    { code: "9709", name: "Mathematics" },
    { code: "9700", name: "Biology" },
    { code: "9618", name: "Computer Science" },
];

const SERIES_MAP: Record<string, string> = {
    m: "March (m)",
    s: "June (s)",
    w: "November (w)",
};

const BASE_URL = "https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/";

interface PaperSelectorProps {
    onOpen: (filename: string) => void;
    onTypeChange?: (type: "qp" | "ms") => void;
}

export default function PaperSelector({ onOpen, onTypeChange }: PaperSelectorProps) {
    const [data, setData] = useState<PaperTree | null>(null);
    const [loading, setLoading] = useState(false);

    // Cascading UI States
    const [syllabus, setSyllabus] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [series, setSeries] = useState<string>("");
    const [paper, setPaper] = useState<string>("");
    const [file, setFile] = useState<string>("");

    // Document Type State ('qp' or 'ms')
    const [docType, setDocType] = useState<"qp" | "ms">("qp");

    // Fetch JSON when syllabus changes
    useEffect(() => {
        if (!syllabus) return;

        setLoading(true);
        fetch(`/${syllabus}_structure.json`)
            .then((res) => res.json())
            .then((json) => {
                const rootData = json[syllabus] ? json[syllabus] : json;
                setData(rootData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load paper data:", err);
                setLoading(false);
            });
    }, [syllabus]);

    // Reset cascading states handlers
    const handleSyllabusChange = (val: string) => {
        setSyllabus(val);
        setYear(""); setSeries(""); setPaper(""); setFile("");
        setData(null);
    };

    const handleYearChange = (val: string) => {
        setYear(val);
        setSeries(""); setPaper(""); setFile("");
    };

    const handleSeriesChange = (val: string) => {
        setSeries(val);
        setPaper(""); setFile("");
    };

    const handlePaperChange = (val: string) => {
        setPaper(val);
        setFile("");
    };

    const handleTypeChange = (val: "qp" | "ms") => {
        setDocType(val);
        if (onTypeChange) onTypeChange(val);
    };

    // Extract available options. Sort years descending (newest first).
    const availableYears = data
        ? Object.keys(data).sort((a, b) => Number(b) - Number(a))
        : [];

    const isYearValid = data && data[year];
    const availableSeries = isYearValid ? Object.keys(data[year]) : [];
    const availablePapers = isYearValid && data[year][series] ? Object.keys(data[year][series]) : [];
    const availableFiles = isYearValid && data[year][series] && data[year][series][paper] ? data[year][series][paper] : [];

    // Helper to extract the variant number
    const getVariantNumber = (filename: string) => {
        const match = filename.match(/_(\d+)\.pdf$/);
        return match ? match[1] : "?";
    };

    const handleOpenClick = () => {
        if (!file) return;

        let finalFilename = file;
        if (docType === "ms") {
            finalFilename = finalFilename.replace("_qp_", "_ms_");
        }

        onOpen(`${BASE_URL}${finalFilename}`);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-sm">
            <CardHeader>
                <CardTitle>Past Paper Viewer</CardTitle>
                <CardDescription>Select a paper step-by-step to view.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

                {/* 1. SYLLABUS (Dropdown) */}
                <div className="space-y-2">
                    <Label>Syllabus</Label>
                    <Select value={syllabus} onValueChange={handleSyllabusChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose Syllabus..." />
                        </SelectTrigger>
                        <SelectContent>
                            {HARDCODED_SYLLABUSES.map((syll) => (
                                <SelectItem key={syll.code} value={syll.code}>
                                    {syll.code} - {syll.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 2. YEAR (Dropdown) */}
                <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={year} onValueChange={handleYearChange} disabled={!data || loading}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={loading ? "Loading..." : "Choose Year..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map((yr) => (
                                <SelectItem key={yr} value={yr}>
                                    {yr}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. SERIES (Button Group) */}
                <div className="space-y-2">
                    <Label>Series</Label>
                    <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                        {availableSeries.length > 0 ? (
                            availableSeries.map((ser) => (
                                <Button
                                    key={ser}
                                    variant={series === ser ? "default" : "outline"}
                                    onClick={() => handleSeriesChange(ser)}
                                    className="flex-1"
                                >
                                    {SERIES_MAP[ser] || ser.toUpperCase()}
                                </Button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Select a year first.</p>
                        )}
                    </div>
                </div>

                {/* 4. PAPER NUMBER (Button Group) */}
                <div className="space-y-2">
                    <Label>Paper</Label>
                    <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                        {availablePapers.length > 0 ? (
                            availablePapers.map((pap) => (
                                <Button
                                    key={pap}
                                    variant={paper === pap ? "default" : "outline"}
                                    onClick={() => handlePaperChange(pap)}
                                    className="flex-1"
                                >
                                    {pap}
                                </Button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Select a series first.</p>
                        )}
                    </div>
                </div>

                {/* 5. VARIANT / FILE (Button Group) */}
                <div className="space-y-2">
                    <Label>Variant</Label>
                    <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                        {availableFiles.length > 0 ? (
                            availableFiles.map((f) => (
                                <Button
                                    key={f}
                                    variant={file === f ? "default" : "outline"}
                                    onClick={() => setFile(f)}
                                    className="flex-1"
                                >
                                    {getVariantNumber(f)}
                                </Button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Select a paper first.</p>
                        )}
                    </div>
                </div>

                {/* DOCUMENT TYPE */}
                <div className="space-y-3 pt-4 border-t">
                    <Label>Document Type</Label>
                    <RadioGroup
                        value={docType}
                        onValueChange={(val: "qp" | "ms") => handleTypeChange(val)}
                        className="flex gap-2"
                    >
                        {/* Question Paper Label/Block */}
                        <div className="flex-1">
                            <RadioGroupItem value="qp" id="qp" className="peer sr-only" />
                            <Label
                                htmlFor="qp"
                                className="flex items-center justify-center rounded-full border-2 border-muted bg-popover py-3 px-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                            >
                                <span className="text-sm font-semibold">Question Paper</span>
                            </Label>
                        </div>

                        {/* Mark Scheme Label/Block */}
                        <div className="flex-1">
                            <RadioGroupItem value="ms" id="ms" className="peer sr-only" />
                            <Label
                                htmlFor="ms"
                                className="flex items-center justify-center rounded-full border-2 border-muted bg-popover py-3 px-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                            >
                                <span className="text-sm font-semibold">Mark Scheme</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                    className="w-full cursor-pointer"
                    size="lg"
                    disabled={!file}
                    onClick={handleOpenClick}
                >
                    Open Document
                </Button>
            </CardContent>
        </Card>
    );
}