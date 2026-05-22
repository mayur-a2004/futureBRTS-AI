import yt_dlp
import logging
import os
from datetime import datetime
from storage.memory import memory

logger = logging.getLogger(__name__)

class YouTubeAnalyzer:
    """
    Titan's Neural Video & Asset Discovery Engine.
    Uses yt-dlp to find, rank, and verify high-fidelity educational playlists.
    """
    
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': 'in_playlist',
            'skip_download': True,
            'format': 'best',
        }
        # Injected DB collection
        if memory.client:
            self.collection = memory.db.get_collection("youtube_discovery")
        else:
            self.collection = None

    def find_best_playlist(self, topic: str, metadata: dict = None):
        """
        Searches for playlists, ranks them by views/fidelity, and returns the top asset.
        """
        # 1. Check Cache First
        if self.collection is not None:
            cached = self.collection.find_one({"topic": topic.lower()})
            if cached:
                cached_date = cached.get("timestamp")
                # Refresh cache if older than 7 days
                if (datetime.now() - cached_date).days < 7:
                    logger.info(f"YOUTUBE CACHE HIT: {topic}")
                    return cached.get("assets")

        logger.info(f"YOUTUBE DISCOVERY INITIATED: {topic}")
        
        # 🛡️ PRECISION ENGINE: If type is 'video', search for direct atomic tutorials
        is_video = metadata.get("type") == "video" if metadata else False
        context = metadata.get("context", "") if metadata else ""
        
        if is_video:
            # Search for videos instead of playlists
            search_query = f"ytsearch5:{topic} {context} industrial guide tutorial"
        else:
            search_query = f"ytsearchplaylist5:{topic} industrial guide playlist"
        
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(search_query, download=False)
                
            if not info or 'entries' not in info:
                return []

            assets = []
            for entry in info['entries']:
                if not entry: continue
                
                # Metadata extraction
                views = entry.get('view_count', 0) or 0
                title = entry.get('title', 'Unknown Asset')
                description = entry.get('description', '')
                url = entry.get('url') or entry.get('webpage_url')
                
                if not url: 
                    # Try fallback to ID
                    vid = entry.get('id')
                    if vid: url = f"https://www.youtube.com/watch?v={vid}" if is_video else f"https://www.youtube.com/playlist?list={vid}"
                
                if not url: continue

                # Analysis Score: Favor high views but also title relevance
                score = views / 1000000.0
                if topic.lower() in title.lower(): score += 5.0 # Title match bonus

                assets.append({
                    "title": title,
                    "description": description[:200] + "..." if description else "",
                    "url": url,
                    "views": views,
                    "score": score,
                    "type": "video" if is_video else "playlist",
                    "source": "YouTube Intelligence"
                })

            # Sort by score DESC
            assets.sort(key=lambda x: x['score'], reverse=True)
            
            top_assets = assets[:2]
            
            # 2. Store in DB
            if self.collection is not None and top_assets:
                self.collection.update_one(
                    {"topic": topic.lower()},
                    {"$set": {
                        "topic": topic.lower(),
                        "assets": top_assets,
                        "timestamp": datetime.now()
                    }},
                    upsert=True
                )

            return top_assets

        except Exception as e:
            logger.error(f"YouTube Discovery Failed: {e}")
            # Fallback to a basic search link if error
            return [{
                "title": f"{topic} (Search)",
                "url": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+playlist",
                "views": 0,
                "score": 0,
                "source": "YouTube Search"
            }]

youtube_analyzer = YouTubeAnalyzer()
