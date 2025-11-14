/**
 * @summary
 * Weather service for fetching and managing weather data.
 * Handles external API calls, caching, and data transformation.
 *
 * @module services/weather/weatherService
 */
import axios from 'axios';
import { config } from '@/config';
import { weatherCache } from '@/instances/cache/weatherCache';
import { WeatherData, TemperatureUnit } from './weatherTypes';

/**
 * @summary
 * Retrieves current weather data for a location.
 * Uses cache when available and valid, otherwise fetches from external API.
 *
 * @function getCurrentWeather
 * @module weather
 *
 * @param {string} location - Location name (city, state/country)
 * @param {TemperatureUnit} unit - Temperature unit (celsius or fahrenheit)
 *
 * @returns {Promise<WeatherData>} Current weather data
 *
 * @throws {Error} When external API fails
 * @throws {Error} When location is invalid
 */
export async function getCurrentWeather(
  location: string,
  unit: TemperatureUnit = 'celsius'
): Promise<WeatherData> {
  /**
   * @rule {be-cache-check} Check cache for existing valid data
   */
  const cacheKey = `${location}_${unit}`;
  const cachedData = weatherCache.get(cacheKey);

  if (cachedData) {
    /**
     * @rule {be-cache-age-check} Verify cache age and mark as outdated if > 1 hour
     */
    const cacheAge = Date.now() - cachedData.fetchedAt;
    const isOutdated = cacheAge > 3600000; // 1 hour in milliseconds

    return {
      ...cachedData,
      status: isOutdated ? 'outdated' : 'online',
    };
  }

  /**
   * @rule {be-weather-api-call} Fetch fresh data from external weather API
   */
  return await fetchWeatherFromAPI(location, unit);
}

/**
 * @summary
 * Forces a refresh of weather data from external API.
 * Bypasses cache and fetches fresh data.
 *
 * @function refreshWeather
 * @module weather
 *
 * @param {string} location - Location name
 * @param {TemperatureUnit} unit - Temperature unit
 *
 * @returns {Promise<WeatherData>} Fresh weather data
 */
export async function refreshWeather(
  location: string,
  unit: TemperatureUnit = 'celsius'
): Promise<WeatherData> {
  return await fetchWeatherFromAPI(location, unit);
}

/**
 * @summary
 * Checks if a location is eligible for manual refresh.
 * Enforces 30-second minimum interval between refreshes.
 *
 * @function checkRefreshEligibility
 * @module weather
 *
 * @param {string} location - Location name
 *
 * @returns {Promise<boolean>} True if refresh is allowed
 */
export async function checkRefreshEligibility(location: string): Promise<boolean> {
  /**
   * @rule {be-rate-limit-check} Enforce 30-second minimum between manual updates
   */
  const lastRefresh = weatherCache.getLastRefreshTime(location);

  if (!lastRefresh) {
    return true;
  }

  const timeSinceRefresh = Date.now() - lastRefresh;
  return timeSinceRefresh >= 30000; // 30 seconds
}

/**
 * @summary
 * Fetches weather data from external API and updates cache.
 *
 * @function fetchWeatherFromAPI
 * @module weather
 *
 * @param {string} location - Location name
 * @param {TemperatureUnit} unit - Temperature unit
 *
 * @returns {Promise<WeatherData>} Weather data from API
 *
 * @throws {Error} When API call fails
 */
async function fetchWeatherFromAPI(location: string, unit: TemperatureUnit): Promise<WeatherData> {
  try {
    /**
     * @validation Verify API key is configured
     */
    if (!config.weather.apiKey) {
      throw new Error('Weather API key not configured');
    }

    /**
     * @rule {be-external-api-call} Call external weather API with timeout
     */
    const response = await axios.get(`${config.weather.apiUrl}/current.json`, {
      params: {
        key: config.weather.apiKey,
        q: location,
      },
      timeout: 5000,
    });

    /**
     * @validation Verify API response contains required data
     */
    if (!response.data || !response.data.current) {
      throw new Error('Invalid API response format');
    }

    /**
     * @rule {be-temperature-conversion} Convert temperature to requested unit
     */
    const tempCelsius = response.data.current.temp_c;
    const temperature = unit === 'fahrenheit' ? celsiusToFahrenheit(tempCelsius) : tempCelsius;

    /**
     * @validation Verify temperature is within plausible range (-90°C to +60°C)
     */
    if (tempCelsius < -90 || tempCelsius > 60) {
      throw new Error('Temperature value outside plausible range');
    }

    /**
     * @rule {be-timestamp-format} Format timestamp for display
     */
    const now = new Date();
    const timestamp = `Updated at ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const weatherData: WeatherData = {
      temperature: parseFloat(temperature.toFixed(1)),
      unit: unit === 'celsius' ? '°C' : '°F',
      location: response.data.location.name,
      timestamp,
      status: 'online',
      fetchedAt: Date.now(),
    };

    /**
     * @rule {be-cache-update} Store data in cache with 15-minute TTL
     */
    const cacheKey = `${location}_${unit}`;
    weatherCache.set(cacheKey, weatherData);
    weatherCache.setLastRefreshTime(location, Date.now());

    return weatherData;
  } catch (error: any) {
    /**
     * @rule {be-offline-fallback} Return cached data if available when API fails
     */
    const cacheKey = `${location}_${unit}`;
    const cachedData = weatherCache.get(cacheKey);

    if (cachedData) {
      return {
        ...cachedData,
        status: 'offline',
      };
    }

    const apiError: any = new Error(
      error.response?.data?.error?.message || 'Failed to fetch weather data'
    );
    apiError.code = 'WEATHER_API_ERROR';
    throw apiError;
  }
}

/**
 * @summary
 * Converts temperature from Celsius to Fahrenheit.
 *
 * @function celsiusToFahrenheit
 * @module weather
 *
 * @param {number} celsius - Temperature in Celsius
 *
 * @returns {number} Temperature in Fahrenheit
 */
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}
