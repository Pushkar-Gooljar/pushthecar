import BattleShipBoard from "@/components/BattleShipBoard.tsx";


const Battleship = () => {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <BattleShipBoard />
        </div>
    );
};

export default Battleship;