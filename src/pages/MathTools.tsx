import { useParams } from "react-router-dom";
import BinomialDistCalculator from "@/components/math/BinomialDistCalculator.tsx";

const MathTools = () => {
    const { tool } = useParams<{ tool: string }>();

    return (
        <div>



            {tool === "binomial-calc" && <BinomialDistCalculator/>}
        </div>
    );
};

export default MathTools;