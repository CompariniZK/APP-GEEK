import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClusterPin } from '@/components/cluster-pin';
import { FranchiseBadge } from '@/components/franchise-badge';
import { FranchiseList } from '@/components/franchise-picker';
import { Icon } from '@/components/icon';
import { StorePin } from '@/components/store-pin';
import { Txt } from '@/components/txt';
import { Fonts, Radius } from '@/constants/theme';
import { CITY_REGION, STORES, storesFor } from '@/data/stores';
import { nextRelease } from '@/data/upcoming';
import { useNow } from '@/hooks/use-now';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { countdownLabel } from '@/lib/format';
import { clusterStores, normalize, type Region, type StoreCluster } from '@/lib/geo';
import type { StockLevel, Store } from '@/lib/types';
import { useCommunity } from '@/state/community';
import { useFranchise } from '@/state/franchise';
import { useSelection } from '@/state/selection';

const TAB_BAR = Platform.select({ ios: 50, default: 80 });

type Filter = 'all' | StockLevel;

export default function MapScreen() {
  const theme = useTheme();
  const dark = useIsDark();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { currentReport } = useCommunity();
  const { franchise } = useFranchise();
  const { selectedId, select, sheetOpen, userLocation, setUserLocation } = useSelection();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(CITY_REGION);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [showUser, setShowUser] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const stores = useMemo(() => storesFor(franchise.id), [franchise.id]);

  useEffect(() => {
    (async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        setShowUser(granted);
        if (!granted) return;
        const pos =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        if (pos) setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        // Location is a nice-to-have: the map works without it.
      }
    })();
  }, [setUserLocation]);

  const stockOf = (store: Store) => currentReport(store.id, franchise.id, now)?.stock;

  const counts = useMemo(() => {
    const c = { all: stores.length, beaucoup: 0, peu: 0, epuise: 0 };
    for (const s of stores) {
      const stock = currentReport(s.id, franchise.id, now)?.stock;
      if (stock) c[stock] += 1;
    }
    return c;
  }, [stores, currentReport, franchise.id, now]);

  const visible = useMemo(() => {
    const q = normalize(query);
    return stores.filter(
      (s) =>
        (q === '' || normalize(s.name).includes(q)) &&
        (filter === 'all' || currentReport(s.id, franchise.id, now)?.stock === filter),
    );
  }, [stores, query, filter, currentReport, franchise.id, now]);

  const clusters = useMemo(() => clusterStores(visible, region), [visible, region]);
  const upcoming = useMemo(() => nextRelease(new Date(now), franchise.id), [now, franchise.id]);

  const openStore = (store: Store) => {
    select(store.id);
    // Keep the pin in the upper part of the map, above the sheet.
    mapRef.current?.animateToRegion(
      {
        latitude: store.latitude - region.latitudeDelta * 0.2,
        longitude: store.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      },
      350,
    );
    if (!sheetOpen) router.push({ pathname: '/store/[id]', params: { id: store.id } });
  };

  const zoomInto = (cluster: StoreCluster) => {
    const lats = cluster.stores.map((s) => s.latitude);
    const lons = cluster.stores.map((s) => s.longitude);
    const spread = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lons) - Math.min(...lons));
    const delta = Math.max(spread * 4, 0.004);
    mapRef.current?.animateToRegion(
      { latitude: cluster.latitude, longitude: cluster.longitude, latitudeDelta: delta, longitudeDelta: delta },
      400,
    );
  };

  const recenter = () => {
    const target = userLocation
      ? { ...userLocation, latitudeDelta: 0.03, longitudeDelta: 0.03 }
      : CITY_REGION;
    mapRef.current?.animateToRegion(target, 400);
  };

  const submitSearch = () => {
    if (visible.length === 1) openStore(visible[0]);
    else if (visible.length > 1) {
      const lats = visible.map((s) => s.latitude);
      const lons = visible.map((s) => s.longitude);
      const latDelta = Math.max(...lats) - Math.min(...lats);
      const lonDelta = Math.max(...lons) - Math.min(...lons);
      mapRef.current?.animateToRegion(
        {
          latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
          longitude: (Math.max(...lons) + Math.min(...lons)) / 2,
          latitudeDelta: Math.max(latDelta * 1.6, 0.01),
          longitudeDelta: Math.max(lonDelta * 1.6, 0.01),
        },
        400,
      );
    }
  };

  const chips: { key: Filter; label: string; color: string | null }[] = [
    { key: 'all', label: `Tout · ${counts.all}`, color: null },
    { key: 'beaucoup', label: `En stock · ${counts.beaucoup}`, color: theme.good },
    { key: 'peu', label: `Presque plus · ${counts.peu}`, color: theme.warn },
    { key: 'epuise', label: `Épuisé · ${counts.epuise}`, color: theme.out },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.paper }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={CITY_REGION}
        onRegionChangeComplete={(r) => setRegion(r)}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        userInterfaceStyle={dark ? 'dark' : 'light'}
        showsPointsOfInterests={false}
        showsUserLocation={showUser}
        showsCompass={false}
        toolbarEnabled={false}
        onPress={(e) => {
          if (e.nativeEvent.action === 'marker-press') return;
          if (sheetOpen) router.back();
        }}>
        {clusters.map((cluster) => {
          if (cluster.stores.length > 1) {
            return (
              <Marker
                key={`cluster-${cluster.key}`}
                coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                onPress={() => zoomInto(cluster)}>
                <ClusterPin count={cluster.stores.length} />
              </Marker>
            );
          }
          const store = cluster.stores[0];
          const stock = stockOf(store);
          const isSelected = store.id === selectedId;
          const tilt = STORES.indexOf(store) % 2 === 0 ? -6 : 5;
          return (
            <Marker
              key={`${store.id}-${stock ?? 'none'}-${isSelected ? 'on' : 'off'}`}
              coordinate={{ latitude: store.latitude, longitude: store.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={isSelected ? 10 : 1}
              tracksViewChanges={false}
              onPress={() => openStore(store)}>
              <StorePin stock={stock} selected={isSelected} tilt={tilt} />
            </Marker>
          );
        })}
      </MapView>

      {/* Search + filters */}
      <View style={[styles.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={[styles.search, { backgroundColor: theme.paperRaised }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Jeu de cartes : ${franchise.name}. Changer`}
            hitSlop={6}
            onPress={() => setPickerOpen((open) => !open)}
            style={styles.franchiseButton}>
            <FranchiseBadge franchise={franchise} size={32} />
            <Icon
              name={{ ios: pickerOpen ? 'chevron.up' : 'chevron.down', android: pickerOpen ? 'expand_less' : 'expand_more' }}
              size={11}
              color={theme.inkSoft}
            />
          </Pressable>
          <View style={[styles.searchDivider, { backgroundColor: theme.rule }]} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            placeholder="Chercher un magasin"
            placeholderTextColor={theme.inkSoft}
            returnKeyType="search"
            autoCorrect={false}
            style={[styles.searchInput, { color: theme.ink }]}
          />
          {query ? (
            <Pressable accessibilityLabel="Effacer la recherche" hitSlop={10} onPress={() => setQuery('')}>
              <Icon name={{ ios: 'xmark.circle.fill', android: 'cancel' }} size={20} color={theme.inkFaint} />
            </Pressable>
          ) : (
            <Icon name={{ ios: 'magnifyingglass', android: 'search' }} size={18} color={theme.inkSoft} />
          )}
        </View>

        {pickerOpen ? (
          <View style={styles.pickerWrap}>
            <FranchiseList
              onPicked={() => {
                setPickerOpen(false);
                setFilter('all');
                if (sheetOpen) router.back();
              }}
            />
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}>
          {chips.map((chip) => {
            const active = filter === chip.key;
            const activeBg = chip.color ?? theme.ink;
            return (
              <Pressable
                key={chip.key}
                onPress={() => setFilter(active && chip.key !== 'all' ? 'all' : chip.key)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? activeBg : theme.paperRaised },
                ]}>
                {chip.color ? (
                  <View style={[styles.chipDot, { backgroundColor: active ? '#FFFFFF' : chip.color }]} />
                ) : null}
                <Txt variant="caption" size={13} style={{ color: active ? (chip.color ? '#FFFFFF' : theme.paper) : theme.ink }}>
                  {chip.label}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom: locate button + next release */}
      {!sheetOpen ? (
        <View style={[styles.bottom, { bottom: insets.bottom + TAB_BAR + 12 }]} pointerEvents="box-none">
          <Pressable
            accessibilityLabel="Me localiser"
            onPress={recenter}
            style={[styles.locate, { backgroundColor: theme.paperRaised }]}>
            <Icon name={{ ios: 'location.fill', android: 'my_location' }} size={18} color={theme.ink} />
          </Pressable>
          {upcoming ? (
            <Pressable
              onPress={() => router.navigate('/sorties')}
              style={({ pressed }) => [styles.ticker, { backgroundColor: theme.paperRaised }, pressed && { opacity: 0.85 }]}>
              <View style={[styles.tickerIcon, { backgroundColor: theme.signalTint }]}>
                <Icon name={{ ios: 'calendar', android: 'calendar_month' }} size={18} color={theme.signal} />
              </View>
              <View style={styles.tickerText}>
                <Txt variant="caption" tone="soft">
                  Prochaine sortie
                </Txt>
                <Txt variant="bodyStrong" numberOfLines={1}>
                  {upcoming.title}
                </Txt>
              </View>
              <View style={[styles.countdown, { backgroundColor: theme.signal }]}>
                <Txt variant="caption" size={13} tone="onSignal">
                  {countdownLabel(upcoming.days ?? 0)}
                </Txt>
              </View>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const shadow = {
  shadowColor: '#16140F',
  shadowOpacity: 0.16,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { position: 'absolute', left: 0, right: 0, gap: 10 },
  search: {
    marginHorizontal: 16,
    height: 50,
    borderRadius: Radius.pill,
    paddingLeft: 9,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadow,
  },
  franchiseButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  searchDivider: { width: 1, height: 22 },
  pickerWrap: { marginHorizontal: 16 },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, paddingVertical: 0 },
  chipsScroll: { flexGrow: 0 },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    ...shadow,
    shadowOpacity: 0.1,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  bottom: { position: 'absolute', left: 16, right: 16, gap: 10 },
  locate: {
    alignSelf: 'flex-end',
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.card,
    padding: 10,
    paddingRight: 12,
    ...shadow,
  },
  tickerIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tickerText: { flex: 1, gap: 1 },
  countdown: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
});
