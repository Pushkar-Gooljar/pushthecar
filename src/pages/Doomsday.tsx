import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, X, Filter, Group, ArrowUpDown } from 'lucide-react';

interface Exam {
  paper: string;
  day: string;
  date: string;
  time: string;
}

interface SubjectData {
  subject: string;
  code: string;
  exams: Exam[];
}

interface SelectedExam extends Exam {
  subject: string;
  code: string;
  color: string;
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
  isPast: boolean;
}

const COLORS = [
  'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
  'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
  'bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700',
  'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700',
  'bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700',
  'bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700',
  'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700',
  'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700',
];

const parseDate = (dateStr: string, timeStr: string) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const hour = timeStr === 'AM' ? 8 : 12;
  return new Date(year, month - 1, day, hour).getTime();
};

const formatDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
};

const formatTime = (timeStr: string) => {
  return timeStr === 'AM' ? '8:00' : '12:00';
};

const ALEvelOptions = [
  { id: 'S02', subjects: ['Maths', 'Computer', 'Biology'] },
  { id: 'S04', subjects: ['Maths', 'Chemistry', 'Biology'] },
  { id: 'S05', subjects: ['Maths', 'Chemistry', 'Computer'] },
  { id: 'S06', subjects: ['Maths', 'Chemistry', 'Physics'] },
  { id: 'S07', subjects: ['Maths', 'Computer', 'Physics'] },
];

const ASLevelChoices = [
  { id: 'B', name: 'Biology', papers: ['12', '22', '33'] },
  { id: 'C', name: 'Computer', papers: ['12', '22'] },
];

const MATHS_OPTIONS = [
  { id: 'M1', papers: ['12', '32', '52', '42'] },
  { id: 'S2', papers: ['12', '32', '52', '62'] },
];

const COMMON_PAPERS = ['12', '22', '33', '42', '52'];

export default function Doomsday() {
  const [data, setData] = useState<SubjectData[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('asc');
  const [groupBySubject, setGroupBySubject] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const showCountdown = searchParams.get('countdown') !== 'false';
  const setShowCountdown = (show: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (show) {
      params.delete('countdown');
    } else {
      params.set('countdown', 'false');
    }
    setSearchParams(params);
  };

  const countdownMode = (searchParams.get('mode') as 'earliest' | 'last' | 'custom') || 'earliest';
  const setCountdownMode = (mode: 'earliest' | 'last' | 'custom') => {
    const params = new URLSearchParams(searchParams);
    if (mode === 'earliest') {
      params.delete('mode');
    } else {
      params.set('mode', mode);
    }
    setSearchParams(params);
  };

  const customTargetPaper = searchParams.get('target') || null;
  const setCustomTargetPaper = (target: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!target) {
      params.delete('target');
    } else {
      params.set('target', target);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/nov2026TimetableData.json')
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const selectedALevel = searchParams.get('alevel') || '';
  const selectedASChoice = searchParams.get('aschoice') || '';
  const selectedMathsOption = searchParams.get('maths') || 'M1';

  const updateSelection = (alevel: string, aschoice: string, maths: string) => {
    const params: any = {};
    if (alevel) params.alevel = alevel;
    if (aschoice) params.aschoice = aschoice;
    if (maths) params.maths = maths;
    setSearchParams(params);
  };

  const today = new Date('2026-04-09T09:07:00').getTime(); // Current date as per description

  const getSelectedPapers = useMemo(() => {
    const papers = new Set<string>();

    // EGP is obligatory
    papers.add('8021*-12');
    papers.add('8021*-22');

    // AS Level choice
    const asChoice = ASLevelChoices.find(c => c.id === selectedASChoice);
    if (asChoice) {
      const code = asChoice.name === 'Biology' ? '9700' : '9618';
      asChoice.papers.forEach(p => papers.add(`${code}-${p}`));
    }

    // A Level combination
    const alevel = ALEvelOptions.find(o => o.id === selectedALevel);
    if (alevel) {
      alevel.subjects.forEach(subjName => {
        const subjData = data.find(d => d.subject === subjName);
        if (!subjData) return;

        if (subjName === 'Maths') {
          const mOption = MATHS_OPTIONS.find(mo => mo.id === selectedMathsOption);
          mOption?.papers.forEach(p => papers.add(`${subjData.code}-${p}`));
        } else {
          // CH, P, B have papers 12,22,33,42,52
          // Computer has 12, 22, 32 in the data. Let's check the data.
          // For now follow the prompt: ch, p, b all have papers 12,22,33,42,52
          const targetPapers = (subjName === 'Computer') ? ['12', '22', '32'] : COMMON_PAPERS;
          targetPapers.forEach(p => papers.add(`${subjData.code}-${p}`));
        }
      });
    }

    return papers;
  }, [data, selectedALevel, selectedASChoice, selectedMathsOption]);

  const allExams = useMemo(() => {
    const exams: SelectedExam[] = [];
    data.forEach((subj, idx) => {
      subj.exams.forEach((exam) => {
        const timestamp = parseDate(exam.date, exam.time);
        exams.push({
          ...exam,
          subject: subj.subject,
          code: subj.code,
          color: COLORS[idx % COLORS.length],
          timestamp,
          formattedDate: formatDate(exam.date),
          formattedTime: formatTime(exam.time),
          isPast: timestamp < today,
        });
      });
    });
    return exams;
  }, [data, today]);

  const selectedExams = useMemo(() => {
    return allExams.filter((e) => getSelectedPapers.has(`${e.code}-${e.paper}`));
  }, [allExams, getSelectedPapers]);

  const processedExams = useMemo(() => {
    const subjectPriority: Record<string, number> = {};

    // A Level combination subjects first
    const alevel = ALEvelOptions.find(o => o.id === selectedALevel);
    if (alevel) {
      // Order: Maths, Chemistry, Physics, Computer, Biology
      const order = ['Maths', 'Chemistry', 'Physics', 'Computer', 'Biology'];
      alevel.subjects
        .sort((a, b) => order.indexOf(a) - order.indexOf(b))
        .forEach((subj, idx) => {
          subjectPriority[subj] = idx;
        });
    }

    // EGP is before the option as
    subjectPriority['EGP'] = 10;

    // AS Level choice last
    const asChoice = ASLevelChoices.find(c => c.id === selectedASChoice);
    if (asChoice) {
      // Only set priority if it's not already set (not an A-level)
      if (subjectPriority[asChoice.name] === undefined) {
        subjectPriority[asChoice.name] = 20;
      }
    }

    const sortedByTime = [...selectedExams].sort((a, b) => a.timestamp - b.timestamp);
    const futureExams = sortedByTime.filter(e => !e.isPast);

    let sorted = [...selectedExams].sort((a, b) => {
      if (groupBySubject) {
        if (a.subject !== b.subject) {
          const pA = subjectPriority[a.subject] ?? 99;
          const pB = subjectPriority[b.subject] ?? 99;
          if (pA !== pB) return pA - pB;
          return a.subject.localeCompare(b.subject);
        }
      }
      return sortBy === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });

    const active = sorted.filter((e) => !e.isPast);
    const past = sorted.filter((e) => e.isPast);

    // Countdown logic
    let targetExam: SelectedExam | undefined;
    if (countdownMode === 'earliest') {
      targetExam = futureExams[0];
    } else if (countdownMode === 'last') {
      targetExam = futureExams[futureExams.length - 1];
    } else if (countdownMode === 'custom' && customTargetPaper) {
      targetExam = futureExams.find(e => `${e.code}-${e.paper}` === customTargetPaper);
    }

    return { active, past, targetExam, futureExams };
  }, [selectedExams, sortBy, groupBySubject, selectedALevel, selectedASChoice, countdownMode, customTargetPaper]);

  const countdown = useMemo(() => {
    if (!processedExams.targetExam || processedExams.targetExam.isPast) return null;

    const diff = processedExams.targetExam.timestamp - now;
    if (diff <= 0) return "TIME'S UP";

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 7);
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

    return `${weeks}w:${days}d:${hours}h:${minutes}m:${seconds}s`;
  }, [processedExams.targetExam, now]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ExamCard = ({ exam }: { exam: SelectedExam }) => (
    <div
      onClick={() => {
        if (countdownMode === 'custom' && !exam.isPast) {
          setCustomTargetPaper(`${exam.code}-${exam.paper}`);
        }
      }}
      className={`flex items-center justify-between p-4 mb-2 border rounded-lg transition-all ${
        exam.isPast 
          ? 'opacity-40 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-not-allowed' 
          : `${exam.color} ${countdownMode === 'custom' ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''}`
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{exam.subject}</span>
          <span className="text-xs opacity-60 font-medium">{exam.code}/{exam.paper}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-right">
        <span className="font-bold text-sm">{exam.formattedDate}</span>
        <span className="text-xs font-bold w-12">{exam.formattedTime}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {showCountdown && (
          <div className="mb-8 p-6 bg-black text-white dark:bg-white dark:text-black rounded-2xl shadow-2xl flex flex-col items-center justify-center space-y-2 transform hover:scale-[1.01] transition-transform">
            {countdown && processedExams.targetExam ? (
              <>
                <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60 text-center">
                  Countdown to {processedExams.targetExam.subject} Paper {processedExams.targetExam.paper}
                  <div className="mt-1 normal-case tracking-normal opacity-100 font-bold">
                    {processedExams.targetExam.formattedDate} @ {processedExams.targetExam.formattedTime}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-mono font-black tracking-tighter tabular-nums">
                  {countdown}
                </div>
              </>
            ) : (
              <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60 text-center py-4">
                {countdownMode === 'custom' ? 'Select a paper from below' : 'No upcoming papers'}
              </div>
            )}
            <div className="flex flex-col items-center gap-3 mt-2 w-full">
              <div className="flex gap-4">
                {(['earliest', 'last', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCountdownMode(mode)}
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
                      countdownMode === mode 
                        ? 'bg-white text-black dark:bg-black dark:text-white border-transparent' 
                        : 'border-white/20 dark:border-black/20 hover:border-white/50 dark:hover:border-black/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter leading-none mb-1">DOOMSDAY</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest h-9">
              <span className="opacity-60">Countdown</span>
              <button
                onClick={() => setShowCountdown(!showCountdown)}
                className={`w-8 h-4 rounded-full relative transition-colors ${showCountdown ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${showCountdown ? 'translate-x-4' : ''}`} />
              </button>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-sm transition-all active:scale-95 h-9"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => setIsSelecting(!isSelecting)}
              className="px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-black text-sm transition-all active:scale-95 h-9 whitespace-nowrap"
            >
              {isSelecting ? 'Save Changes' : 'Update Subjects'}
            </button>
          </div>
        </header>

        {isSelecting ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="border rounded-xl p-4 bg-card">
              <h2 className="text-xl font-bold mb-3">A Level Combination</h2>
              <div className="flex flex-wrap gap-2">
                {ALEvelOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateSelection(opt.id, selectedASChoice, selectedMathsOption)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedALevel === opt.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <div className="font-bold">{opt.id}</div>
                    <div className="text-xs opacity-70">{opt.subjects.join(', ')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-card">
              <h2 className="text-xl font-bold mb-3">Maths Option</h2>
              <div className="flex flex-wrap gap-2">
                {MATHS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateSelection(selectedALevel, selectedASChoice, opt.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedMathsOption === opt.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {opt.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-card">
              <h2 className="text-xl font-bold mb-3">Second AS Subject</h2>
              <div className="flex flex-wrap gap-2">
                {ASLevelChoices.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateSelection(selectedALevel, opt.id, selectedMathsOption)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedASChoice === opt.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {opt.name} ({opt.id})
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSortBy(sortBy === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-all active:scale-95 whitespace-nowrap"
              >
                <ArrowUpDown size={14} /> Date {sortBy === 'asc' ? 'Asc' : 'Desc'}
              </button>
              <button
                onClick={() => setGroupBySubject(!groupBySubject)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap ${
                  groupBySubject 
                    ? 'bg-black text-white dark:bg-white dark:text-black' 
                    : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800'
                }`}
              >
                <Group size={14} /> Group Subject
              </button>
            </div>

            {selectedExams.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                <p className="text-muted-foreground">Select your options to see the schedule.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {processedExams.active.map((exam) => (
                    <ExamCard key={`${exam.code}-${exam.paper}`} exam={exam} />
                  ))}
                </div>

                {processedExams.past.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Completed</h2>
                    <div className="space-y-4">
                      {processedExams.past.map((exam) => (
                        <ExamCard key={`${exam.code}-${exam.paper}`} exam={exam} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
