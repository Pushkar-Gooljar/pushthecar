import {Route, Routes} from "react-router-dom";
import Home from "@/pages/Home.tsx";
import PastPapers from "@/pages/PastPapers.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/pastpapers" element={<PastPapers/>}/>
        </Routes>
    );
}

export default App;