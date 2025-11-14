/**
 * @summary
 * Weather API controller for external (public) endpoints.
 * Handles temperature display and weather data retrieval.
 *
 * @module api/v1/external/weather
 */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { weatherService } from '@/services/weather';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @api {get} /api/v1/external/weather/current Get Current Weather
 * @apiName GetCurrentWeather
 * @apiGroup Weather
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves current temperature and weather data for a specified location
 *
 * @apiParam {String} location Location name (city, state/country)
 * @apiParam {String} [unit=celsius] Temperature unit (celsius or fahrenheit)
 *
 * @apiSuccess {Number} temperature Current temperature value
 * @apiSuccess {String} unit Temperature unit (°C or °F)
 * @apiSuccess {String} location Location name
 * @apiSuccess {String} timestamp Last update timestamp
 * @apiSuccess {String} status Connection status (online/offline/outdated)
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} WeatherAPIError External API error
 * @apiError {String} ServerError Internal server error
 */
export async function getCurrentWeather(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @validation Query parameter validation
     * @throw {ValidationError}
     */
    const querySchema = z.object({
      location: z.string().min(1).max(50),
      unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
    });

    const validated = querySchema.parse(req.query);

    /**
     * @rule {be-weather-api-call} Fetch weather data from external API
     */
    const weatherData = await weatherService.getCurrentWeather(validated.location, validated.unit);

    /**
     * @output {WeatherResponse, 1, 1}
     * @column {Number} temperature - Current temperature with one decimal place
     * @column {String} unit - Temperature unit symbol (°C or °F)
     * @column {String} location - Location name
     * @column {String} timestamp - Last update timestamp in format 'Updated at HH:MM'
     * @column {String} status - Connection status
     */
    res.json(successResponse(weatherData));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res
        .status(400)
        .json(errorResponse('VALIDATION_ERROR', 'Invalid request parameters', error.errors));
    } else if (error.code === 'WEATHER_API_ERROR') {
      res.status(502).json(errorResponse('WEATHER_API_ERROR', error.message));
    } else {
      next(error);
    }
  }
}

/**
 * @api {post} /api/v1/external/weather/refresh Refresh Weather Data
 * @apiName RefreshWeather
 * @apiGroup Weather
 * @apiVersion 1.0.0
 *
 * @apiDescription Manually refreshes weather data for a specified location
 *
 * @apiParam {String} location Location name
 * @apiParam {String} [unit=celsius] Temperature unit
 *
 * @apiSuccess {Number} temperature Updated temperature
 * @apiSuccess {String} unit Temperature unit
 * @apiSuccess {String} location Location name
 * @apiSuccess {String} timestamp Update timestamp
 * @apiSuccess {String} status Update status
 *
 * @apiError {String} RateLimitError Too many refresh requests
 * @apiError {String} ValidationError Invalid parameters
 */
export async function refreshWeather(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @validation Request body validation
     */
    const bodySchema = z.object({
      location: z.string().min(1).max(50),
      unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
    });

    const validated = bodySchema.parse(req.body);

    /**
     * @rule {be-rate-limit-check} Enforce 30-second minimum interval between manual updates
     */
    const canRefresh = await weatherService.checkRefreshEligibility(validated.location);

    if (!canRefresh) {
      res
        .status(429)
        .json(
          errorResponse(
            'RATE_LIMIT_ERROR',
            'Please wait at least 30 seconds between manual updates'
          )
        );
      return;
    }

    /**
     * @rule {be-weather-refresh} Force refresh weather data from API
     */
    const weatherData = await weatherService.refreshWeather(validated.location, validated.unit);

    res.json(successResponse(weatherData));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res
        .status(400)
        .json(errorResponse('VALIDATION_ERROR', 'Invalid request parameters', error.errors));
    } else if (error.code === 'WEATHER_API_ERROR') {
      res.status(502).json(errorResponse('WEATHER_API_ERROR', error.message));
    } else {
      next(error);
    }
  }
}
