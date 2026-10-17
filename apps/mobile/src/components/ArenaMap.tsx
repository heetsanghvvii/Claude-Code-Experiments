// The only file that imports the map SDK. Swap to Mapbox or Google here without touching screens.
import MapView, { Circle, Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { colors } from '../lib/theme';
import type { SnapshotRow } from '../lib/types';

export interface ArenaMapProps {
  center: { lat: number; lng: number };
  radiusM: number;
  /** Released runner snapshots (hunters only; RLS returns nothing else). */
  snapshots?: SnapshotRow[];
  showsUserLocation?: boolean;
}

export function ArenaMap({ center, radiusM, snapshots = [], showsUserLocation = true }: ArenaMapProps) {
  // Frame the whole arena with some margin. 1 deg latitude ~ 111 km.
  const latDelta = ((radiusM * 2.6) / 111_000) || 0.01;
  const lngDelta = latDelta / Math.max(0.2, Math.cos((center.lat * Math.PI) / 180));
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: center.lat, longitude: center.lng, latitudeDelta: latDelta, longitudeDelta: lngDelta }}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton
      accessibilityLabel={`Arena map, ${Math.round(radiusM)} metre radius`}
    >
      <Circle
        center={{ latitude: center.lat, longitude: center.lng }}
        radius={radiusM}
        strokeColor={colors.accent}
        strokeWidth={3}
        fillColor="rgba(255, 90, 31, 0.08)"
      />
      {snapshots.map((s) => (
        <Circle
          key={`acc-${s.id}`}
          center={{ latitude: s.lat, longitude: s.lng }}
          radius={Math.max(5, s.accuracy_m)}
          strokeColor={colors.runner}
          fillColor="rgba(46, 196, 182, 0.15)"
        />
      ))}
      {snapshots.map((s) => (
        <Marker
          key={s.id}
          coordinate={{ latitude: s.lat, longitude: s.lng }}
          pinColor={colors.runner}
          title="Runner"
          description={`Seen ${new Date(s.recorded_at).toLocaleTimeString()} (±${Math.round(s.accuracy_m)} m)`}
        />
      ))}
    </MapView>
  );
}
