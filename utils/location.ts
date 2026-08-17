import * as Location from 'expo-location';

// Camberwell Green SE5, London (approx. park centre / SE5 7AB)
export const DEFAULT_LOCATION = {
  name: 'Camberwell Green',
  area: 'SE5 London',
  latitude: 51.474,
  longitude: -0.093,
} as const;

// Rough Greater London bounds — used to ignore emulator/device GPS far from London
const LONDON_BOUNDS = {
  minLat: 51.28,
  maxLat: 51.70,
  minLon: -0.55,
  maxLon: 0.35,
};

export type LocationResult =
  | { status: 'granted'; location: Location.LocationObject; isDefault: boolean }
  | { status: 'denied' };

export const LOCATION_DENIED_MESSAGE = 'Permission to access location was denied.';

function createLocationObject(
  latitude: number,
  longitude: number
): Location.LocationObject {
  return {
    coords: {
      latitude,
      longitude,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
}

function isInLondon(latitude: number, longitude: number) {
  return (
    latitude >= LONDON_BOUNDS.minLat &&
    latitude <= LONDON_BOUNDS.maxLat &&
    longitude >= LONDON_BOUNDS.minLon &&
    longitude <= LONDON_BOUNDS.maxLon
  );
}

function defaultLocationResult(): LocationResult {
  return {
    status: 'granted',
    isDefault: true,
    location: createLocationObject(
      DEFAULT_LOCATION.latitude,
      DEFAULT_LOCATION.longitude
    ),
  };
}

// Prefer a live London fix; otherwise fall back to Camberwell Green SE5 so the
// app stays useful on emulators and devices outside London.
export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { status: 'denied' };
    }

    let location: Location.LocationObject | null = null;

    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch {
      location = await Location.getLastKnownPositionAsync();
    }

    if (
      location &&
      isInLondon(location.coords.latitude, location.coords.longitude)
    ) {
      return { status: 'granted', location, isDefault: false };
    }

    return defaultLocationResult();
  } catch {
    return defaultLocationResult();
  }
}

export function getLocationErrorMessage(status: 'denied') {
  return LOCATION_DENIED_MESSAGE;
}
