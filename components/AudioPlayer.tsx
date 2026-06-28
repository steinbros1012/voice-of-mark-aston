"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface Demo {
  id: number;
  title: string;
  category: string;
  file: string;
  description: string;
  duration: string;
}

const demos: Demo[] = [
  // Sports / Broadcast
  {
    id: 1,
    title: "Auburn Sports Today",
    category: "Sports",
    file: "/demos/auburn-sports-today.mp3",
    description: "Auburn University sports broadcast promo",
    duration: "2:56",
  },
  {
    id: 2,
    title: "Tiger Talk — Vol. 1",
    category: "Sports",
    file: "/demos/tiger-talk-1.mp3",
    description: "Tiger Talk weekly sports show imaging",
    duration: "0:45",
  },
  {
    id: 3,
    title: "Tiger Talk — Vol. 2",
    category: "Sports",
    file: "/demos/tiger-talk-2.mp3",
    description: "Tiger Talk weekly sports show imaging",
    duration: "0:45",
  },
  {
    id: 4,
    title: "UMass — Long Form",
    category: "Sports",
    file: "/demos/umass-1.mp3",
    description: "UMass Minutemen sports broadcast",
    duration: "1:30",
  },
  {
    id: 5,
    title: "UMass — Short Form",
    category: "Sports",
    file: "/demos/umass-2.mp3",
    description: "UMass Minutemen sports broadcast",
    duration: "0:45",
  },
  {
    id: 6,
    title: "UMass — Feature",
    category: "Sports",
    file: "/demos/umass-feature.mp3",
    description: "UMass vs Southern Miss feature segment",
    duration: "1:30",
  },
  {
    id: 7,
    title: "Cal — Long Form",
    category: "Sports",
    file: "/demos/cal-1.mp3",
    description: "Cal Golden Bears sports broadcast imaging",
    duration: "1:30",
  },
  {
    id: 8,
    title: "Cal — Vol. 2",
    category: "Sports",
    file: "/demos/cal-2.mp3",
    description: "Cal Golden Bears sports broadcast imaging",
    duration: "1:30",
  },
  {
    id: 9,
    title: "Cal — 15-Second Liner",
    category: "Sports",
    file: "/demos/cal-liner.mp3",
    description: "Cal Golden Bears short-form liner",
    duration: "0:15",
  },
  {
    id: 10,
    title: "Kentucky",
    category: "Sports",
    file: "/demos/kentucky.mp3",
    description: "Kentucky Wildcats sports broadcast promo",
    duration: "0:45",
  },
  {
    id: 11,
    title: "Samford",
    category: "Sports",
    file: "/demos/samford.mp3",
    description: "Samford Bulldogs sports broadcast promo",
    duration: "0:45",
  },
  {
    id: 12,
    title: "NMSU",
    category: "Sports",
    file: "/demos/nmsu.mp3",
    description: "New Mexico State sports broadcast promo",
    duration: "0:45",
  },
];

const categories = ["All", "Sports", "Commercial", "Narration", "Character"];

// Stable waveform bar heights
const waveformBars = Array.from({ length: 64 }, (_, i) => {
  const t = (i / 64) * Math.PI * 6;
  return {
    h: Math.max(8, 8 + Math.abs(Math.sin(t * 1.3)) * 38 + Math.abs(Math.cos(t * 0.7)) * 20),
    dur: 0.5 + (i % 6) * 0.15,
    del: (i % 8) * 0.1,
  };
});

function formatTime(s: number) {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioPlayer() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canPlay, setCanPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const filtered =
    activeCategory === "All"
      ? demos
      : demos.filter((d) => d.category === activeCategory);

  const safeIndex = Math.min(currentIndex, filtered.length - 1);
  const current = filtered[safeIndex];
  const isComingSoon = !current?.file || filtered.length === 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setCanPlay(false);
    if (!isComingSoon) audio.load();
  }, [current?.file, isComingSoon]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing, canPlay]);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !canPlay || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
  }

  function prev() {
    audioRef.current?.pause();
    setPlaying(false);
    setCurrentIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
  }

  function next() {
    audioRef.current?.pause();
    setPlaying(false);
    setCurrentIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
  }

  return (
    <div className="w-full">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const hasContent =
            cat === "All"
              ? true
              : demos.some((d) => d.category === cat);
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-200"
              style={
                activeCategory === cat
                  ? { background: "var(--purple)", color: "#fff" }
                  : {
                      background: "rgba(147,97,202,0.07)",
                      color: hasContent ? "var(--text-secondary)" : "var(--text-muted)",
                      border: "1px solid var(--border)",
                      opacity: hasContent ? 1 : 0.5,
                    }
              }
            >
              {cat}
              {!hasContent && (
                <span className="ml-1.5 text-[9px] normal-case tracking-normal opacity-60">
                  soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Player card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        {!isComingSoon && (
          <audio
            ref={audioRef}
            src={current.file}
            onTimeUpdate={() => {
              const a = audioRef.current;
              if (!a) return;
              setCurrentTime(a.currentTime);
              if (a.duration) setProgress((a.currentTime / a.duration) * 100);
            }}
            onLoadedMetadata={() => {
              const a = audioRef.current;
              if (a) setDuration(a.duration);
            }}
            onCanPlay={() => setCanPlay(true)}
            onError={() => setCanPlay(false)}
            onEnded={() => {
              setPlaying(false);
              setProgress(0);
              setCurrentTime(0);
              // Auto-advance to next track
              setCurrentIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
            }}
            preload="metadata"
          />
        )}

        {/* Waveform */}
        <div
          className="relative h-20 px-5 pt-4 pb-0 flex items-end gap-[2px] select-none overflow-hidden"
          style={{ cursor: canPlay ? "pointer" : "default" }}
          onClick={handleSeek}
        >
          {waveformBars.map((bar, i) => {
            const played = i / waveformBars.length <= progress / 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-full origin-bottom transition-colors duration-300"
                style={{
                  height: `${bar.h}px`,
                  maxHeight: "64px",
                  minHeight: "3px",
                  backgroundColor: played
                    ? "var(--purple)"
                    : "rgba(147,97,202,0.18)",
                  animation:
                    playing
                      ? `soundBar ${bar.dur}s ease-in-out ${bar.del}s infinite`
                      : "none",
                }}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="px-6 pt-4 pb-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                {isComingSoon ? "Coming Soon" : current.title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {isComingSoon
                  ? "Demos for this category are being added"
                  : current.description}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-1 rounded-full mb-3 overflow-hidden"
            style={{
              background: "rgba(147,97,202,0.12)",
              cursor: canPlay ? "pointer" : "default",
            }}
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "var(--purple)",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {/* Time + controls */}
          <div className="flex items-center justify-between">
            <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
              {formatTime(currentTime)}{" "}
              <span style={{ opacity: 0.4 }}>/</span>{" "}
              {duration ? formatTime(duration) : (isComingSoon ? "--:--" : current?.duration)}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="p-2 rounded-full transition-colors hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Previous"
                disabled={isComingSoon}
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={togglePlay}
                className="relative w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95"
                style={{
                  background: canPlay ? "var(--purple)" : "rgba(147,97,202,0.25)",
                  cursor: canPlay ? "pointer" : "not-allowed",
                }}
                aria-label={playing ? "Pause" : "Play"}
                disabled={isComingSoon}
              >
                {playing && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "var(--purple)",
                      animation: "pulseRing 1.6s ease-out infinite",
                    }}
                  />
                )}
                {playing ? (
                  <Pause size={16} fill="white" className="text-white" />
                ) : (
                  <Play size={16} fill="white" className="text-white ml-0.5" />
                )}
              </button>

              <button
                onClick={next}
                className="p-2 rounded-full transition-colors hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Next"
                disabled={isComingSoon}
              >
                <SkipForward size={16} />
              </button>
            </div>

            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isComingSoon ? "0 / 0" : `${safeIndex + 1} / ${filtered.length}`}
            </span>
          </div>
        </div>

        {/* Track list */}
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {isComingSoon ? (
            <div className="px-5 py-6 text-center">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Demos for this category coming soon
              </p>
            </div>
          ) : (
            filtered.map((demo, idx) => {
              const active = idx === safeIndex;
              return (
                <button
                  key={demo.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setPlaying(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/3"
                  style={{
                    background: active ? "rgba(147,97,202,0.07)" : "transparent",
                    borderBottom:
                      idx < filtered.length - 1
                        ? "1px solid rgba(147,97,202,0.06)"
                        : "none",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: active ? "var(--purple)" : "rgba(147,97,202,0.1)" }}
                  >
                    <Play
                      size={10}
                      className="ml-0.5"
                      style={{
                        color: active ? "white" : "var(--purple-light)",
                        fill: active ? "white" : "var(--purple-light)",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: active ? "white" : "var(--text-secondary)" }}
                    >
                      {demo.title}
                    </p>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {demo.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {demo.duration}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
