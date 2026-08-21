import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, ChevronDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
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
const CHART_SLOW_FACTOR = 1;   // ECG waveform scroll (6x slower)

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

// ─── Status Dot Component ────────────────────────────────────────
const STATUS_DOT_KEYFRAMES = `
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
`;

const StatusDot = ({ color }) => (
  <span
    className="inline-block rounded-full"
    style={{
      width: 7,
      height: 7,
      background: color,
      animation: "pulse-dot 1.4s ease-in-out infinite",
    }}
  />
);

// ─── State descriptions ───────────────────────────────────────────
const STATE_DESC = {
  Thriving: "Calm and steady",
  Healthy: "All systems go",
  Elevated: "Monitor closely",
  Stressed: "Increased pressure",
  Critical: "Immediate action needed",
};

function getStateDesc(state) {
  return STATE_DESC[state] || "Normal operation";
}

function formatDate() {
  const d = new Date();
  return d
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();
}

// ─── Pulse Section Component ──────────────────────────────────────
const PulseSection = ({ ownerPulse }) => {
  const [expanded, setExpanded] = useState(false);

  const pulseColor = ownerPulse.state?.color || MONITOR_GREEN;
  const stateName = ownerPulse.state?.state || "Healthy";
  const desc = getStateDesc(stateName);
  const composite = ownerPulse.composite || 0;
  const bpm = ownerPulse.bpm || 68;

  // Beat duration for pulse animation (slowed by ANIM_SLOW_FACTOR)
  const beatDuration = (60 / Math.max(bpm, 55)) * ANIM_SLOW_FACTOR;

  // Inject keyframes once
  useEffect(() => {
    const id = "pulse-dot-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = STATUS_DOT_KEYFRAMES;
      document.head.appendChild(style);
      return () => {
        const el = document.getElementById(id);
        if (el) el.remove();
      };
    }
  }, []);

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="relative border-none shadow-2xl overflow-hidden"
        style={{
          background: DARK_NAVY,
          border: `1px solid ${pulseColor}26`,
        }}
      >
        {/* Scan line effect overlay */}
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

        {/* ─── HEADER ─── */}
        <div className="relative z-10 px-5 pt-4 pb-1 md:px-6 md:pt-5">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-semibold tracking-[0.12em]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              OWNER ·{" "}
              <span className="font-mono">{formatDate()}</span>
            </span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <HeartPulse size={14} color={pulseColor} />
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{
                    duration: beatDuration,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                >
                  <HeartPulse size={14} color={pulseColor} />
                </motion.div>
              </div>
              <span
                className="text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: pulseColor }}
              >
                Your Pulse
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: `${pulseColor}1a`,
                  color: pulseColor,
                }}
              >
                ● LIVE
              </span>
            </div>
          </div>
          <div
            className="mt-1 text-sm font-bold tracking-tight"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Good morning
          </div>
        </div>

        {/* ─── PULSE CARD ─── */}
        <div
          className="relative z-10 mx-3 md:mx-4 rounded-xl overflow-hidden"
          style={{
            background: DARK_NAVY,
          }}
        >
          <div className="p-4 relative">
            {/* Composite info — top right */}
            <div
              className="absolute right-3 top-3 text-right"
              style={{ maxWidth: 130 }}
            >
              <div
                className="text-[11px] font-medium leading-snug"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {desc}
              </div>
              <div
                className="text-[10px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {composite}/100 composite
              </div>
            </div>

            {/* Status badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide mb-1.5"
              style={{
                background: `${pulseColor}1f`,
                color: pulseColor,
              }}
            >
              <StatusDot color={pulseColor} />
              <span>{stateName.toUpperCase()}</span>
            </div>

            {/* BPM display */}
            <div
              className="text-[10px] font-semibold tracking-wide mb-0.5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              YOUR BUSINESS PULSE
            </div>
            <motion.div
              className="flex items-baseline gap-1"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{
                duration: beatDuration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span
                className="text-6xl md:text-7xl font-black leading-none tracking-tighter tabular-nums"
                style={{ color: pulseColor }}
              >
                {bpm}
              </span>
              <span
                className="text-xs font-bold uppercase tracking-widest ml-0.5"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                BPM
              </span>
            </motion.div>

            {/* ECG Waveform */}
            <div className="mt-1.5">
              <ECGCanvas
                color={pulseColor}
                bpm={bpm}
                baseBg={DARK_NAVY}
              />
            </div>
          </div>
        </div>

        {/* ─── VIEW DETAIL TOGGLE ─── */}
        <div className="relative z-10 flex justify-center py-2">
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer"
            style={{
              background: expanded
                ? `${pulseColor}1f`
                : "rgba(148,163,184,0.08)",
              color: expanded ? pulseColor : TEXT_DIM,
              border: `1px solid ${
                expanded ? `${pulseColor}40` : "rgba(148,163,184,0.15)"
              }`,
            }}
            whileHover={{
              background: `${pulseColor}26`,
              color: pulseColor,
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

        {/* ─── EXPANDED CONTENT (recommendations only) ─── */}
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
                className="px-5 pb-5 md:px-6 md:pb-6 relative z-10"
                style={{ borderTop: `1px solid ${pulseColor}1a` }}
              >
                <div className="pt-4">
                  {/* Recommendations */}
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <PulseRecommendations
                      recommendations={ownerPulse.recommendations}
                    />
                  </div>

                  {/* History */}
                  <div className="mt-4 flex items-center gap-2">
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                    <span
                      className="text-[9px] font-mono uppercase tracking-wider"
                      style={{ color: TEXT_DIM }}
                    >
                      History
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                  </div>
                  <div className="flex gap-2 justify-center mt-2">
                    {["30d", "90d", "1y"].map((p) => (
                      <span
                        key={p}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full cursor-pointer transition-all"
                        style={{
                          background: `${pulseColor}1a`,
                          color: pulseColor,
                        }}
                      >
                        {p}
                      </span>
                    ))}
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
