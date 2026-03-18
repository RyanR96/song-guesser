import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Gamepage from "./Pages/Gamepage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/game" element={<Gamepage />} />
    </Routes>
  );
}

export default App;
