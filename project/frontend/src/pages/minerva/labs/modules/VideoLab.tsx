import React, { useState, useEffect, useRef } from 'react';
import { Search, Play } from 'lucide-react';

export interface VideoLabProps {
  youtube_query: string;
  youtube_video_id?: string;
  topic: string;
}

interface YouTubeVideoItem {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  url: string;
  thumbnail: string;
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
      <Play className="w-4 h-4 text-[#ff0000] fill-current" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-white/70 truncate">{topic}</p>
      <p className="text-xs text-white/30">Video minimised — click to expand</p>
    </div>
    <span className="text-white/30 text-xs">▲</span>
  </div>
);

const VideoLab: React.FC<VideoLabProps> = ({
  youtube_query,
  youtube_video_id,
  topic,
}) => {
  const [minimised, setMinimised] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | undefined>(youtube_video_id);

  const [searchQuery, setSearchQuery] = useState(youtube_query || topic || '');
  const [searchResults, setSearchResults] = useState<YouTubeVideoItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const lastAutoSearchedTopic = useRef<string>('');

  const handleManualSearch = async (q: string) => {
    if (!q.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const token = localStorage.getItem('fbrts_token');
      const res = await fetch(`/api/future-education/lab/youtube-search-list?query=${encodeURIComponent(q.trim())}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.results && data.results.length > 0) {
        setSearchResults(data.results);
        // If no active video is set yet, default to the first one in search
        if (!activeVideoId) {
          setActiveVideoId(data.results[0].id);
        }
      } else {
        setSearchError('No videos found. Try a different keyword!');
      }
    } catch (err) {
      setSearchError('Search failed. Check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  // Auto-search on load/topic change
  useEffect(() => {
    const q = youtube_query || topic || '';
    if (q && q !== lastAutoSearchedTopic.current) {
      lastAutoSearchedTopic.current = q;
      setSearchQuery(q);
      handleManualSearch(q);
    }
    // Set initial video id if provided directly
    if (youtube_video_id) {
      setActiveVideoId(youtube_video_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, youtube_query, youtube_video_id]);

  const embedUrl = activeVideoId
    ? `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&color=white`
    : null;

  if (minimised) {
    return (
      <div className="p-4">
        <MinimisedStrip topic={topic} onMaximise={() => setMinimised(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* YouTube red accent top border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#ff0000]/80 via-[#ff4444]/60 to-transparent flex-shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f0f0f]/60 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF0000]" fill="none">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837z" />
            <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
          </svg>
          <div>
            <p className="text-xs text-white/70 font-semibold">{topic}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wide">Multi-video Learning Lounge</p>
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
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto min-h-0">
        {/* 16:9 iframe container */}
        {embedUrl ? (
          <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black flex-shrink-0" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={`YouTube video: ${topic}`}
              className="absolute inset-0 w-full h-full border-0 rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />

            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                <div className="w-10 h-10 rounded-full border-2 border-[#ff0000]/40 border-t-[#ff0000] animate-spin" />
                <p className="mt-3 text-white/30 text-xs">Loading player…</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f]/50 flex flex-col items-center justify-center text-center p-6 flex-shrink-0" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <Play className="text-white/20 animate-pulse mb-3" size={36} />
              <p className="text-zinc-500 text-xs font-bold">Search or select a video below to play...</p>
            </div>
          </div>
        )}

        {/* Dynamic Search Box */}
        <div className="flex flex-col gap-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleManualSearch(searchQuery);
            }}
            className="flex gap-2 flex-shrink-0"
          >
            <input
              type="text"
              className="flex-1 min-w-0 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition-colors"
              placeholder="Search related educational videos on YouTube..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {searching ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={11} />
                  Search
                </>
              )}
            </button>
          </form>

          {searchError && (
            <p className="text-red-400 text-[10px] font-semibold flex-shrink-0">{searchError}</p>
          )}

          {/* Videos Grid List */}
          {searching ? (
            <div className="flex items-center gap-2 py-4 text-zinc-500 flex-shrink-0">
              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] uppercase font-bold tracking-wider">Searching YouTube database...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between flex-shrink-0">
                <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">📺 Recommended Lessons</p>
                <p className="text-zinc-700 text-[8px]">scroll ↕ for more</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pr-0.5">
                {searchResults.map((video) => {
                  const isActive = activeVideoId === video.id;
                  return (
                    <div 
                      key={video.id}
                      onClick={() => {
                        setActiveVideoId(video.id);
                        setIframeLoaded(false);
                      }}
                      className={`rounded-lg overflow-hidden cursor-pointer transition-all active:scale-[0.97] border ${
                        isActive 
                          ? 'border-red-500 ring-1 ring-red-500/30 bg-red-950/20' 
                          : 'border-zinc-800 hover:border-red-600/50 bg-zinc-900/60 hover:bg-zinc-900'
                      }`}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden">
                        <img 
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {video.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-bold text-white font-mono">
                            {video.duration}
                          </span>
                        )}
                        {isActive && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                              ● Playing
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Details */}
                      <div className="px-1.5 py-1.5 flex flex-col gap-0.5">
                        <p className="text-white text-[8px] font-bold truncate leading-tight" title={video.title}>
                          {video.title}
                        </p>
                        <p className="text-zinc-500 text-[7px] truncate font-medium">
                          {video.channel}
                        </p>
                        {video.views && (
                          <p className="text-zinc-700 text-[7px]">{video.views}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-zinc-600 text-[10px] italic">
              Type any topic above and press Search to find educational videos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
