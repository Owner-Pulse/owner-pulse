import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  ChevronDown,
  Activity,
  DollarSign,
  ShieldCheck,
  FileText,
  Users,
  Star,
  Wrench,
  Phone,
  Timer,
  CreditCard,
} from "lucide-react";

// ─── Icon map — resolves icon string to Lucide component ──
const ICON_MAP = {
  DollarSign,
  ShieldCheck,
  FileText,
  Users,
  Star,
  Wrench,
  Phone,
  Timer,
  CreditCard,
};
import { Card } from "@/components/ui/card";
import PulseGauge from "@/components/PulseGauge";
import PulseRecommendations from "@/components/PulseRecommendations";

// ─── Design tokens ───────────────────────────────────────────────
const DARK_NAVY = "#0A0F1E";
const MONITOR_GREEN = "#3E9B67";
const TEXT_DIM = "#94A3B8";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Slow factors ────────────────────────────────────────────────
const ANIM_SLOW_FACTOR = 8;    // Pulse beat animation (2x slower)
const CHART_SLOW_FACTOR = 1;   // ECG waveform scroll

// ─── ECG Constants ────────────────────────────────────────────────
const ECG_HISTORY_LENGTH = 220;

function ecgSample(phase) {
  if (phase === undefined) return 0;
  const t = phase % (Math.PI * 2);
  const norm = t / (Math.PI * 2);
  let v = 0;
  // P wave — bigger bump
  if (norm < 0.10) v = 0.28 * Math.sin((norm / 0.10) * Math.PI);
  // Short flat
  else if (norm < 0.12) v = 0;
  // QRS complex — taller, sharper zigzag
  else if (norm < 0.14) v = -0.15 * Math.sin(((norm - 0.12) / 0.02) * Math.PI);
  else if (norm < 0.17) v = 1.3 * Math.sin(((norm - 0.14) / 0.03) * Math.PI);
  else if (norm < 0.20) v = -0.35 * Math.sin(((norm - 0.17) / 0.03) * Math.PI);
  else if (norm < 0.22) v = 0.15 * Math.sin(((norm - 0.20) / 0.02) * Math.PI);
  // T wave — bigger
  else if (norm < 0.40) v = 0.45 * Math.sin(((norm - 0.22) / 0.18) * Math.PI);
  // Extra zigzag ripple between beats
  else if (norm < 0.50) v = 0.06 * Math.sin(((norm - 0.40) / 0.10) * Math.PI * 3);
  else if (norm < 0.70) v = 0.04 * Math.sin(((norm - 0.50) / 0.20) * Math.PI * 4);
  else if (norm < 0.85) v = 0.05 * Math.sin(((norm - 0.70) / 0.15) * Math.PI * 2);
  else v = 0;
  // More noise for organic feel
  v += (Math.random() - 0.5) * 0.025;
  return v;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ─── ECG Canvas Component ─────────────────────────────────────────
function ECGCanvas({ color, bpm, baseBg }) {
  const canvasRef = useRef(null);
  const historyRef = useRef(new Array(ECG_HISTORY_LENGTH).fill(0));
  const phaseRef = useRef(0);
  const animRef = useRef(null);
  const currentBpmRef = useRef(bpm);

  const drawECG = useCallback((ctx, history, w, h, col, bg) => {
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = col;
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 6;
    ctx.shadowColor = col;
    ctx.beginPath();
    const step = w / (ECG_HISTORY_LENGTH - 1);
    for (let i = 0; i < history.length; i++) {
      const x = i * step;
      const y = h / 2 - history[i] * (h / 2 - 4);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fading tail effect
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, bg + "f2");
    grad.addColorStop(0.15, bg + "00");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
    };
    resize();

    let running = true;

    const tick = () => {
      if (!running) return;

      currentBpmRef.current = lerp(currentBpmRef.current, bpm, 0.04);

      const speed =
        currentBpmRef.current === 0
          ? 0
          : ((currentBpmRef.current / 60) * (Math.PI * 2)) / (60 * CHART_SLOW_FACTOR);
      phaseRef.current += speed;

      const history = historyRef.current;
      history.shift();
      history.push(ecgSample(phaseRef.current));

      const ctx = canvas.getContext("2d");
      drawECG(ctx, history, canvas.width, canvas.height, color, baseBg);

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [color, bpm, drawECG, baseBg]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full block"
      style={{ height: "60px" }}
      role="img"
      aria-label="ECG live waveform"
    />
  );
}

const PulseSection = ({ directorPulse, ownerPulseSnapshot }) => {
  const [expanded, setExpanded] = useState(false);

  const pulseColor = directorPulse.state?.color || MONITOR_GREEN;
  const beatDuration = (60 / Math.max(directorPulse.bpm, 55)) * ANIM_SLOW_FACTOR;

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="relative border-none shadow-2xl overflow-hidden"
        style={{
          background: DARK_NAVY,
          border: `1px solid ${pulseColor}26`,
        }}
      >
        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )`,
          }}
        />

        {/* ═══════ HOSPITAL MONITOR HEADER ═══════ */}
        <div className="relative px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="relative">
                <HeartPulse size={18} color={pulseColor} />
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ duration: beatDuration, repeat: Infinity, ease: "easeOut" }}
                >
                  <HeartPulse size={18} color={pulseColor} />
                </motion.div>
              </div>
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: pulseColor }}
              >
                Pulse Monitor
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: `${pulseColor}1a`, color: pulseColor }}
              >
                ● LIVE
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Owner pulse badge */}
              {ownerPulseSnapshot?.bpm && (
                <div
                  className="text-[10px] font-mono flex items-center gap-1"
                  style={{ color: TEXT_DIM }}
                >
                  <HeartPulse size={10} color={pulseColor} />
                  Owner: {ownerPulseSnapshot.bpm}
                </div>
              )}
              <span className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>
                {directorPulse.state.state?.toUpperCase() || "HEALTHY"}
              </span>
            </div>
          </div>

          {/* ═══════ BPM DISPLAY ═══════ */}
          <div className="flex flex-col items-center justify-center py-2 relative z-10">
            <motion.div
              className="flex items-baseline gap-1"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="text-7xl md:text-8xl font-black leading-none tracking-tighter tabular-nums"
                style={{ color: pulseColor }}
              >
                {directorPulse.bpm}
              </span>
              <span
                className="text-sm font-bold uppercase tracking-widest ml-1"
                style={{ color: TEXT_DIM }}
              >
                BPM
              </span>
            </motion.div>

            {/* Composite bar */}
            <div className="flex items-center gap-2 mt-1">
              <div
                className="h-1 rounded-full"
                style={{
                  width: 80,
                  background: `linear-gradient(to right, 
                    ${directorPulse.composite >= 80 ? pulseColor : directorPulse.composite >= 60 ? "#C89B3C" : "#C33B2E"} 
                    ${directorPulse.composite}%, 
                    rgba(255,255,255,0.08) ${directorPulse.composite}%)`,
                }}
              />
              <span className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>
                {directorPulse.composite}/100
              </span>
            </div>
          </div>

          {/* ═══════ ANIMATED ECG WAVEFORM ═══════ */}
          <div className="relative mt-2 mb-1 z-10">
            <ECGCanvas
              color={pulseColor}
              bpm={directorPulse.bpm}
              baseBg={DARK_NAVY}
            />
          </div>

          {/* ═══════ VIEW DETAIL TOGGLE ═══════ */}
          <div className="flex justify-center mt-2 relative z-10">
            <motion.button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer"
              style={{
                background: expanded
                  ? "rgba(62,155,103,0.12)"
                  : "rgba(148,163,184,0.08)",
                color: expanded ? MONITOR_GREEN : TEXT_DIM,
                border: `1px solid ${
                  expanded
                    ? "rgba(62,155,103,0.25)"
                    : "rgba(148,163,184,0.15)"
                }`,
              }}
              whileHover={{
                background: "rgba(62,155,103,0.15)",
                color: MONITOR_GREEN,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Activity size={12} />
              {expanded ? "Hide Details" : "View Details"}
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={12} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* ═══════ EXPANDED CONTENT ═══════ */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div
                className="px-5 pb-5 md:px-6 md:pb-6"
                style={{ borderTop: "1px solid rgba(62,155,103,0.1)" }}
              >
                <div className="pt-4">
                  {/* Gauge + Subscores side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center justify-center">
                      <PulseGauge
                        bpm={directorPulse.bpm}
                        composite={directorPulse.composite}
                        state={directorPulse.state}
                        size="md"
                        showOwnerBadge
                        ownerBpm={ownerPulseSnapshot?.bpm}
                      />
                    </div>

                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: TEXT_DIM }}
                      >
                        Sub-scores
                      </span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {directorPulse.subscores.map((sub) => {
                          const scoreColor =
                            sub.score >= 80
                              ? MONITOR_GREEN
                              : sub.score >= 60
                              ? "#C89B3C"
                              : "#C33B2E";
                          return (
                            <div
                              key={sub.key}
                              className="flex flex-col items-center justify-center p-2 rounded-lg"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                              title={`${sub.label}: ${sub.score}/100 (${Math.round(
                                sub.weight * 100
                              )}% weight)`}
                            >
                              <div
                              className="mb-0.5 p-1.5 rounded-lg"
                              style={{
                                background: "rgba(62,155,103,0.08)",
                              }}
                            >
                              {(() => {
                                const SubIcon = ICON_MAP[sub.icon];
                                return SubIcon ? (
                                  <SubIcon
                                    size={14}
                                    style={{ color: MONITOR_GREEN }}
                                  />
                                ) : null;
                              })()}
                            </div>
                              <div
                                className="text-sm font-black tabular-nums"
                                style={{ color: scoreColor }}
                              >
                                {sub.score}
                              </div>
                              <div
                                className="text-[7px] font-bold uppercase tracking-wider text-center leading-tight"
                                style={{ color: TEXT_DIM }}
                              >
                                {sub.label.split(" ")[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <PulseRecommendations
                      recommendations={directorPulse.recommendations}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default PulseSection;
