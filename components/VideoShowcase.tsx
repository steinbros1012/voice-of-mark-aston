"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

interface VideoItem {
  id: number;
  title: string;
  category: string;
  youtubeId?: string;
  vimeoId?: string;
  vimeoHash?: string;
}

function getEmbedUrl(v: VideoItem): string {
  if (v.vimeoId) {
    const hash = v.vimeoHash ? `?h=${v.vimeoHash}&autoplay=1` : `?autoplay=1`;
    return `https://player.vimeo.com/video/${v.vimeoId}${hash}`;
  }
  return `https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&rel=0`;
}

function getThumbnailUrl(v: VideoItem): string | null {
  if (v.youtubeId) return `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
  return null;
}

const videos: VideoItem[] = [
  {
    id: 16,
    title: "September :30 — Jeep",
    category: "Commercial",
    vimeoId: "1225754973",
    vimeoHash: "2c64c55034",
  },
  {
    id: 17,
    title: "September :30 — Ram",
    category: "Commercial",
    vimeoId: "1225755602",
    vimeoHash: "d037428f0c",
  },
  {
    id: 1,
    title: "Thompson Tractor — Auburn vs. Arkansas",
    category: "Sponsored Content",
    youtubeId: "cka-b5jq064",
  },
  {
    id: 2,
    title: "Thompson Tractor — Auburn vs. Tennessee",
    category: "Sponsored Content",
    youtubeId: "J0X8yuVrQzo",
  },
  {
    id: 3,
    title: "Thompson Tractor — Auburn vs. ASU",
    category: "Sponsored Content",
    youtubeId: "IKNvf5tcHPc",
  },
  {
    id: 4,
    title: "STOBAG",
    category: "Commercial",
    youtubeId: "X7WpkukEw2k",
  },
  {
    id: 5,
    title: "AMC Classics",
    category: "Commercial",
    youtubeId: "rOVC1lxPlso",
  },
  {
    id: 6,
    title: "McDonald's Breakfast",
    category: "Commercial",
    youtubeId: "GO426lLklq8",
  },
  {
    id: 7,
    title: "Advil",
    category: "Commercial",
    youtubeId: "j7PJK14UmZQ",
  },
  {
    id: 8,
    title: "FightDirty.Org",
    category: "Commercial",
    youtubeId: "yecZkN9LtXk",
  },
  {
    id: 9,
    title: "By the Numbers — Ryan Davis",
    category: "Sports Imaging",
    youtubeId: "eeSolWQHLN8",
  },
  {
    id: 10,
    title: "Baseball Friday Intro — Auburn vs. South Carolina",
    category: "Sports Imaging",
    youtubeId: "pcDnTpp_tCE",
  },
  {
    id: 11,
    title: "Diesel Equipment Technology",
    category: "Commercial",
    youtubeId: "IukcTd7aEQo",
  },
  {
    id: 12,
    title: "Baseball Friday Intro — 8FRM Sync",
    category: "Sports Imaging",
    youtubeId: "oys1AykB3I4",
  },
  {
    id: 13,
    title: "Auburn Baseball '17 Intro",
    category: "Sports Imaging",
    youtubeId: "l1tAekrsMyo",
  },
  {
    id: 14,
    title: "Mercedes-Benz Intuition",
    category: "Commercial",
    youtubeId: "iKc7tRdOoYk",
  },
  {
    id: 15,
    title: "Auburn Football Review Promo",
    category: "Sports Imaging",
    youtubeId: "Wp43YHeudec",
  },
];

function VideoModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 text-sm transition-colors hover:text-white"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={16} />
          Close
        </button>
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "16/9",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,119,34,0.15)",
          }}
        >
          <iframe
            src={getEmbedUrl(video)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full"
            style={{ border: "none", background: "#000" }}
          />
        </div>
        <div className="mt-4">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1"
            style={{ color: "var(--purple-light)" }}
          >
            {video.category}
          </p>
          <h3 className="text-base font-bold text-white">{video.title}</h3>
        </div>
      </div>
    </div>
  );
}

export default function VideoShowcase({ limit }: { limit?: number } = {}) {
  const [active, setActive] = useState<VideoItem | null>(null);
  const displayed = limit ? videos.slice(0, limit) : videos;

  return (
    <>
      {active && <VideoModal video={active} onClose={() => setActive(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            className="group relative rounded-xl overflow-hidden text-left"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
            }}
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", background: "#111" }}>
              {getThumbnailUrl(v) && (
                <Image
                  src={getThumbnailUrl(v)!}
                  alt={v.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
              {/* Dark overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                }}
              />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(232,119,34,0.95)",
                    boxShadow: "0 0 0 8px rgba(232,119,34,0.15)",
                  }}
                >
                  <Play size={20} fill="white" className="text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-4 py-3.5">
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.18em] mb-1"
                style={{ color: "var(--purple-light)" }}
              >
                {v.category}
              </p>
              <h3 className="text-sm font-semibold text-white leading-snug">{v.title}</h3>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
