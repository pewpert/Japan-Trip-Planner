export interface WeatherPoint {
  coordinates: { lat: number; lng: number };
  locationName: string;
  elevationM?: number; // meters above sea level at this point
  current: WeatherCondition;
  forecast: WeatherCondition[]; // next 7 days
}

export interface WeatherCondition {
  date: string; // ISO date string
  temp?: number; // Celsius — instantaneous reading, only set on current conditions
  tempMin: number; // Celsius
  tempMax: number; // Celsius
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number; // WMO weather code
  description: string;
  icon: string; // icon name — see WeatherIconName in lib/weather.ts
  isRideSafe: boolean; // derived: false if heavy rain/snow/storm
}
