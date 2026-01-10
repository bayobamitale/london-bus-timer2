import * as Location from 'expo-location';

export const useCurrentLocation = () => {
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Permission denied' };
    }

    const location = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const place =
      address[0].district ||
      address[0].subregion ||
      address[0].city ||
      address[0].region ||
      'your area';

    return { latitude: location.coords.latitude, longitude: location.coords.longitude, place };
  };

  return { getLocation };
};
