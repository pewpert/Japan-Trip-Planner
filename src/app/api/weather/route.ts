import { NextRequest, NextResponse } from "next/server";
import type { WeatherPoint, WeatherCondition } from "@/types/weather";
import { getWeatherCodeInfo } from "@/lib/weather";

interface RequestPoint {
  lat: number;
  lng: number;
  name?: string;
}

// Shapes returned by the Open-Meteo forecast endpoint (free, no API key)
interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  weathercode: number[];
  windspeed_10m_max: number[];
}

interface OpenMeteoCurrentWeather {
  time: string;
  temperature: number;
  windspeed: number;
  weathercode: number;
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current_weather: OpenMeteoCurrentWeather;
  daily: OpenMeteoDaily;
}

function toCondition(daily: OpenMeteoDaily, dayIndex: number): WeatherCondition {
  const code = daily.weathercode[dayIndex];
  const info = getWeatherCodeInfo(code);
  return {
    date: daily.time[dayIndex],
    tempMin: daily.temperature_2m_min[dayIndex],
    tempMax: daily.temperature_2m_max[dayIndex],
    precipitationMm: daily.precipitation_sum[dayIndex],
    windSpeedKmh: daily.windspeed_10m_max[dayIndex],
    weatherCode: code,
    ...info,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { points } = await req.json();

    if (!Array.isArray(points) || points.length === 0) {
      return NextResponse.json(
        { error: "points array is required" },
        { status: 400 }
      );
    }

    const validPoints: RequestPoint[] = points.filter(
      (p: RequestPoint) =>
        typeof p?.lat === "number" &&
        typeof p?.lng === "number" &&
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng)
    );
    if (validPoints.length === 0) {
      return NextResponse.json(
        { error: "Each point needs numeric lat and lng" },
        { status: 400 }
      );
    }

    // One request for all points — Open-Meteo accepts comma-separated coords
    const latitude = validPoints.map((p) => p.lat.toFixed(4)).join(",");
    const longitude = validPoints.map((p) => p.lng.toFixed(4)).join(",");

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max` +
      `&current_weather=true` +
      `&timezone=Asia%2FTokyo` +
      `&forecast_days=7`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Open-Meteo error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Open-Meteo returns an object for one location, an array for several
    const results: OpenMeteoResponse[] = Array.isArray(data) ? data : [data];

    const weather: WeatherPoint[] = results.map((result, i) => {
      const point = validPoints[i];
      const forecast = result.daily.time.map((_, d) => toCondition(result.daily, d));

      const cw = result.current_weather;
      const currentInfo = getWeatherCodeInfo(cw.weathercode);
      const today = forecast[0];
      const current: WeatherCondition = {
        date: cw.time,
        temp: cw.temperature,
        tempMin: today?.tempMin ?? cw.temperature,
        tempMax: today?.tempMax ?? cw.temperature,
        precipitationMm: today?.precipitationMm ?? 0,
        windSpeedKmh: cw.windspeed,
        weatherCode: cw.weathercode,
        ...currentInfo,
      };

      return {
        coordinates: { lat: point.lat, lng: point.lng },
        locationName: point.name ?? `Point ${i + 1}`,
        current,
        forecast,
      };
    });

    return NextResponse.json({ weather });
  } catch (err) {
    console.error("[/api/weather]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
