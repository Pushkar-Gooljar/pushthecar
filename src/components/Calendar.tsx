import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const examData = [
    { subject: "Physics", component: "Practical", date: "2026-06-11", start_time: "08:30", end_time: "13:30" },
    { subject: "Chemistry", component: "Practical", date: "2026-06-12", start_time: "08:30", end_time: "10:30" },
    { subject: "Physics", component: "Paper 4", date: "2026-06-22", start_time: "11:30", end_time: "13:30" },
    { subject: "Maths", component: "Paper 1", date: "2026-06-23", start_time: "08:30", end_time: "10:20" },
    { subject: "English General Paper", component: "Paper 1", date: "2026-06-24", start_time: "08:30", end_time: "10:00" },
    { subject: "Chemistry", component: "Paper 2", date: "2026-06-24", start_time: "11:00", end_time: "12:15" },
    { subject: "Maths", component: "Paper 3", date: "2026-06-25", start_time: "08:30", end_time: "10:20" },
    { subject: "English General Paper", component: "Paper 2", date: "2026-06-25", start_time: "11:15", end_time: "13:15" },
    { subject: "Physics", component: "Paper 2", date: "2026-06-26", start_time: "10:45", end_time: "12:00" },
    { subject: "Computer Science", component: "Paper 1", date: "2026-06-29", start_time: "08:30", end_time: "10:00" },
    { subject: "Maths", component: "Paper 6", date: "2026-06-30", start_time: "08:30", end_time: "09:45" },
    { subject: "Chemistry", component: "Paper 5", date: "2026-06-30", start_time: "10:45", end_time: "12:00" },
    { subject: "Physics", component: "Paper 5", date: "2026-07-01", start_time: "11:30", end_time: "12:45" },
    { subject: "Maths", component: "Paper 5", date: "2026-07-02", start_time: "12:00", end_time: "13:15" },
    { subject: "Computer Science", component: "Paper 2", date: "2026-07-03", start_time: "08:30", end_time: "10:30" },
    { subject: "Chemistry", component: "Paper 4", date: "2026-07-03", start_time: "11:30", end_time: "13:30" },
    { subject: "Chemistry", component: "Paper 1", date: "2026-07-06", start_time: "10:45", end_time: "12:00" },
    { subject: "Physics", component: "Paper 1", date: "2026-07-08", start_time: "08:30", end_time: "09:45" }
];

// Helper to assign specific colors to different subjects
const getSubjectStyles = (subject: string) => {
    const styles: Record<string, string> = {
        "Physics": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
        "Chemistry": "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        "Maths": "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
        "English General Paper": "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
        "Computer Science": "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800"
    };
    return styles[subject] || "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
};

// Generates calendar days for a given month and year
const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array(firstDay).fill(null); // Empty slots for day offsets

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayExams = examData.filter(e => e.date === dateStr);
        days.push({ day: i, dateStr, events: dayExams });
    }

    return days;
};

const MonthGrid = ({ year, month, title }: { year: number, month: number, title: string }) => {
    const days = getCalendarDays(year, month);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                {title} {year}
            </h3>

            <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border">
                {/* Days of the week header */}
                {weekDays.map(day => (
                    <div key={day} className="bg-muted p-2 text-center text-sm font-semibold text-muted-foreground">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`min-h-[140px] bg-background p-2 transition-colors hover:bg-muted/50 ${!d ? 'bg-muted/20' : ''}`}
                    >
                        {d && (
                            <>
                                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full ${d.events.length > 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    {d.day}
                  </span>
                                    {d.events.length > 0 && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {d.events.length} exam{d.events.length > 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {d.events.map((evt: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`flex flex-col gap-1 p-2 rounded-md border text-xs shadow-sm ${getSubjectStyles(evt.subject)}`}
                                        >
                                            <span className="font-bold leading-tight">{evt.subject}</span>
                                            <span className="opacity-90 font-medium leading-none">{evt.component}</span>
                                            <div className="flex items-center mt-1 pt-1 border-t border-current/20 opacity-90 font-medium">
                                                <Clock className="w-3 h-3 mr-1 shrink-0" />
                                                {evt.start_time} - {evt.end_time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ExamPlanner() {
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">Summer 2026 Exam Planner</CardTitle>
                    <p className="text-muted-foreground">A detailed schedule of your upcoming A-Level examinations.</p>
                </CardHeader>
                <CardContent className="px-0">
                    {/* Month: 5 is June (0-indexed in JS dates), Month: 6 is July */}
                    <MonthGrid year={2026} month={5} title="June" />
                    <MonthGrid year={2026} month={6} title="July" />
                </CardContent>
            </Card>
        </div>
    );
}