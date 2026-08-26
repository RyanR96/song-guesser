import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Homepage from "./Pages/Homepage";
import Gamepage from "./Pages/Gamepage";
import Profile from "./Pages/Profile";
import NotFound from "./Pages/NotFound";
import Layout from "./Components/Layout";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          localStorage.removeItem("token");
          setToken(null);
          setCurrentUser(null);
          return;
        }

        setCurrentUser(data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    }

    fetchCurrentUser();
  }, [API_URL, token]);

  function handleAuthSuccess(newToken) {
    localStorage.setItem("token", newToken);
    localStorage.removeItem("guestUsername");
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  }

  return (
    <Routes>
      <Route
        element={
          <Layout
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
          />
        }
      >
        <Route
          path="/"
          element={
            <Homepage
              currentUser={currentUser}
              onAuthSuccess={handleAuthSuccess}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/game" element={<Gamepage />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="*" element={<NotFound message="Page not found" />} />
      </Route>
    </Routes>
  );
}

export default App;
