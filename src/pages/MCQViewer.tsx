import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Copy, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

interface AnswerData {
  [key: string]: {
    [question: string]: string;
  };
}

const MCQViewer: React.FC = () => {
  const navigate = useNavigate();
  const [answerData, setAnswerData] = useState<AnswerData | null>(null);
  const [isJsonLoading, setIsJsonLoading] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<{
    caption: string;
    imgUrl: string;
    answer: string;
    found: boolean;
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fetchJson = async () => {
      try {
        const response = await fetch('https://fra.cloud.appwrite.io/v1/storage/buckets/jsons/files/9702-P1_answers_json/view?project=daddy-cambridge');
        if (!response.ok) throw new Error('Failed to fetch answer data');
        const data = await response.json();
        setAnswerData(data);
      } catch (err) {
        setJsonError(err instanceof Error ? err.message : 'An error occurred while loading data');
      } finally {
        setIsJsonLoading(false);
      }
    };
    fetchJson();
  }, []);

  const parseInput = (input: string) => {
    const trimmed = input.trim();
    
    // Format 1: 9702_w25_qp_12_q13
    const longRegex = /^9702_([a-zA-Z]\d{2})_qp_(\d{1,2})_[qQ](\d+)$/i;
    const longMatch = trimmed.match(longRegex);
    
    if (longMatch) {
      return {
        seriesYear: longMatch[1].toLowerCase(),
        paper: longMatch[2],
        question: longMatch[3]
      };
    }
    
    // Format 2: w25 12 13 or split by whitespace
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      return {
        seriesYear: parts[0].toLowerCase(),
        paper: parts[1],
        question: parts[2]
      };
    }
    
    return null;
  };

  const getMonth = (series: string) => {
    const char = series.charAt(0).toLowerCase();
    if (char === 'm') return 'March';
    if (char === 's') return 'May';
    if (char === 'w') return 'Nov';
    return series;
  };

  const getYear = (series: string) => {
    const yearDigits = series.substring(1);
    return `20${yearDigits}`;
  };

  const handleSearch = () => {
    if (!answerData) return;
    
    const parsed = parseInput(inputValue);
    if (!parsed) {
      setSearchResult({
        caption: "Invalid input format. Use '9702_w25_qp_12_q13' or 'w25 12 13'.",
        imgUrl: "",
        answer: "",
        found: false
      });
      return;
    }

    const { seriesYear, paper, question } = parsed;
    const month = getMonth(seriesYear);
    const year = getYear(seriesYear);
    
    // Construct keys as per instructions
    // To get answers from json, replace 'qp' in papername with 'ms'
    const msPaperKey = `9702_${seriesYear}_ms_${paper}`;
    const qpPaperKey = `9702_${seriesYear}_qp_${paper}`; // For image URL and display

    const answer = (answerData[msPaperKey] && answerData[msPaperKey][question]) || "Not Found";
    
    const caption = `${month} ${year} Paper ${paper} Q${question} | Ans: ${answer}`;
    const imgUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/9702-p1-parts-jpg/files/9702_${seriesYear}_qp_${paper}-Q${question}/view?project=daddy-cambridge`;

    setSearchResult({
      caption,
      imgUrl,
      answer,
      found: true
    });
    setCopyStatus('idle');
  };

  const handleCopyImage = async () => {
    if (!searchResult?.imgUrl || !imgRef.current) return;
    
    setCopyStatus('copying');
    try {
      const response = await fetch(searchResult.imgUrl);
      const blob = await response.blob();
      const canvas = document.createElement('canvas');
      const img = imgRef.current;
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Apply white background if it's transparent, then draw image
        // To handle dark:invert, we need to decide if we copy the inverted or original
        // Usually, people want the original (black on white) when copying
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (pngBlob) => {
          if (pngBlob) {
            try {
              const item = new ClipboardItem({ 'image/png': pngBlob });
              await navigator.clipboard.write([item]);
              setCopyStatus('success');
              setTimeout(() => setCopyStatus('idle'), 2000);
            } catch (err) {
              console.error('Clipboard error:', err);
              setCopyStatus('error');
            }
          }
        }, 'image/png');
      }
    } catch (err) {
      console.error('Copy error:', err);
      setCopyStatus('error');
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center min-h-screen pt-10">
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <ModeToggle />
      </div>
      <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-primary text-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">MCQ Viewer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input
                placeholder="e.g. 9702_w25_qp_12_q13 or w25 12 13"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isJsonLoading}
                className="pr-10"
              />
              {isJsonLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isJsonLoading || !inputValue.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {jsonError && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{jsonError}</span>
            </div>
          )}

          {searchResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className={`p-4 rounded-md border-l-4 ${searchResult.found ? 'bg-secondary/50 border-primary' : 'bg-destructive/10 border-destructive'}`}>
                <p className="font-medium text-lg">{searchResult.caption}</p>
              </div>

              {searchResult.found && searchResult.imgUrl && (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden bg-white dark:bg-zinc-950 p-2 flex justify-center">
                    <img
                      id="question-image"
                      ref={imgRef}
                      src={searchResult.imgUrl}
                      alt="Question Image"
                      crossOrigin="anonymous"
                      className="max-w-full h-auto object-contain dark:invert"
                      onError={() => {
                        setSearchResult(prev => prev ? { ...prev, imgUrl: "" } : null);
                      }}
                    />
                    {!searchResult.imgUrl && (
                      <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-10 w-10 mb-2" />
                        <p>Image not found</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={handleCopyImage}
                      disabled={copyStatus === 'copying' || !searchResult.imgUrl}
                      className="w-full sm:w-auto"
                    >
                      {copyStatus === 'copying' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : copyStatus === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copyStatus === 'success' ? 'Copied!' : copyStatus === 'error' ? 'Failed to copy' : 'Copy Image'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MCQViewer;
