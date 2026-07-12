import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Gamepage from "./Pages/Gamepage";
import Profile from "./Pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/game" element={<Gamepage />} />
      <Route path="/profile/:username" element={<Profile />} />
    </Routes>
  );
}

export default App;
