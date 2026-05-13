import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  ArrowLeft,
  Cpu,
  Zap,
  MemoryStick,
  HardDrive,
  CircuitBoard,
  Plug,
  Snowflake,
  Box,
  Heart,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

import { toast } from "sonner";

import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const SPEC_ICONS = {
  cpu: Cpu,
  gpu: Zap,
  ram: MemoryStick,
  storage: HardDrive,
  motherboard: CircuitBoard,
  psu: Plug,
  cooling: Snowflake,
  case: Box,
};

export default function BuildDetail() {
  const { id } = useParams();

  const auth = useAuth();
  const user = auth?.user;

  const [build, setBuild] = useState(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    loadBuild();

    if (user) {
      loadFavorites();
    }
  }, [id, user]);

  // Load Build
  const loadBuild = async () => {
    try {
      const response = await api.get(`/builds/${id}`);

      setBuild(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Build not found");
    }
  };

  // Load Favorites
  const loadFavorites = async () => {
    try {
      const response = await api.get("/builds/favorites");

      const found = response.data.some((b) => String(b.id) === String(id));

      setIsFav(found);
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle Favorite
  const toggleFav = async () => {
    if (!user) {
      toast.error("Sign in to save favorites");
      return;
    }

    try {
      const response = await api.post(`/builds/${id}/favorite`);

      const data = response.data;

      setIsFav(data?.is_favorite);

      toast.success(
        data?.is_favorite ? "Added to favorites" : "Removed from favorites",
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed");
    }
  };

  // Loading
  if (!build) {
    return <div className="text-center text-zinc-500 py-24">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Back */}
      <Link
        to="/catalog"
        className="inline-flex items-center text-zinc-400 hover:text-cyan-400 text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to catalog
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left */}
        <div>
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-white/5 mb-4 relative">
            <img
              src={build?.image_url || "https://via.placeholder.com/800x600"}
              alt={build?.name || "PC Build"}
              className="w-full aspect-[4/3] object-cover"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-black/60 backdrop-blur border-cyan-400/40 text-cyan-400"
              >
                {build?.category || "Custom"}
              </Badge>

              <Badge
                variant="outline"
                className="bg-black/60 backdrop-blur border-fuchsia-400/40 text-fuchsia-300"
              >
                {build?.tier || "Standard"}
              </Badge>

              {build?.ai_generated && (
                <Badge
                  variant="outline"
                  className="bg-black/60 backdrop-blur border-emerald-400/40 text-emerald-300"
                >
                  AI Generated
                </Badge>
              )}
            </div>
          </div>

          {/* Performance */}
          <div className="card-tech rounded-xl p-6">
            <h3 className="font-heading text-lg mb-4">Performance</h3>

            {Object.entries(build?.performance || {}).map(([key, value]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="capitalize text-zinc-300">
                    {key.replace("_", " ")}
                  </span>

                  <span className="text-cyan-400 font-mono">{value}/100</span>
                </div>

                <Progress
                  value={value}
                  className="h-2 bg-zinc-900"
                  data-testid={`perf-${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <p className="label-mono text-cyan-400">
            {build?.tier} • {build?.category}
          </p>

          <h1 className="font-heading text-4xl font-bold text-white mt-1">
            {build?.name}
          </h1>

          <p className="text-zinc-400 mt-3 leading-relaxed">
            {build?.description}
          </p>

          {/* Price */}
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            <div>
              <p className="label-mono">Total Build Price</p>

              <p
                className="font-heading text-4xl text-neon font-bold mt-1"
                data-testid="build-price"
              >
                ${Number(build?.price || 0).toLocaleString()}
              </p>
            </div>

            {/* Favorite */}
            <Button
              onClick={toggleFav}
              variant="outline"
              className="btn-ghost-neon h-11"
              data-testid="detail-fav-btn"
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isFav ? "fill-rose-400 text-rose-400" : ""
                }`}
              />

              {isFav ? "Saved" : "Save"}
            </Button>
          </div>

          {/* Specs */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(build?.specs || {}).map(([key, value]) => {
              const Icon = SPEC_ICONS[key] || Cpu;

              return (
                <div
                  key={key}
                  className="bg-black/40 border border-white/5 rounded-lg p-4 hover:border-cyan-400/30 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />

                    <p className="label-mono">{key}</p>
                  </div>

                  <p className="text-sm text-white">{value}</p>
                </div>
              );
            })}
          </div>

          {/* Pros & Cons */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {/* Pros */}
            <div className="card-tech rounded-xl p-5">
              <p className="label-mono text-emerald-300 mb-3">Pros</p>

              <ul className="space-y-2 text-sm text-zinc-300">
                {(build?.pros || []).map((pro, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-emerald-400">+</span>

                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="card-tech rounded-xl p-5">
              <p className="label-mono text-rose-300 mb-3">Cons</p>

              <ul className="space-y-2 text-sm text-zinc-300">
                {(build?.cons || []).map((con, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-rose-400">−</span>

                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
