import {Route, Routes} from "react-router-dom";
import Doomsday from "@/pages/Doomsday.tsx";
import Home from "@/pages/Home.tsx";
import PastPapers from "@/pages/PastPapers.tsx";
import Battleship from "@/pages/Battleship.tsx";
import EssayRanking from "@/pages/EssayRanking.tsx";
import MCQViewer from "@/pages/MCQViewer.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/pastpapers" element={<PastPapers/>}/>
                <Route path="/battleship" element={<Battleship/>}/>
                <Route path="/doomsday" element={<Doomsday/>}/>
                <Route path="/essay-ranking" element={<EssayRanking/>}/>
                <Route path="/mcq-viewer" element={<MCQViewer/>}/>
            </Routes>
        </ThemeProvider>
    );
}

export default App;