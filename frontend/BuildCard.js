import { Link } from "react-router-dom";
import { Heart, Cpu, Zap } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function BuildCard({
  build,
  isFavorite = false,
  onToggleFavorite,
}) {
  const auth = useAuth();
  const user = auth?.user;

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Sign in to save favorites");
      return;
    }

    try {
      const response = await api.post(`/builds/${build?.id}/favorite`);

      const data = response.data;

      if (onToggleFavorite) {
        onToggleFavorite(build?.id, data?.is_favorite);
      }

      toast.success(
        data?.is_favorite ? "Added to favorites" : "Removed from favorites",
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorite");
    }
  };

  const categoryColor =
    {
      Gaming: "border-cyan-400/40 text-cyan-400",
      Workstation: "border-fuchsia-400/40 text-fuchsia-300",
      "Content Creation": "border-violet-400/40 text-violet-300",
      Office: "border-emerald-400/40 text-emerald-300",
      Budget: "border-amber-400/40 text-amber-300",
    }[build?.category] || "border-zinc-700 text-zinc-300";

  return (
    <Link to={`/build/${build?.id}`} data-testid={`build-card-${build?.id}`}>
      <div className="card-tech rounded-xl overflow-hidden group h-full flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={build?.image_url || "https://via.placeholder.com/600x400"}
            alt={build?.name || "PC Build"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant="outline"
              className={`bg-black/60 backdrop-blur ${categoryColor}`}
            >
              {build?.category || "Custom"}
            </Badge>

            {build?.ai_generated && (
              <Badge
                variant="outline"
                className="bg-black/60 backdrop-blur border-emerald-400/40 text-emerald-300"
              >
                AI
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavorite}
            data-testid={`fav-btn-${build?.id}`}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/10 hover:border-rose-400/50 transition"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-rose-400 text-rose-400" : "text-white"
              }`}
            />
          </button>

          {/* Bottom Text */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="label-mono text-cyan-400">
              {build?.tier || "Standard"} Tier
            </p>

            <h3 className="font-heading text-xl font-semibold text-white mt-1 line-clamp-1">
              {build?.name || "Unnamed Build"}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            {/* Specs */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">
                  {build?.specs?.cpu || "Unknown CPU"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-zinc-300">
                <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
                <span className="truncate">
                  {build?.specs?.gpu || "Unknown GPU"}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              <p className="label-mono">Price</p>

              <p className="font-mono text-xl text-cyan-400 font-semibold">
                ${Number(build?.price || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Button */}
          <Button
            size="sm"
            variant="outline"
            className="btn-ghost-neon mt-auto"
            data-testid={`view-build-${build?.id}`}
          >
            View Build →
          </Button>
        </div>
      </div>
    </Link>
  );
}
