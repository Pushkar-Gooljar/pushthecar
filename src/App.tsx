import {Route, Routes} from "react-router-dom";
import Doomsday from "@/pages/Doomsday.tsx";
import Home from "@/pages/Home.tsx";
import PastPapers from "@/pages/PastPapers.tsx";
import Battleship from "@/pages/Battleship.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/pastpapers" element={<PastPapers/>}/>
            <Route path="/battleship" element={<Battleship/>}/>
            <Route path="/doomsday" element={<Doomsday/>}/>
        </Routes>
    );
}

export default App;