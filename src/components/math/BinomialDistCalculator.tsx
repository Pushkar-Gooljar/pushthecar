import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper for combinations: nCr
const combinations = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    if (r > n / 2) r = n - r;

    let res = 1;
    for (let i = 1; i <= r; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
};

// PMF: P(X = k)
const binomialPMF = (n: number, p: number, k: number): number => {
    return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
};

type BoundaryType = 'inclusive' | 'exclusive';

const BinomialDistCalculator: React.FC = () => {
    // State for parameters
    const [n, setN] = useState<number>(10);
    const [p, setP] = useState<number>(0.5);
    const [a, setA] = useState<number>(2);
    const [b, setB] = useState<number>(5);
    const [lowerType, setLowerType] = useState<BoundaryType>('inclusive');
    const [upperType, setUpperType] = useState<BoundaryType>('inclusive');

    const result = useMemo(() => {
        if (n < 0 || p < 0 || p > 1) return 0;

        // Adjust range based on boundary types
        // a < X becomes X >= a + 1
        // X < b becomes X <= b - 1
        const start = lowerType === 'inclusive' ? Math.ceil(a) : Math.floor(a) + 1;
        const end = upperType === 'inclusive' ? Math.floor(b) : Math.ceil(b) - 1;

        let probability = 0;
        for (let k = start; k <= end; k++) {
            if (k >= 0 && k <= n) {
                probability += binomialPMF(n, p, k);
            }
        }
        return probability;
    }, [n, p, a, b, lowerType, upperType]);

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Binomial Distribution Calculator</CardTitle>
                <CardDescription>
                    Calculate $P(a \le X \le b)$ where $X \sim B(n, p)$
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Distribution Parameters */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="n-val">Number of trials (n)</Label>
                        <Input
                            id="n-val"
                            type="number"
                            value={n}
                            onChange={(e) => setN(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="p-val">Probability of success (p)</Label>
                        <Input
                            id="p-val"
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={p}
                            onChange={(e) => setP(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Range Inputs */}
                <div className="flex flex-wrap items-end gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-24 space-y-2">
                        <Label>Lower (a)</Label>
                        <Input
                            type="number"
                            value={a}
                            onChange={(e) => setA(Number(e.target.value))}
                        />
                    </div>

                    <div className="w-32 space-y-2">
                        <Select
                            value={lowerType}
                            onValueChange={(v) => setLowerType(v as BoundaryType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inclusive">{'≤ X'}</SelectItem>
                                <SelectItem value="exclusive">{'< X'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center h-10 px-2 font-bold">AND</div>

                    <div className="w-32 space-y-2">
                        <Select
                            value={upperType}
                            onValueChange={(v) => setUpperType(v as BoundaryType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inclusive">{'X ≤'}</SelectItem>
                                <SelectItem value="exclusive">{'X <'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-24 space-y-2">
                        <Label>Upper (b)</Label>
                        <Input
                            type="number"
                            value={b}
                            onChange={(e) => setB(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Results Display */}
                <Alert variant="default" className="bg-primary/5 border-primary/20">
                    <AlertDescription className="text-center text-lg">
                        <span className="font-semibold">Result:</span>{' '}
                        <code className="bg-background px-2 py-1 rounded border">
                            P = {result.toLocaleString(undefined, {
                            minimumFractionDigits: 6,
                            maximumFractionDigits: 6
                        })}
                        </code>
                        <p className="text-sm text-muted-foreground mt-2">
                            ≈ {(result * 100).toFixed(2)}%
                        </p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default BinomialDistCalculator;