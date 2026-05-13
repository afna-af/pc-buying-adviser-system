import { Link } from "react-router-dom";
import {
  Sparkles,
  Cpu,
  MessageSquare,
  GitCompareArrows,
  Bot,
  ArrowRight,
  Zap,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function Landing() {
  const features = [
    {
      icon: MessageSquare,
      title: "Conversational AI",
      desc: "Tell the bot your budget and use case. Get a tailored build with real part numbers and prices.",
      color: "cyan",
    },
    {
      icon: Cpu,
      title: "Curated Catalog",
      desc: "12 hand-tuned PC builds across Gaming, Workstation, Content Creation, Office & Budget tiers.",
      color: "fuchsia",
    },
    {
      icon: GitCompareArrows,
      title: "Side-by-Side Compare",
      desc: "Pit two builds against each other. See spec differences and performance scores instantly.",
      color: "emerald",
    },
  ];

  return (
    <div className="bg-radial-glow">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1679766900523-d8e1a1393d1f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(180deg, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, black 0%, transparent 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <Badge
              variant="outline"
              className="border-cyan-400/40 text-cyan-400 bg-black/40 backdrop-blur mb-6"
              data-testid="hero-badge"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Claude / GPT / Gemini
            </Badge>

            {/* Heading */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.05]">
              Stop guessing.
              <br />
              Build the <span className="text-neon">perfect PC.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg text-zinc-400 max-w-2xl leading-relaxed">
              An AI buying advisor that asks the right questions, recommends
              real parts, and compares builds side-by-side. From a $650 office
              mini to a $6,500 render workstation.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/chat">
                <Button
                  size="lg"
                  className="btn-neon h-12 px-6"
                  data-testid="hero-cta-chat"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Start AI Advisor
                </Button>
              </Link>

              <Link to="/catalog">
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-ghost-neon h-12 px-6"
                  data-testid="hero-cta-catalog"
                >
                  Browse Builds
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 blink" />
                12+ curated 2026 builds
              </div>

              <div className="flex items-center gap-2 text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 blink" />3 AI
                models on tap
              </div>

              <div className="flex items-center gap-2 text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 blink" />
                Live spec comparison
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="label-mono text-cyan-400">Capabilities</p>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-2 mb-16 max-w-2xl">
            Built like a hardware nerd. Talks like a friend.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="card-tech rounded-xl p-7"
                  data-testid={`feature-${feature.title}`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center mb-5 border ${
                      feature.color === "cyan"
                        ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                        : feature.color === "fuchsia"
                          ? "bg-fuchsia-400/10 border-fuchsia-400/30 text-fuchsia-300"
                          : "bg-emerald-400/10 border-emerald-400/30 text-emerald-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-heading text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto card-tech rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="label-mono text-fuchsia-300">Ready when you are</p>

              <h3 className="font-heading text-3xl font-bold text-white mt-2">
                Find your next rig in 60 seconds.
              </h3>

              <p className="text-zinc-400 mt-2">
                No spreadsheets. No Reddit threads. Just answers.
              </p>
            </div>

            <Link to="/chat">
              <Button
                size="lg"
                className="btn-neon h-12 px-7"
                data-testid="cta-final"
              >
                Talk to RIGS.AI
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
