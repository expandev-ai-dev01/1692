/**
 * @summary
 * Weather data cache instance.
 * Manages in-memory caching of weather data with TTL support.
 *
 * @module instances/cache/weatherCache
 */
import { WeatherData } from '@/services/weather/weatherTypes';
import { config } from '@/config';

interface CacheEntry {
  data: WeatherData;
  expiresAt: number;
}

class WeatherCache {
  private cache: Map<string, CacheEntry>;
  private lastRefreshTimes: Map<string, number>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.lastRefreshTimes = new Map();
    this.cleanupInterval = null;
    this.startCleanupInterval();
  }

  /**
   * @summary
   * Retrieves cached weather data if valid.
   *
   * @param {string} key - Cache key
   * @returns {WeatherData | null} Cached data or null if expired/missing
   */
  get(key: string): WeatherData | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * @summary
   * Stores weather data in cache with TTL.
   *
   * @param {string} key - Cache key
   * @param {WeatherData} data - Weather data to cache
   */
  set(key: string, data: WeatherData): void {
    /**
     * @rule {be-cache-ttl} Set 15-minute TTL for weather data
     */
    const ttl = 900000; // 15 minutes in milliseconds
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      data,
      expiresAt,
    });
  }

  /**
   * @summary
   * Records the last refresh time for a location.
   *
   * @param {string} location - Location name
   * @param {number} timestamp - Unix timestamp
   */
  setLastRefreshTime(location: string, timestamp: number): void {
    this.lastRefreshTimes.set(location, timestamp);
  }

  /**
   * @summary
   * Retrieves the last refresh time for a location.
   *
   * @param {string} location - Location name
   * @returns {number | null} Unix timestamp or null
   */
  getLastRefreshTime(location: string): number | null {
    return this.lastRefreshTimes.get(location) || null;
  }

  /**
   * @summary
   * Clears all cached data.
   */
  clear(): void {
    this.cache.clear();
    this.lastRefreshTimes.clear();
  }

  /**
   * @summary
   * Starts periodic cleanup of expired cache entries.
   */
  private startCleanupInterval(): void {
    /**
     * @rule {be-cache-cleanup} Run cleanup every 10 minutes
     */
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();

      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, config.cache.checkPeriod * 1000);
  }

  /**
   * @summary
   * Stops the cleanup interval.
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const weatherCache = new WeatherCache();
