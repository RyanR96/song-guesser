import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Gamepage from "./Pages/Gamepage";
import Profile from "./Pages/Profile";
import NotFound from "./Pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/game" element={<Gamepage />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="*" element={<NotFound message="Page not found" />} />
    </Routes>
  );
}

export default App;
