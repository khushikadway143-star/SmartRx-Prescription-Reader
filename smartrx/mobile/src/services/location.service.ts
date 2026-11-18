import Geolocation from '@react-native-community/geolocation';

export const getLocation = () =>
  new Promise<{ lat: number; lng: number } | null>((resolve) =>
    Geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60_000 },
    ),
  );
