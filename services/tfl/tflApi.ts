import { tflFetch } from './client';
import type {
  Arrival,
  BusLine,
  LineDirection,
  LineDirectionStops,
  LineRouteStop,
  PostcodeLocation,
  StopPoint,
} from './types';

type TflArrivalRaw = {
  id?: string;
  lineId?: string;
  lineName?: string;
  destinationName?: string;
  direction?: string;
  timeToStation?: number;
  stationLetter?: string;
  stopLetter?: string;
  stationName?: string;
  stopPointName?: string;
  modeName?: string;
};

type TflLineRaw = {
  id: string;
  name: string;
};

type TflStopPointRaw = {
  id: string;
  naptanId?: string;
  commonName: string;
  lat: number;
  lon: number;
  stopLetter?: string;
  indicator?: string;
  modes?: string[];
  distance?: number;
};

type TflNearbyStopsRaw = {
  stopPoints?: TflStopPointRaw[];
};

type TflRouteStopRaw = {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  stopLetter?: string;
};

type TflStopPointSequenceRaw = {
  direction?: string;
  branchId?: number;
  stopPoint?: TflRouteStopRaw[];
};

type TflRouteSequenceRaw = {
  stopPointSequences?: TflStopPointSequenceRaw[];
};

type PostcodesIoResponse = {
  status: number;
  result?: {
    postcode: string;
    latitude: number;
    longitude: number;
  };
};

function mapArrival(raw: TflArrivalRaw): Arrival {
  return {
    id:
      raw.id ||
      `${raw.lineId ?? 'line'}-${raw.destinationName ?? 'dest'}-${raw.timeToStation ?? 0}`,
    lineId: raw.lineId ?? '',
    lineName: raw.lineName ?? '',
    destinationName: raw.destinationName ?? '',
    direction: raw.direction ?? '',
    timeToStation: raw.timeToStation ?? 0,
    stopLetter: raw.stationLetter || raw.stopLetter,
    stopPointName: raw.stopPointName || raw.stationName,
    modeName: raw.modeName,
  };
}

function mapStopPoint(raw: TflStopPointRaw): StopPoint {
  return {
    id: raw.id,
    naptanId: raw.naptanId ?? raw.id,
    commonName: raw.commonName,
    lat: raw.lat,
    lon: raw.lon,
    stopLetter: raw.stopLetter,
    indicator: raw.indicator,
    modes: raw.modes ?? ['bus'],
    distance: raw.distance,
  };
}

export function formatArrivalTime(seconds: number): string {
  if (seconds <= 0) return 'Due';
  const minutes = Math.floor(seconds / 60);
  return minutes <= 0 ? 'Due' : `${minutes} min`;
}

/** Live bus arrivals for a stop, soonest first. */
export async function getStopArrivals(stopId: string): Promise<Arrival[]> {
  const data = await tflFetch<TflArrivalRaw[]>(`/StopPoint/${encodeURIComponent(stopId)}/Arrivals`);

  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => !item.modeName || item.modeName === 'bus')
    .map(mapArrival)
    .sort((a, b) => a.timeToStation - b.timeToStation);
}

/** Details for a single TfL stop point. */
export async function getStopPoint(stopId: string): Promise<StopPoint> {
  const data = await tflFetch<TflStopPointRaw>(`/StopPoint/${encodeURIComponent(stopId)}`);
  return mapStopPoint(data);
}

/** All TfL bus lines. */
export async function getBusLines(): Promise<BusLine[]> {
  const data = await tflFetch<TflLineRaw[]>('/Line/Mode/bus');

  if (!Array.isArray(data)) return [];

  return data
    .map((line) => ({ id: line.id, name: line.name }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
}

/** Ordered stops for both directions of a bus line. */
export async function getLineDirectionStops(lineId: string): Promise<LineDirectionStops[]> {
  const data = await tflFetch<TflRouteSequenceRaw>(
    `/Line/${encodeURIComponent(lineId)}/Route/Sequence/all`
  );
  const sequences = Array.isArray(data.stopPointSequences) ? data.stopPointSequences : [];
  const directions: LineDirection[] = ['inbound', 'outbound'];

  return directions.map((direction) => {
    const seen = new Set<string>();
    const stops: LineRouteStop[] = [];

    sequences
      .filter((sequence) => sequence.direction?.toLowerCase() === direction)
      .sort((a, b) => (a.branchId ?? 0) - (b.branchId ?? 0))
      .forEach((sequence) => {
        sequence.stopPoint?.forEach((stop) => {
          if (seen.has(stop.id)) return;
          seen.add(stop.id);
          stops.push({
            id: stop.id,
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon,
            stopLetter: stop.stopLetter,
          });
        });
      });

    return { direction, stops };
  });
}

/** Bus stops near a coordinate (metres). */
export async function getNearbyBusStops(
  latitude: number,
  longitude: number,
  radiusMeters = 500
): Promise<StopPoint[]> {
  const data = await tflFetch<TflNearbyStopsRaw>('/StopPoint', {
    lat: latitude,
    lon: longitude,
    stopTypes: 'NaptanPublicBusCoachTram',
    modes: 'bus',
    radius: radiusMeters,
  });

  if (!Array.isArray(data.stopPoints)) return [];

  return data.stopPoints
    .map(mapStopPoint)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

/** Resolve a UK postcode to coordinates via postcodes.io. */
export async function resolvePostcode(postcode: string): Promise<PostcodeLocation | null> {
  const normalised = postcode.trim().toUpperCase();
  const res = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(normalised)}`
  );
  const data = (await res.json()) as PostcodesIoResponse;

  if (!data?.result || data.status !== 200) return null;

  return {
    postcode: data.result.postcode,
    latitude: data.result.latitude,
    longitude: data.result.longitude,
  };
}

/** Bus stops near a UK postcode. */
export async function getStopsNearPostcode(
  postcode: string,
  radiusMeters = 500
): Promise<StopPoint[]> {
  const location = await resolvePostcode(postcode);
  if (!location) return [];

  return getNearbyBusStops(location.latitude, location.longitude, radiusMeters);
}

/** Search TfL stop points by free-text query. */
export async function searchBusStops(query: string): Promise<StopPoint[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const data = await tflFetch<{ matches?: TflStopPointRaw[] }>('/StopPoint/Search', {
    query: trimmed,
    modes: 'bus',
  });

  if (!Array.isArray(data.matches)) return [];

  return data.matches.map(mapStopPoint);
}
