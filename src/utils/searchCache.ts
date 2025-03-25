/**
 * Simple in-memory cache for search results
 */
import { ViolationType } from '@/utils/types';

// In-memory cache for search results
const searchCache: Record<string, { timestamp: number, results: ViolationType[] }> = {};

// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Check if a result exists in the cache and is not expired
 */
export function getCachedResults(key: string): ViolationType[] | null {
  if (searchCache[key]) {
    const cachedData = searchCache[key];
    const now = Date.now();
    
    // If the cache hasn't expired, use it
    if (now - cachedData.timestamp < CACHE_EXPIRATION_MS) {
      console.log(`Using cached results for key: ${key}`);
      return cachedData.results;
    }
    
    // Otherwise, delete the expired cache entry
    delete searchCache[key];
  }
  
  return null;
}

/**
 * Store results in the cache
 */
export function setCachedResults(key: string, results: ViolationType[]): void {
  searchCache[key] = {
    timestamp: Date.now(),
    results
  };
}
