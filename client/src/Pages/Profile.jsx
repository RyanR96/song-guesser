import { useParams } from "react-router-dom";
import UserStatsCard from "../Components/UserStatsCard";
import { useState } from "react";
import { useEffect } from "react";

function Profile() {
  const API_URL = "http://localhost:3000";
  const { username } = useParams();

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_URL}/users/${encodeURIComponent(username)}/stats`,
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch user stats");
          return;
        }

        console.log(data);

        setStats(data);
      } catch (err) {
        console.error("Failed to fetch user stats", err);
        setError("Something went wrong fetching user stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [API_URL, username]);

  if (loading) return <p>Loading profile...</p>;

  if (error) return <p>{error}</p>;

  if (!stats) return <p>No stats found</p>;

  return (
    <div>
      <h1>Profile</h1>
      <UserStatsCard stats={stats} />
    </div>
  );
}

export default Profile;
