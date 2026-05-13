import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { Heart, MessageSquare, User } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import BuildCard from "../components/BuildCard";

import api from "../lib/api";

import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Load Data
  useEffect(() => {
    if (user === null) {
      navigate("/login");
      return;
    }

    if (!user) {
      return;
    }

    loadFavorites();
    loadSessions();
  }, [user, navigate]);

  // Favorites
  const loadFavorites = async () => {
    try {
      const response = await api.get("/builds/favorites");

      setFavorites(response.data || []);
    } catch (error) {
      console.error("Favorites Load Error:", error);
    }
  };

  // Sessions
  const loadSessions = async () => {
    try {
      const response = await api.get("/chat/sessions");

      setSessions(response.data || []);
    } catch (error) {
      console.error("Sessions Load Error:", error);
    }
  };

  // Loading
  if (user === undefined) {
    return <div className="text-center text-zinc-500 py-24">Loading...</div>;
  }

  // Not Logged In
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center">
          <User className="w-7 h-7 text-black" />
        </div>

        <div>
          <p className="label-mono text-cyan-400">Profile</p>

          <h1 className="font-heading text-4xl font-bold text-white">
            {user?.name || "User"}
          </h1>

          <p className="text-zinc-400 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="favorites" data-testid="tab-favorites">
            <Heart className="w-4 h-4 mr-2" />
            Favorites ({favorites.length})
          </TabsTrigger>

          <TabsTrigger value="history" data-testid="tab-history">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat History ({sessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Favorites */}
        <TabsContent value="favorites" className="mt-6">
          {favorites.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">
              No favorites yet.{" "}
              <Link to="/catalog" className="text-cyan-400 hover:underline">
                Browse builds
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((build) => (
                <BuildCard key={build.id} build={build} isFavorite={true} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-6">
          {sessions.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">
              No chats yet.{" "}
              <Link to="/chat" className="text-cyan-400 hover:underline">
                Start one
              </Link>
              .
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/chat?session=${session.id}`}
                  data-testid={`history-${session.id}`}
                  className="card-tech rounded-xl p-5 block hover:border-cyan-400/40 transition"
                >
                  <p className="label-mono text-cyan-400">
                    {session.model || "AI"}
                  </p>

                  <p className="text-white font-medium mt-2 line-clamp-2">
                    {session.title}
                  </p>

                  <p className="text-xs text-zinc-500 mt-3 font-mono">
                    {session.updated_at
                      ? new Date(session.updated_at).toLocaleString()
                      : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
