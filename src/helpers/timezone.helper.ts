import fetch from 'node-fetch';

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
