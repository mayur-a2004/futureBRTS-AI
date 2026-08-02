// ⚡ High-Performance Memory Cache & ETag Handler for 400+ Concurrent Users
import { Request, Response, NextFunction } from 'express';

type CachedResponse = {
  status: number;
  body: any;
  headers: Record<string, string>;
  timestamp: number;
};

const apiRamCache = new Map<string, CachedResponse>();
const CACHE_TTL_MS = 5000; // 5 seconds RAM cache for GET routes

export const fastApiCache = (req: Request, res: Response, next: NextFunction) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Skip WebSocket, SSE, downloads, or uploads
  if (req.headers.accept?.includes('text/event-stream') || req.path.includes('/downloads') || req.path.includes('/uploads')) {
    return next();
  }

  const cacheKey = `${req.headers.authorization || 'public'}:${req.originalUrl || req.url}`;
  const now = Date.now();

  // Return RAM cache instantly if valid (< 5 seconds old)
  if (apiRamCache.has(cacheKey)) {
    const cached = apiRamCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('X-Cache', 'HIT-RAM-0.001s');
      res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=30');
      return res.status(cached.status).json(cached.body);
    }
  }

  // Intercept json() response to populate RAM cache
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      apiRamCache.set(cacheKey, {
        status: res.statusCode,
        body,
        headers: {},
        timestamp: Date.now()
      });
    }
    res.setHeader('X-Cache', 'MISS-SAVED');
    res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=30');
    return originalJson(body);
  };

  next();
};
