import {useState, useMemo} from "react";
import "./BattleShipBoard.css"

interface Cell {
    state: number;
}

const ALL_SHIPS: Record<string, number> = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 2,
};

const SIZE = 10;

function generateBoard(size: number): Cell[][] {
    return Array.from({length: size}, () =>
        Array.from({length: size}, () => ({state: 0}))
    );
}

function computeHeatmap(board: Cell[][], activeShips: Record<string, number>): number[][] {
    const map: number[][] = Array.from({length: SIZE}, () => Array(SIZE).fill(0));

    for (let y = 0; y < SIZE; y++) {
        const row = board[y];
        for (const shipSize of Object.values(activeShips)) {
            for (let x = 0; x <= SIZE - shipSize; x++) {
                const slice = row.slice(x, x + shipSize);
                if (slice.every(cell => cell.state !== 1)) {
                    for (let i = x; i < x + shipSize; i++) map[y][i] += 1;
                }
            }
        }
    }

    for (let x = 0; x < SIZE; x++) {
        const col = board.map(row => row[x]);
        for (const shipSize of Object.values(activeShips)) {
            for (let y = 0; y <= SIZE - shipSize; y++) {
                const slice = col.slice(y, y + shipSize);
                if (slice.every(cell => cell.state !== 1)) {
                    for (let i = y; i < y + shipSize; i++) map[i][x] += 1;
                }
            }
        }
    }

    return map;
}

function heatmapColor(value: number, max: number): string {
    if (max === 0) return "rgba(0,0,0,0)";
    const t = value / max;
    const r = Math.round(255 * Math.min(1, t * 2));
    const g = Math.round(255 * Math.min(1, 2 - t * 2));
    return `rgba(${r}, ${g}, 0, 0.45)`;
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const BattleShipBoard = () => {
    const [board, setBoard] = useState<Cell[][]>(generateBoard(SIZE));
    const [sunkShips, setSunkShips] = useState<Set<string>>(new Set());

    const activeShips = useMemo(() =>
            Object.fromEntries(Object.entries(ALL_SHIPS).filter(([name]) => !sunkShips.has(name))),
        [sunkShips]
    );

    const heatmap = useMemo(() => computeHeatmap(board, activeShips), [board, activeShips]);
    const maxHeat = useMemo(() => Math.max(...heatmap.flat(), 1), [heatmap]);

    const handleClick = (rowIndex: number, colIndex: number) => {
        setBoard(board.map((row, rIdx) =>
            row.map((cell, cIdx) =>
                rIdx === rowIndex && cIdx === colIndex
                    ? {...cell, state: (cell.state + 1) % 3}
                    : cell
            )
        ));
    };

    const toggleSunk = (name: string) => {
        setSunkShips(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    const cellStyle = (rowIndex: number, colIndex: number, state: number): React.CSSProperties => {
        const heat = heatmap[rowIndex][colIndex];
        const style: React.CSSProperties = {backgroundColor: heatmapColor(heat, maxHeat)};
        if (state === 1) { style.outline = "3px solid #00ff88"; style.outlineOffset = "-3px"; }
        if (state === 2) { style.outline = "3px solid #ff3333"; style.outlineOffset = "-3px"; }
        return style;
    };

    return (
        <div className="battleship-wrapper">
            <div className="battleship-container">
                <div className="top">
                    {NUMBERS.map(n => <span key={n}>{n}</span>)}
                </div>
                <div className="side">
                    {LETTERS.map(l => <span key={l}>{l}</span>)}
                </div>
                <div className="battleship-board">
                    {board.map((row, rIdx) =>
                        row.map((cell, cIdx) => (
                            <button
                                key={`${rIdx}-${cIdx}`}
                                className="cell"
                                style={cellStyle(rIdx, cIdx, cell.state)}
                                onClick={() => handleClick(rIdx, cIdx)}
                            >
                                {heatmap[rIdx][cIdx]}
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="ship-panel">
                <h3>Sunk Ships</h3>
                {Object.entries(ALL_SHIPS).map(([name, size]) => (
                    <label key={name} className={`ship-label ${sunkShips.has(name) ? "sunk" : ""}`}>
                        <input
                            type="checkbox"
                            checked={sunkShips.has(name)}
                            onChange={() => toggleSunk(name)}
                        />
                        <span className="ship-name">{name}</span>
                        <span className="ship-size">{"■".repeat(size)}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default BattleShipBoard;