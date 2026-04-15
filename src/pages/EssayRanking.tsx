import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dices, Download, Trophy } from "lucide-react";

type Question = {
  id: string;
  text: string;
};

type PaperData = Record<string, Record<string, string>>;

export default function EssayRanking() {
  const [data, setData] = useState<PaperData>({});
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [rankedOrder, setRankedOrder] = useState<string[]>([]);
  const [comparison, setComparison] = useState<[string, string] | null>(null);

  // Load data
  useEffect(() => {
    fetch('/8021-P1_questions.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        const papers = Object.keys(json);
        if (papers.length > 0) {
          handleSelectPaper(papers[0], json);
        }
      });
  }, []);

  const handleSelectPaper = (paperId: string, currentData = data) => {
    setSelectedPaper(paperId);
    const paperQuestions = currentData[paperId];
    const qList = Object.entries(paperQuestions).map(([id, text]) => ({ id, text }));
    setQuestions(qList);
    const allIds = qList.map(q => q.id);
    setCheckedIds(new Set(allIds));
    setRankedOrder(allIds);
    setComparison(null);
  };

  const handleRandomPaper = () => {
    const papers = Object.keys(data);
    if (papers.length > 0) {
      const randomPaper = papers[Math.floor(Math.random() * papers.length)];
      handleSelectPaper(randomPaper);
    }
  };

  const toggleCheckbox = (id: string) => {
    const newChecked = new Set(checkedIds);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIds(newChecked);
  };

  // Efficient ranking using a simple comparison-based approach.
  // We'll use a modified insertion sort or just pick two random ones from the top non-finalized?
  // Actually, a simple way to "rank" is to keep track of wins/losses or just use a basic tournament.
  // Let's implement a simple "battle" system: pick two from the checked ones that are close in the current ranked order.
  
  useEffect(() => {
    // Whenever checkedIds or selectedPaper changes, reset ranked order but keep checked ones on top
    const checked = questions.filter(q => checkedIds.has(q.id)).map(q => q.id);
    const unchecked = questions.filter(q => !checkedIds.has(q.id)).map(q => q.id);
    
    // We want to preserve existing ranking as much as possible
    const newOrder = rankedOrder.filter(id => checkedIds.has(id));
    // Add any newly checked ones to the end of the ranked part
    checked.forEach(id => {
        if (!newOrder.includes(id)) newOrder.push(id);
    });
    
    setRankedOrder([...newOrder, ...unchecked]);
  }, [checkedIds, questions]);

  // Pick two items to compare from the "checked" pool.
  // To make it efficient, we can pick items that are adjacent in the current rankedOrder.
  const findNextBattle = () => {
    const checkedRanked = rankedOrder.filter(id => checkedIds.has(id));
    if (checkedRanked.length < 2) {
      setComparison(null);
      return;
    }
    // Pick a random pair that hasn't been "settled"? 
    // For simplicity, let's just pick two random ones from checked.
    const idx1 = Math.floor(Math.random() * checkedRanked.length);
    let idx2 = Math.floor(Math.random() * checkedRanked.length);
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * checkedRanked.length);
    }
    setComparison([checkedRanked[idx1], checkedRanked[idx2]]);
  };

  useEffect(() => {
    if (!comparison && checkedIds.size >= 2) {
        findNextBattle();
    }
  }, [rankedOrder, comparison, checkedIds]);

  const handleChoose = (winnerId: string) => {
    if (!comparison) return;
    const loserId = comparison[0] === winnerId ? comparison[1] : comparison[0];
    
    const newOrder = [...rankedOrder];
    const winnerIdx = newOrder.indexOf(winnerId);
    const loserIdx = newOrder.indexOf(loserId);

    // If winner is below loser, move winner above loser
    if (winnerIdx > loserIdx) {
      newOrder.splice(winnerIdx, 1);
      newOrder.splice(loserIdx, 0, winnerId);
      setRankedOrder(newOrder);
    }
    
    findNextBattle();
  };

  const downloadJson = () => {
    const orderedQuestions = rankedOrder.map(id => {
        const q = questions.find(q => q.id === id);
        return { id, text: q?.text, checked: checkedIds.has(id) };
    });
    const blob = new Blob([JSON.stringify(orderedQuestions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPaper}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Essay Ranking</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedPaper} onValueChange={handleSelectPaper}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a paper" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(data).map(paperId => (
                <SelectItem key={paperId} value={paperId}>{paperId}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRandomPaper}>
            <Dices className="h-4 w-4" />
          </Button>
          <Button onClick={downloadJson} variant="secondary">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Battle Area */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Choose Your Favorite
            </CardTitle>
            <CardDescription>
              Select the essay topic you prefer between these two.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison && checkedIds.size >= 2 ? (
              <div className="flex flex-col gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 px-4 text-left justify-start whitespace-normal border-2 hover:border-primary transition-all"
                  onClick={() => handleChoose(comparison[0])}
                >
                  <span className="font-bold mr-2 text-primary">{comparison[0]}.</span>
                  {questions.find(q => q.id === comparison[0])?.text}
                </Button>
                <div className="flex justify-center items-center">
                  <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-1 rounded">VS</span>
                </div>
                <Button 
                  variant="outline" 
                  className="h-auto py-6 px-4 text-left justify-start whitespace-normal border-2 hover:border-primary transition-all"
                  onClick={() => handleChoose(comparison[1])}
                >
                  <span className="font-bold mr-2 text-primary">{comparison[1]}.</span>
                  {questions.find(q => q.id === comparison[1])?.text}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {checkedIds.size < 2 
                  ? "Check at least 2 questions to start ranking." 
                  : "Loading next battle..."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: List of Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Current Ranking</CardTitle>
            <CardDescription>
              Toggle checkboxes to include/exclude questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {rankedOrder.map((id) => {
                const q = questions.find(item => item.id === id);
                if (!q) return null;
                const isChecked = checkedIds.has(id);
                return (
                  <li 
                    key={id} 
                    className={`flex items-start gap-3 p-2 rounded transition-colors ${!isChecked ? 'opacity-40 bg-muted/50 grayscale' : 'bg-card'}`}
                  >
                    <Checkbox 
                      id={`q-${id}`} 
                      checked={isChecked} 
                      onCheckedChange={() => toggleCheckbox(id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`q-${id}`}
                        className={`text-sm leading-tight cursor-pointer ${!isChecked ? 'line-through decoration-1' : ''}`}
                      >
                        <span className="font-bold mr-1">{id}.</span>
                        {q.text}
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
