import fetch from 'node-fetch';
import { Client } from '@googlemaps/google-maps-services-js';
import { kirk } from './log.helper';
const GoogleCloudClient = new Client({});

type IPGeolocationResponse = {
  geo: {
    country: string;
    state: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  timezone: string;
  timezone_offset: number;
  date: string;
  date_time: string;
  date_time_txt: string;
  date_time_wti: string;
  date_time_ymd: string;
  date_time_unix: number;
  time_24: string;
  time_12: string;
  week: string;
  month: string;
  year: string;
  year_abbr: string;
  is_dst: boolean;
  dst_savings: number;
};

export const getTimeZone = async (city: string, state: string) => {
  const API_KEY = process.env.IPGEOLOCATION_API_KEY;
  const result = await fetch(
    `https://api.ipgeolocation.io/timezone?apiKey=${API_KEY}&location=${city},%20${state}`,
  );
  const data = (await result.json()) as IPGeolocationResponse;
  const { timezone, timezone_offset } = data;
  return { timezone, timezone_offset };
};

export const getGeocodingForAddress = async (
  street: string,
  city: string,
  state: string,
) => {
  const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
  if (!API_KEY) {
    return {
      error: 'Missing API Key',
    };
  }
  try {
    const response = await GoogleCloudClient.geocode({
      params: {
        key: API_KEY,
        address: `${street} ${city} ${state}`,
      },
      timeout: 1000,
    });
    const geocodeResults = response.data.results;
    if (!geocodeResults.length) {
      return {
        error: 'Could not geocode this address',
      };
    }
    const result = geocodeResults[0];

    const { types, geometry } = result;
    kirk.info(types);
    const { location } = geometry;
    return {
      location,
    };
  } catch (err) {
    const error = err.response.data.error_message;
    kirk.error(error);
    return { error };
  }
};
