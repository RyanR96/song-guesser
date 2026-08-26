import { useParams } from "react-router-dom";
import UserStatsCard from "../Components/UserStatsCard";
import NotFound from "./NotFound";
import { useState } from "react";
import { useEffect } from "react";

function Profile() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { username } = useParams();

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        const res = await fetch(
          `${API_URL}/users/${encodeURIComponent(username)}/stats`,
        );

        const data = await res.json();

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          setError(data.message || "Failed to fetch user stats");
          return;
        }
        /**
         *  console.log(data);
         */

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

  if (notFound) {
    return <NotFound message="User profile not found" />;
  }

  if (error) return <p>{error}</p>;

  if (!stats) return <p>No stats found</p>;

  return (
    <main className="min-h-[calc(100dvh-73px)] bg-gradient-to-b from-purple-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl border border-purple-100 bg-white/90 px-6 py-10 text-center shadow-sm backdrop-blur">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {stats.username ?? username}
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Registered Player
          </p>
        </section>

        <section className="mt-12">
          <UserStatsCard stats={stats} />
        </section>
      </div>
    </main>
  );
}

export default Profile;
