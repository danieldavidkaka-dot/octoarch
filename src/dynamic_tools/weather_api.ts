interface Coordinates {
  lon: number;
  lat: number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface MainWeatherInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

interface WindInfo {
  speed: number;
  deg: number;
  gust?: number;
}

interface CloudsInfo {
  all: number;
}

interface SysInfo {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

interface CityWeather {
  coord: Coordinates;
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherInfo;
  visibility: number;
  wind: WindInfo;
  clouds: CloudsInfo;
  dt: number;
  sys: SysInfo;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface WeatherServiceOptions {
  apiKey: string;
  baseUrl?: string;
  units?: 'standard' | 'metric' | 'imperial';
  lang?: string;
}

class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly units: 'standard' | 'metric' | 'imperial';
  private readonly lang: string;

  constructor(options: WeatherServiceOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required for WeatherService.');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.openweathermap.org/data/2.5';
    this.units = options.units || 'metric'; // Default to metric
    this.lang = options.lang || 'en'; // Default to English
  }

  /**
   * Fetches current weather data for a given city.
   * @param city The name of the city.
   * @returns A promise that resolves to CityWeather data.
   * @throws Error if the API request fails or returns an error.
   */
  public async getCurrentWeatherByCity(city: string): Promise<CityWeather> {
    if (!city) {
      throw new Error('City name cannot be empty.');
    }

    const url = new URL(`${this.baseUrl}/weather`);
    url.searchParams.append('q', city);
    url.searchParams.append('appid', this.apiKey);
    url.searchParams.append('units', this.units);
    url.searchParams.append('lang', this.lang);

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to fetch weather data for ${city}: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data: CityWeather = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Network or API error: ${error.message}`);
      }
      throw new Error('An unknown error occurred while fetching weather data.');
    }
  }
}

export { WeatherService };
export type { CityWeather, WeatherServiceOptions, Coordinates, WeatherCondition, MainWeatherInfo, WindInfo, CloudsInfo, SysInfo };