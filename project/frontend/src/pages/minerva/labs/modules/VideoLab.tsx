import React, { useState, useEffect } from 'react';

export interface VideoLabProps {
  youtube_query: string;
  youtube_video_id?: string;
  topic: string;
}


// Minimised thumbnail strip
const MinimisedStrip: React.FC<{
  topic: string;
  onMaximise: () => void;
}> = ({ topic, onMaximise }) => (
  <div
    className="flex items-center gap-3 px-4 py-2.5 bg-[#0f0f0f]/90 border border-[#ff0000]/20 rounded-xl cursor-pointer hover:border-[#ff0000]/40 transition-all group"
    onClick={onMaximise}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onMaximise()}
  >
    <div className="w-8 h-8 rounded-lg bg-[#ff0000]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff0000]/30 transition-colors">
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#ff0000]">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-white/70 truncate">{topic}</p>
      <p className="text-xs text-white/30">Video minimised — click to expand</p>
    </div>
    <span className="text-white/30 text-xs">▲</span>
  </div>
);

// YouTube search modal overlay
const SearchModal: React.FC<{
  searchUrl: string;
  onClose: () => void;
}> = ({ searchUrl, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-[90vw] max-w-4xl h-[80vh] bg-[#0f0f0f] rounded-2xl border border-[#ff0000]/30 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/5"
          style={{ background: `linear-gradient(to right, #0f0f0f, #1a0000)` }}
        >
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 90 20" className="h-5 w-auto" fill="none">
              <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 6.10352e-07 14.285 0 14.285 0C14.285 0 5.35042 6.10352e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
              <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
            </svg>
            <span className="text-white/60 text-sm">Search Results</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search notice */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
          <span className="text-amber-400 text-xs">⚠</span>
          <span className="text-amber-300/70 text-xs">
            YouTube search cannot be embedded directly. Opening search in new tab is recommended for best experience.
          </span>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-[#ff0000]/20 border border-[#ff0000]/30 text-red-300 text-xs hover:bg-[#ff0000]/30 transition-colors flex-shrink-0"
          >
            <span>↗</span>
            <span>Open in YouTube</span>
          </a>
        </div>

        {/* Iframe */}
        <div className="flex-1 relative">
          <iframe
            src={searchUrl}
            title="YouTube Search"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          {/* Fallback overlay if blocked */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]/95 opacity-0 pointer-events-none transition-opacity" id="yt-fallback">
            <span className="text-4xl mb-3">📺</span>
            <p className="text-white/50 text-sm">YouTube search blocked in iframe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoLab: React.FC<VideoLabProps> = ({
  youtube_query,
  youtube_video_id,
  topic,
}) => {
  const [minimised, setMinimised] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const embedUrl = youtube_video_id
    ? `https://www.youtube.com/embed/${youtube_video_id}?autoplay=0&rel=0&modestbranding=1&color=white`
    : null;

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtube_query)}`;

  if (minimised) {
    return (
      <div className="p-4">
        <MinimisedStrip topic={topic} onMaximise={() => setMinimised(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* YouTube red accent top border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#ff0000]/80 via-[#ff4444]/60 to-transparent flex-shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f0f0f]/60 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 90 20" className="h-4 w-auto" fill="none">
            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 6.10352e-07 14.285 0 14.285 0C14.285 0 5.35042 6.10352e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
            <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
          </svg>
          <div>
            <p className="text-xs text-white/70 font-medium">{topic}</p>
            <p className="text-xs text-white/30">Filtered for NCERT/educational channels only</p>
          </div>
        </div>
        <button
          onClick={() => setMinimised(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 text-xs transition-colors"
          title="Minimise"
        >
          <span>▼</span>
          <span className="hidden sm:inline">Minimise</span>
        </button>
      </div>

      {/* Video area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {embedUrl ? (
          <>
            {/* Loading state */}
            {!iframeLoaded && (
              <div className="relative w-full rounded-xl overflow-hidden bg-black/60 border border-white/10" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#ff0000]/40 border-t-[#ff0000] animate-spin" />
                  <p className="text-white/30 text-xs">Loading video…</p>
                </div>
              </div>
            )}

            {/* 16:9 iframe container */}
            <div
              className={`relative w-full rounded-xl overflow-hidden border border-white/10 bg-black transition-opacity duration-500 ${
                iframeLoaded ? 'opacity-100' : 'opacity-0 absolute'
              }`}
              style={{ paddingBottom: '56.25%' }}
            >
              <iframe
                src={embedUrl}
                title={`YouTube video: ${topic}`}
                className="absolute inset-0 w-full h-full border-0 rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIframeLoaded(true)}
              />
            </div>

            {/* Search fallback */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 self-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8 text-xs transition-colors"
            >
              <span>🔍</span>
              <span>Search for other related videos</span>
            </button>
          </>
        ) : (
          /* No video ID – show search button */
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="w-20 h-20 rounded-2xl bg-[#ff0000]/10 flex items-center justify-center border border-[#ff0000]/20">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#ff0000]/70">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-white/70 font-semibold text-base mb-1">{topic}</h3>
              <p className="text-white/30 text-sm max-w-xs">
                No video linked yet. Search for educational videos below.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-[#ff0000]/20 border border-[#ff0000]/30 text-red-300 font-semibold text-sm hover:bg-[#ff0000]/30 transition-all hover:scale-[1.02] active:scale-100"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Search on YouTube
              </button>

              <p className="text-center text-white/20 text-xs">
                Query: "{youtube_query}"
              </p>
            </div>

            {/* Educational disclaimer */}
            <div className="w-full max-w-sm px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
              <span className="text-green-400 text-xs mt-0.5">✓</span>
              <p className="text-green-300/60 text-xs leading-relaxed">
                Results filtered for NCERT, Khan Academy, Unacademy, Vedantu and other verified educational channels.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {searchModalOpen && (
        <SearchModal searchUrl={searchUrl} onClose={() => setSearchModalOpen(false)} />
      )}
    </div>
  );
};

export default VideoLab;
