/**
 * @summary
 * Type definitions for weather service.
 *
 * @module services/weather/weatherTypes
 */

/**
 * @interface WeatherData
 * @description Represents weather data for a location
 *
 * @property {number} temperature - Current temperature value with one decimal place
 * @property {string} unit - Temperature unit symbol (°C or °F)
 * @property {string} location - Location name (city, state/country)
 * @property {string} timestamp - Last update timestamp in format 'Updated at HH:MM'
 * @property {WeatherStatus} status - Connection status
 * @property {number} fetchedAt - Unix timestamp when data was fetched
 */
export interface WeatherData {
  temperature: number;
  unit: string;
  location: string;
  timestamp: string;
  status: WeatherStatus;
  fetchedAt: number;
}

/**
 * @type WeatherStatus
 * @description Possible weather data status values
 */
export type WeatherStatus = 'online' | 'offline' | 'outdated';

/**
 * @type TemperatureUnit
 * @description Supported temperature units
 */
export type TemperatureUnit = 'celsius' | 'fahrenheit';
