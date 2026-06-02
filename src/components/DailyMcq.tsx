import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type WorksheetSet = "9701" | "9702"

type PdfItem = {
    id: string // e.g. "9701_MCQ_Day_001"
    day: string // e.g. "001"
    url: string
    filename: string
    label: string
}

const APPWRITE_BASE =
    "https://fra.cloud.appwrite.io/v1/storage/buckets/daily/files"
const PROJECT_ID = "daddy-cambridge"

function buildPdfUrlDownload(fileId: string) {
    return `${APPWRITE_BASE}/${encodeURIComponent(
        fileId
    )}/download?project=${encodeURIComponent(PROJECT_ID)}`
}

function pad3(n: number) {
    return String(n).padStart(3, "0")
}

function buildList(set: WorksheetSet): PdfItem[] {
    const maxDay = set === "9701" ? 21 : 14
    const items: PdfItem[] = []
    for (let i = 1; i <= maxDay; i++) {
        const day = pad3(i)
        const fileId = `${set}_MCQ_Day_${day}`
        items.push({
            id: fileId,
            day,
            url: buildPdfUrlDownload(fileId),
            filename: `${fileId}.pdf`,
            label: `Day ${day}`,
        })
    }
    return items
}

function downloadSingle(url: string) {
    // Using /download endpoint: opening the URL triggers a download reliably.
    // Use same-tab navigation to avoid popup blockers.
    window.location.assign(url)
}

export function WorksheetDownloadsPage() {
    const [set, setSet] = React.useState<WorksheetSet>("9701")
    const items = React.useMemo(() => buildList(set), [set])

    // purely for checkbox state (no bulk download)
    const [checked, setChecked] = React.useState<Record<string, boolean>>({})

    React.useEffect(() => {
        // reset checks when switching sets (optional, but usually cleaner)
        setChecked({})
    }, [set])

    return (
        <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Worksheets</CardTitle>
                    <CardDescription>
                        Choose a set and download PDFs individually.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Tabs value={set} onValueChange={(v) => setSet(v as WorksheetSet)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="9701">9701 (Day 001–021)</TabsTrigger>
                            <TabsTrigger value="9702">9702 (Day 001–014)</TabsTrigger>
                        </TabsList>

                        <TabsContent value={set} className="mt-6 space-y-4">
                            <div className="divide-y rounded-md border">
                                {items.map((pdf) => (
                                    <div key={pdf.id} className="flex items-center gap-3 p-3">
                                        <Checkbox
                                            checked={Boolean(checked[pdf.id])}
                                            onCheckedChange={(v) =>
                                                setChecked((prev) => ({
                                                    ...prev,
                                                    [pdf.id]: Boolean(v),
                                                }))
                                            }
                                            id={`cb-${pdf.id}`}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <label
                                                htmlFor={`cb-${pdf.id}`}
                                                className="block truncate text-sm font-medium"
                                            >
                                                {pdf.label}
                                            </label>
                                            <div className="truncate text-xs text-muted-foreground">
                                                {pdf.filename}
                                            </div>
                                        </div>

                                        <Button
                                            variant="secondary"
                                            onClick={() => downloadSingle(pdf.url)}
                                        >
                                            Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

export default WorksheetDownloadsPage