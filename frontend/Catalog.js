import { useEffect, useState } from "react";

import { Filter, Sparkles, Loader2 } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Slider } from "../components/ui/slider";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

import { Textarea } from "../components/ui/textarea";

import { toast } from "sonner";

import BuildCard from "../components/BuildCard";

import api, { formatApiError } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const CATEGORIES = [
  "All",
  "Gaming",
  "Workstation",
  "Content Creation",
  "Office",
  "Budget",
];

const MODELS = [
  {
    value: "claude",
    label: "Claude Sonnet 4.5",
  },
  {
    value: "gpt",
    label: "GPT-5.2",
  },
  {
    value: "gemini",
    label: "Gemini 3 Flash",
  },
];

export default function Catalog() {
  const auth = useAuth();
  const user = auth?.user;

  const [builds, setBuilds] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  const [category, setCategory] = useState("All");

  const [priceRange, setPriceRange] = useState([400, 7000]);

  const [loading, setLoading] = useState(true);

  // AI Dialog
  const [openAI, setOpenAI] = useState(false);

  const [budget, setBudget] = useState(1500);

  const [useCase, setUseCase] = useState("1440p gaming");

  const [prefs, setPrefs] = useState("");

  const [aiModel, setAiModel] = useState("claude");

  const [aiLoading, setAiLoading] = useState(false);

  // Load Builds
  const load = async () => {
    setLoading(true);

    try {
      const params = {
        min_price: priceRange[0],
        max_price: priceRange[1],
      };

      if (category !== "All") {
        params.category = category;
      }

      const response = await api.get("/builds", { params });

      setBuilds(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load builds");
    } finally {
      setLoading(false);
    }
  };

  // Load Favorites
  const loadFavs = async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }

    try {
      const response = await api.get("/builds/favorites");

      const ids = response.data.map((build) => build.id);

      setFavorites(new Set(ids));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, [category, priceRange]);

  useEffect(() => {
    loadFavs();
  }, [user]);

  // Toggle Favorite
  const onToggleFav = (id, isFav) => {
    setFavorites((prev) => {
      const next = new Set(prev);

      if (isFav) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  };

  // AI Generate
  const generateAI = async () => {
    setAiLoading(true);

    try {
      const response = await api.post("/recommend", {
        budget: Number(budget),
        use_case: useCase,
        preferences: prefs,
        model: aiModel,
      });

      const data = response.data;

      toast.success(`Generated: ${data?.name || "Custom Build"}`);

      setOpenAI(false);

      load();
    } catch (e) {
      toast.error(
        formatApiError(e?.response?.data?.detail) || "AI generation failed",
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="label-mono text-cyan-400">Catalog</p>

          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-1">
            Curated PC Builds
          </h1>

          <p className="text-zinc-400 mt-2 max-w-xl">
            Hand-tuned rigs for every budget. Filter by category, price, or
            generate a custom build with AI.
          </p>
        </div>

        {/* AI Dialog */}
        <Dialog open={openAI} onOpenChange={setOpenAI}>
          <DialogTrigger asChild>
            <Button
              className="btn-neon h-11 px-5"
              data-testid="ai-generate-btn"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Custom Build
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-zinc-950 border-white/10">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">
                Generate a custom build
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Budget */}
              <div>
                <label className="label-mono">Budget (USD)</label>

                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-black/60 border-white/10 mt-1"
                  data-testid="recommend-budget"
                />
              </div>

              {/* Use Case */}
              <div>
                <label className="label-mono">Use case</label>

                <Input
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="bg-black/60 border-white/10 mt-1"
                  placeholder="1440p gaming, editing, ML dev..."
                  data-testid="recommend-use-case"
                />
              </div>

              {/* Preferences */}
              <div>
                <label className="label-mono">Preferences</label>

                <Textarea
                  value={prefs}
                  onChange={(e) => setPrefs(e.target.value)}
                  className="bg-black/60 border-white/10 mt-1"
                  placeholder="RGB, quiet, AMD preferred..."
                  data-testid="recommend-prefs"
                />
              </div>

              {/* Model */}
              <div>
                <label className="label-mono">AI model</label>

                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger
                    className="bg-black/60 border-white/10 mt-1"
                    data-testid="recommend-model"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-zinc-900 border-white/10">
                    {MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <Button
                onClick={generateAI}
                className="btn-neon w-full"
                disabled={aiLoading}
                data-testid="recommend-submit"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Generate Build
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="card-tech rounded-xl p-5 mb-8 grid md:grid-cols-3 gap-6 items-end">
        {/* Category */}
        <div>
          <label className="label-mono flex items-center gap-2 mb-2">
            <Filter className="w-3 h-3" />
            Category
          </label>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              className="bg-black/60 border-white/10"
              data-testid="filter-category"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-zinc-900 border-white/10">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} data-testid={`cat-${cat}`}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Slider */}
        <div className="md:col-span-2">
          <label className="label-mono mb-2 block">
            Price Range:
            <span className="text-cyan-400 font-mono ml-2">
              ${priceRange[0]}
            </span>
            {" - "}
            <span className="text-cyan-400 font-mono">${priceRange[1]}</span>
          </label>

          <Slider
            min={400}
            max={7000}
            step={50}
            value={priceRange}
            onValueChange={setPriceRange}
            data-testid="price-slider"
          />
        </div>
      </div>

      {/* Builds */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : builds.length === 0 ? (
        <p className="text-center text-zinc-500 py-20">
          No builds match your filters.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="builds-grid"
        >
          {builds.map((build) => (
            <BuildCard
              key={build.id}
              build={build}
              isFavorite={favorites.has(build.id)}
              onToggleFavorite={onToggleFav}
            />
          ))}
        </div>
      )}
    </div>
  );
}
