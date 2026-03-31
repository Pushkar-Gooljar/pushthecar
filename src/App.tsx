import {Route, Routes} from "react-router-dom";
import Home from "@/pages/Home.tsx";
import PastPapers from "@/pages/PastPapers.tsx";
import Battleship from "@/pages/Battleship.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/pastpapers" element={<PastPapers/>}/>
            <Route path="/battleship" element={<Battleship/>}/>
        </Routes>
    );
}

export default App;