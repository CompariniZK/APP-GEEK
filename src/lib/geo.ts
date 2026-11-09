import type { Store } from '@/lib/types';

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 430 -> "430 m", 2340 -> "2,3 km" (French decimal comma). */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export type StoreCluster = LatLng & { key: string; stores: Store[] };

/**
 * Groups stores that would overlap on screen at the current zoom level.
 * The merge distance is a fixed share of the visible map height, so clusters split as you zoom in.
 */
export function clusterStores(stores: Store[], region: Region): StoreCluster[] {
  const threshold = region.latitudeDelta * 0.05;
  const lonScale = Math.cos((region.latitude * Math.PI) / 180);
  const clusters: StoreCluster[] = [];

  for (const store of stores) {
    const hit = clusters.find(
      (c) => Math.hypot(c.latitude - store.latitude, (c.longitude - store.longitude) * lonScale) < threshold,
    );
    if (hit) {
      const n = hit.stores.length;
      hit.latitude = (hit.latitude * n + store.latitude) / (n + 1);
      hit.longitude = (hit.longitude * n + store.longitude) / (n + 1);
      hit.stores.push(store);
    } else {
      clusters.push({ key: store.id, latitude: store.latitude, longitude: store.longitude, stores: [store] });
    }
  }
  for (const c of clusters) c.key = c.stores.map((s) => s.id).sort().join('+');
  return clusters;
}

/** Lower-case, accent-free text for search. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
