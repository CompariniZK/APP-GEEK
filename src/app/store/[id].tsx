import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Linking, Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FranchiseBadge } from '@/components/franchise-badge';
import { Icon } from '@/components/icon';
import { OpenBadge } from '@/components/open-badge';
import { Facts, StatusCard, stockTone } from '@/components/situation';
import { Timeline } from '@/components/timeline';
import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { getFranchise } from '@/data/franchises';
import { findStore } from '@/data/stores';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import {
  formatAgo,
  formatClock,
  KIND_LABEL,
  LIMIT_LABEL,
  QUEUE_DETAIL,
  QUEUE_LABEL,
  STOCK_LABEL,
} from '@/lib/format';
import { distanceMeters, formatDistance } from '@/lib/geo';
import { groupedWeek, openState, weekdayIndex } from '@/lib/hours';
import type { Store } from '@/lib/types';
import { useCommunity } from '@/state/community';
import { useFranchise } from '@/state/franchise';
import { useSelection } from '@/state/selection';

function openDirections(store: Store) {
  const { latitude: lat, longitude: lon } = store;
  const label = encodeURIComponent(store.name);
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lon}&q=${label}`
      : `geo:${lat},${lon}?q=${lat},${lon}(${label})`;
  Linking.openURL(url).catch(() => {});
}

/**
 * Store sheet. First step (compact): name, open state, status, facts, button.
 * Pulled up: actions, situation details, today's timeline, hours, history.
 */
export default function StoreSheet() {
  const theme = useTheme();
  const now = useNow();
  const params = useLocalSearchParams<{ id: string }>();
  const { selectedId, select, setSheetOpen, userLocation } = useSelection();
  const { currentReport, reportsFor, isFavorite, toggleFavorite } = useCommunity();
  const { franchise: chosen, setFranchise } = useFranchise();

  useEffect(() => {
    setSheetOpen(true);
    if (params.id) select(params.id);
    return () => {
      setSheetOpen(false);
      select(null);
    };
    // Mount/unmount only: tapping other pins updates the selection while the sheet stays open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const store = findStore(selectedId ?? params.id);
  if (!store) return null;

  // Show the game the fan is hunting; if this store doesn't sell it, fall back to one it does.
  const fr = store.franchises.includes(chosen.id) ? chosen : getFranchise(store.franchises[0]);
  const report = currentReport(store.id, fr.id, now);
  const history = reportsFor(store.id, fr.id);
  const favorite = isFavorite(store.id);
  const distance = userLocation ? formatDistance(distanceMeters(userLocation, store)) : null;
  const today = weekdayIndex(new Date(now));
  const todayCount = history.filter((r) => new Date(r.createdAt).toDateString() === new Date(now).toDateString()).length;

  const share = () => {
    const status = report ? `${STOCK_LABEL[report.stock]} (${formatAgo(report.createdAt, now)})` : 'pas d’info récente';
    Share.share({ message: `${store.name} — cartes ${fr.name} : ${status}. Vu sur RadarGeek.` }).catch(() => {});
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.paperRaised }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* ——— Compact step ——— */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.franchiseLine}>
            <FranchiseBadge franchise={fr} size={22} />
            <Txt variant="caption" tone="soft">
              Cartes {fr.name}
            </Txt>
          </View>
          <Txt variant="hero" size={30} numberOfLines={1} adjustsFontSizeToFit>
            {store.name}
          </Txt>
          <OpenBadge hours={store.hours} now={now} extra={distance} />
        </View>
        <Pressable
          accessibilityLabel="Fermer"
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.close, { backgroundColor: theme.chip }]}>
          <Icon name={{ ios: 'xmark', android: 'close' }} size={13} color={theme.ink} />
        </Pressable>
      </View>

      <StatusCard report={report} now={now} />
      {report ? <Facts report={report} /> : null}
      <Button
        label="Je suis sur place"
        onPress={() => router.push({ pathname: '/report/[id]', params: { id: store.id, franchise: fr.id } })}
      />

      {/* ——— Pulled up ——— */}
      <View style={styles.actions}>
        <Action
          label="Itinéraire"
          icon={{ ios: 'arrow.triangle.turn.up.right.diamond.fill', android: 'directions' }}
          onPress={() => openDirections(store)}
        />
        <Action
          label={favorite ? 'Favori' : 'Suivre'}
          icon={{ ios: favorite ? 'star.fill' : 'star', android: 'star' }}
          tint={favorite ? theme.signal : undefined}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            toggleFavorite(store.id);
          }}
        />
        <Action label="Partager" icon={{ ios: 'square.and.arrow.up', android: 'share' }} onPress={share} />
      </View>

      <Section title="Cartes vendues ici" aside="gamme à confirmer">
        <View style={styles.rangeRow}>
          {store.franchises.map((id) => {
            const f = getFranchise(id);
            const active = f.id === fr.id;
            const status = currentReport(store.id, f.id, now);
            return (
              <Pressable
                key={f.id}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setFranchise(f.id);
                }}
                style={[
                  styles.rangeChip,
                  { backgroundColor: active ? theme.ink : theme.chip },
                ]}>
                <FranchiseBadge franchise={f} size={22} />
                <Txt variant="caption" size={13} style={{ color: active ? theme.paper : theme.ink }}>
                  {f.name}
                </Txt>
                {status ? <View style={[styles.rangeDot, { backgroundColor: stockTone(theme, status.stock).solid }]} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Section>

      {report ? (
        <Section title="Situation">
          <View style={styles.tiles}>
            <View style={[styles.tile, { backgroundColor: theme.card }]}>
              <Txt variant="small" size={13} tone="soft">
                File d’attente
              </Txt>
              <Txt variant="title">{QUEUE_LABEL[report.queue]}</Txt>
              <Txt variant="small" size={13} tone="soft">
                {QUEUE_DETAIL[report.queue]}
              </Txt>
            </View>
            <View style={[styles.tile, { backgroundColor: theme.card }]}>
              <Txt variant="small" size={13} tone="soft">
                Limite
              </Txt>
              <Txt variant="title">{LIMIT_LABEL[report.limit]}</Txt>
              <Txt variant="small" size={13} tone="soft">
                selon le dernier signalement
              </Txt>
            </View>
          </View>
        </Section>
      ) : null}

      <Section title="Aujourd’hui" aside={todayCount === 1 ? '1 signalement' : `${todayCount} signalements`}>
        <Timeline reports={history} hours={store.hours} now={now} />
      </Section>

      <Section
        title="Horaires"
        aside={store.hours ? openState(store.hours, new Date(now)).label : undefined}
        asideTone={openState(store.hours, new Date(now)).state === 'open' ? 'goodInk' : 'soft'}>
        {store.hours ? (
          groupedWeek(store.hours, today).map((row) => (
            <View key={row.label} style={[styles.hoursRow, { borderColor: theme.chip }]}>
              <Txt
                variant={row.isToday ? 'bodyStrong' : 'small'}
                size={14.5}
                tone={row.closed ? 'faint' : row.isToday ? 'ink' : 'soft'}>
                {row.label}
              </Txt>
              <Txt
                variant={row.isToday ? 'bodyStrong' : 'small'}
                size={14.5}
                tone={row.closed ? 'faint' : row.isToday ? 'ink' : 'soft'}>
                {row.hours}
              </Txt>
            </View>
          ))
        ) : (
          <Txt variant="small" tone="soft">
            Horaires pas encore renseignés pour ce magasin.
          </Txt>
        )}
      </Section>

      <Section title="Derniers signalements">
        {history.length === 0 ? (
          <Txt variant="small" tone="soft">
            Aucun signalement pour l’instant. Sois le premier !
          </Txt>
        ) : (
          history.slice(0, 8).map((r) => {
            const tone = stockTone(theme, r.stock);
            return (
              <View key={r.id} style={styles.historyRow}>
                <View style={[styles.historyDot, { backgroundColor: tone.solid }]} />
                <View style={styles.historyBody}>
                  <Txt variant="bodyStrong" style={{ color: tone.ink }}>
                    {STOCK_LABEL[r.stock]}
                  </Txt>
                  <Txt variant="small" size={13} tone="soft">
                    {QUEUE_LABEL[r.queue]} · {LIMIT_LABEL[r.limit]}
                  </Txt>
                </View>
                <View style={styles.historyTime}>
                  <Txt variant="bodyStrong" size={14}>
                    {formatClock(r.createdAt)}
                  </Txt>
                  <Txt variant="caption" tone="soft">
                    {formatAgo(r.createdAt, now)}
                  </Txt>
                </View>
              </View>
            );
          })
        )}
      </Section>

      <View style={styles.footer}>
        <Txt variant="small" size={13} tone="soft">
          {KIND_LABEL[store.kind]}
          {store.address ? ` · ${store.address}` : ''}
        </Txt>
        {store.approxLocation ? (
          <Txt variant="small" size={13} tone="warnInk">
            Position approximative, à vérifier sur place.
          </Txt>
        ) : null}
        <Txt variant="caption" tone="faint">
          Données magasin : © contributeurs OpenStreetMap
        </Txt>
      </View>
    </ScrollView>
  );
}

function Action({
  label,
  icon,
  tint,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  tint?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, { backgroundColor: theme.chip }, pressed && { opacity: 0.7 }]}>
      <Icon name={icon} size={20} color={tint ?? theme.ink} />
      <Txt variant="caption" size={12.5}>
        {label}
      </Txt>
    </Pressable>
  );
}

function Section({
  title,
  aside,
  asideTone = 'soft',
  children,
}: {
  title: string;
  aside?: string;
  asideTone?: 'soft' | 'goodInk';
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Txt variant="heading">{title}</Txt>
        {aside ? (
          <Txt variant="small" size={13} tone={asideTone}>
            {aside}
          </Txt>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 6 },
  franchiseLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 5,
    paddingRight: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  rangeDot: { width: 8, height: 8, borderRadius: 4 },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 18 },
  action: {
    flex: 1,
    height: 62,
    borderRadius: Radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  section: { gap: 10, marginTop: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderRadius: Radius.tile, paddingVertical: 14, paddingHorizontal: 16, gap: 3 },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyBody: { flex: 1, gap: 1 },
  historyTime: { alignItems: 'flex-end', gap: 1 },
  footer: { gap: 4, marginTop: 20 },
});
