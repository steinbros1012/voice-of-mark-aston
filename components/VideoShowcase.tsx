"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

interface VideoItem {
  id: number;
  title: string;
  category: string;
  description: string;
  duration: string;
  file: string;
  thumb: string;
}

const videos: VideoItem[] = [
  {
    id: 1,
    title: "Auburn vs. UNC Hype",
    category: "Sports Imaging",
    description: "Auburn Tigers football hype reel",
    duration: "1:11",
    file: "/videos/auburn-vs-unc.mp4",
    thumb: "/videos/thumbs/auburn-vs-unc.jpg",
  },
  {
    id: 2,
    title: "College World Series",
    category: "Sports Imaging",
    description: "CWS hype package",
    duration: "0:37",
    file: "/videos/cws-hype.mp4",
    thumb: "/videos/thumbs/cws-hype.jpg",
  },
  {
    id: 3,
    title: "Sam Cerio Promo",
    category: "Sports Promo",
    description: "Athlete feature promo",
    duration: "0:27",
    file: "/videos/sam-cerio.mp4",
    thumb: "/videos/thumbs/sam-cerio.jpg",
  },
  {
    id: 4,
    title: "Thompson Tractor — Auburn vs. LSU",
    category: "Sponsored Content",
    description: "Sponsored broadcast spot",
    duration: "1:15",
    file: "/videos/thompson-tractor.mp4",
    thumb: "/videos/thumbs/thompson-tractor.jpg",
  },
  {
    id: 5,
    title: "Cody Greenhill — Season Tickets",
    category: "Sports Promo",
    description: "Season ticket campaign promo",
    duration: "0:30",
    file: "/videos/cody-greenhill.mp4",
    thumb: "/videos/thumbs/cody-greenhill.jpg",
  },
];

function VideoModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play();
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
            boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(147,97,202,0.15)",
          }}
        >
          <video
            ref={videoRef}
            src={video.file}
            controls
            className="w-full h-full object-cover"
            style={{ background: "#000" }}
          />
        </div>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1"
              style={{ color: "var(--purple-light)" }}
            >
              {video.category}
            </p>
            <h3 className="text-base font-bold text-white">{video.title}</h3>
          </div>
          <span
            className="text-xs font-mono mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {video.duration}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VideoShowcase() {
  const [active, setActive] = useState<VideoItem | null>(null);

  return (
    <>
      {active && <VideoModal video={active} onClose={() => setActive(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((v) => (
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
            <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <Image
                src={v.thumb}
                alt={v.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
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
                    background: "rgba(147,97,202,0.9)",
                    boxShadow: "0 0 0 8px rgba(147,97,202,0.15)",
                  }}
                >
                  <Play size={20} fill="white" className="text-white ml-1" />
                </div>
              </div>
              {/* Duration badge */}
              <div
                className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  color: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {v.duration}
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
