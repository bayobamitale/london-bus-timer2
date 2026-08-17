export type Arrival = {
  id: string;
  lineId: string;
  lineName: string;
  destinationName: string;
  direction: string;
  timeToStation: number;
  stopLetter?: string;
  stopPointName?: string;
  modeName?: string;
};

export type BusLine = {
  id: string;
  name: string;
};

export type LineDirection = 'inbound' | 'outbound';

export type LineRouteStop = {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  stopLetter?: string;
};

export type LineDirectionStops = {
  direction: LineDirection;
  stops: LineRouteStop[];
};

export type StopPoint = {
  id: string;
  naptanId: string;
  commonName: string;
  lat: number;
  lon: number;
  stopLetter?: string;
  indicator?: string;
  modes: string[];
  distance?: number;
};

export type PostcodeLocation = {
  postcode: string;
  latitude: number;
  longitude: number;
};
