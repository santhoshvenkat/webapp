export enum OrientationType {
  PORTRAIT_PRIMARY = 'portrait-primary',
  LANDSCAPE_PRIMARY = 'landscape-primary',
  PORTRAIT_SECONDARY = 'portrait-secondary',
  LANDSCAPE_SECONDARY = 'landscape-secondary',
  UNKNOWN = 'unknown',
}

export interface WeatherData {
  temperature: number;
  description: string;
  icon: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle' | 'Atmosphere' | string;
}