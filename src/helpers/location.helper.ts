import fetch from 'node-fetch';
import { Client } from '@googlemaps/google-maps-services-js';
import { kirk } from './log.helper';
import { Appointment } from '../models/appointment.model';
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

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points).                                   :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::

//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distanceFromCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'M' | 'K' | 'N',
) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

export function getRadiusForDay(appointments: Appointment[]) {
  let maxDistance = 0;
  for (const a1 of appointments) {
    for (const a2 of appointments) {
      if (a1.id === a2.id) {
        continue;
      }
      const distance = distanceFromCoordinates(
        a1.latitude,
        a1.longitude,
        a2.latitude,
        a2.longitude,
        'M',
      );
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
  }
  return Math.ceil(maxDistance / 2);
}
