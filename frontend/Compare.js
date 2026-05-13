import { useEffect, useState } from "react";

import { GitCompareArrows } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

import api from "../lib/api";

export default function Compare() {
  const [builds, setBuilds] = useState([]);

  const [a, setA] = useState("");
  const [b, setB] = useState("");

  useEffect(() => {
    loadBuilds();
  }, []);

  // Load Builds
  const loadBuilds = async () => {
    try {
      const response = await api.get("/builds");

      const data = response.data || [];

      setBuilds(data);

      if (data[0]) {
        setA(String(data[0].id));
      }

      if (data[1]) {
        setB(String(data[1].id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Selected Builds
  const buildA = builds.find((x) => String(x.id) === String(a));

  const buildB = builds.find((x) => String(x.id) === String(b));

  // Price Difference
  const priceDiff = buildA && buildB ? buildB.price - buildA.price : 0;

  // Select Component
  const renderSelect = (value, setValue, testId) => (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger
        className="bg-black/60 border-white/10"
        data-testid={testId}
      >
        <SelectValue placeholder="Select a build" />
      </SelectTrigger>

      <SelectContent className="bg-zinc-900 border-white/10 max-h-80">
        {builds.map((build) => (
          <SelectItem key={build.id} value={String(build.id)}>
            {build.name} — ${Number(build.price || 0).toLocaleString()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="label-mono text-cyan-400">Comparison</p>

        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-1">
          Build vs Build
        </h1>

        <p className="text-zinc-400 mt-2">
          Pit two rigs against each other. Differences are highlighted in
          <span className="text-emerald-400"> green</span> and
          <span className="text-rose-400"> red</span>.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {renderSelect(a, setA, "compare-select-a")}

        {renderSelect(b, setB, "compare-select-b")}
      </div>

      {/* Compare Results */}
      {buildA && buildB && (
        <div
          className="card-tech rounded-xl overflow-hidden"
          data-testid="compare-results"
        >
          {/* Header Row */}
          <div className="grid grid-cols-3 border-b border-white/5">
            <div className="p-5 flex items-center label-mono text-zinc-500">
              <GitCompareArrows className="w-4 h-4 mr-2" />
              Spec
            </div>

            <BuildHeader build={buildA} />
            <BuildHeader build={buildB} />
          </div>

          {/* Price */}
          <Row label="Price">
            <Cell
              value={`$${Number(buildA.price || 0).toLocaleString()}`}
              highlight={
                buildA.price < buildB.price
                  ? "better"
                  : buildA.price > buildB.price
                    ? "worse"
                    : null
              }
            />

            <Cell
              value={`$${Number(buildB.price || 0).toLocaleString()}`}
              highlight={
                buildB.price < buildA.price
                  ? "better"
                  : buildB.price > buildA.price
                    ? "worse"
                    : null
              }
              sub={
                priceDiff !== 0
                  ? `${
                      priceDiff > 0 ? "+" : ""
                    }$${priceDiff.toLocaleString()} vs A`
                  : null
              }
            />
          </Row>

          {/* Specs */}
          {Object.keys(buildA.specs || {}).map((key) => (
            <Row key={key} label={key}>
              <Cell
                value={buildA.specs[key]}
                highlight={
                  buildA.specs[key] !== buildB?.specs?.[key] ? "neutral" : null
                }
              />

              <Cell
                value={buildB?.specs?.[key]}
                highlight={
                  buildA.specs[key] !== buildB?.specs?.[key] ? "neutral" : null
                }
              />
            </Row>
          ))}

          {/* Performance */}
          {Object.keys(buildA.performance || {}).map((key) => {
            const va = buildA.performance[key];

            const vb = buildB?.performance?.[key];

            return (
              <Row key={key} label={key.replace("_", " ")}>
                <PerfCell
                  value={va}
                  highlight={va > vb ? "better" : va < vb ? "worse" : null}
                />

                <PerfCell
                  value={vb}
                  highlight={vb > va ? "better" : vb < va ? "worse" : null}
                />
              </Row>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Build Header */
function BuildHeader({ build }) {
  return (
    <div className="p-5 border-l border-white/5">
      <Badge
        variant="outline"
        className="border-cyan-400/40 text-cyan-400 mb-2"
      >
        {build?.category || "Custom"}
      </Badge>

      <p className="font-heading text-lg font-semibold text-white">
        {build?.name}
      </p>

      <p className="font-mono text-cyan-400 mt-1">
        ${Number(build?.price || 0).toLocaleString()}
      </p>
    </div>
  );
}

/* Row */
function Row({ label, children }) {
  return (
    <div className="grid grid-cols-3 border-b border-white/5 last:border-0">
      <div className="p-4 label-mono text-zinc-400 capitalize bg-black/20">
        {label}
      </div>

      {children}
    </div>
  );
}

/* Cell */
function Cell({ value, highlight, sub }) {
  const cls =
    highlight === "better"
      ? "diff-better"
      : highlight === "worse"
        ? "diff-worse"
        : highlight === "neutral"
          ? "text-white"
          : "text-zinc-300";

  return (
    <div className="p-4 border-l border-white/5 text-sm">
      <span className={cls}>{value}</span>

      {sub && <p className="text-xs text-zinc-500 mt-1 font-mono">{sub}</p>}
    </div>
  );
}

/* Performance Cell */
function PerfCell({ value, highlight }) {
  return (
    <div className="p-4 border-l border-white/5">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span
          className={
            highlight === "better"
              ? "diff-better"
              : highlight === "worse"
                ? "diff-worse"
                : "text-zinc-300"
          }
        >
          {value}/100
        </span>
      </div>

      <Progress value={value} className="h-1.5 bg-zinc-900" />
    </div>
  );
}
