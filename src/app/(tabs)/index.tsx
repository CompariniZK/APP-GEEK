import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FranchiseBadge } from '@/components/franchise-badge';
import { FranchiseCards } from '@/components/franchise-picker';
import { Icon } from '@/components/icon';
import { stockTone } from '@/components/situation';
import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { CITY_NAME, findStore, STORES, storesFor } from '@/data/stores';
import { nextRelease } from '@/data/upcoming';
import { useNow } from '@/hooks/use-now';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { countdownLabel, formatAgo, monthShort, QUEUE_LABEL, STOCK_LABEL } from '@/lib/format';
import { useCommunity } from '@/state/community';
import { useFranchise } from '@/state/franchise';

function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 5 || h >= 18) return 'Bonsoir !';
  return 'Bonjour !';
}

/** Text colour on the dark welcome banner. */
const ON_BANNER = '#F3EFE6';

export default function HomeScreen() {
  const theme = useTheme();
  const dark = useIsDark();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { franchise } = useFranchise();
  const { currentReport, recentReports, favorites } = useCommunity();

  const stores = useMemo(() => storesFor(franchise.id), [franchise.id]);
  const counts = useMemo(() => {
    const c = { beaucoup: 0, peu: 0, epuise: 0 };
    for (const s of stores) {
      const stock = currentReport(s.id, franchise.id, now)?.stock;
      if (stock) c[stock] += 1;
    }
    return c;
  }, [stores, currentReport, franchise.id, now]);
  const reported = counts.beaucoup + counts.peu + counts.epuise;
  const recent = recentReports(franchise.id, now, 4);
  const upcoming = nextRelease(new Date(now), franchise.id);
  const favoriteStores = STORES.filter((s) => favorites.includes(s.id));
  const tint = dark ? franchise.tintDark : franchise.tint;

  const openStore = (id: string) => router.push({ pathname: '/store/[id]', params: { id } });
  const bannerBg = dark ? '#2A2722' : '#16140F';

  // The banner is dark in both themes: light status bar while this tab is on screen.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle(dark ? 'light' : 'dark');
    }, [dark]),
  );

  return (
    <ScrollView
      style={{ backgroundColor: theme.paper }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
      {/* Welcome banner */}
      <View style={[styles.banner, { backgroundColor: bannerBg, paddingTop: insets.top + 12 }]}>
        {/* Same colour above the banner, so pulling the page down never shows a gap. */}
        <View style={[styles.overscroll, { backgroundColor: bannerBg }]} />
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={[styles.mark, { backgroundColor: theme.signal }]} />
            <Txt variant="title" size={20} style={{ color: ON_BANNER }}>
              RadarGeek
            </Txt>
          </View>
          <View style={styles.city}>
            <Icon name={{ ios: 'location.fill', android: 'location_on' }} size={11} color={theme.signal} />
            <Txt variant="caption" size={12.5} style={{ color: ON_BANNER }}>
              {CITY_NAME}
            </Txt>
          </View>
        </View>

        <View style={styles.welcome}>
          <Txt variant="bodyStrong" size={15} style={{ color: ON_BANNER, opacity: 0.65 }}>
            {greeting(new Date(now))}
          </Txt>
          <Txt variant="hero" size={31} style={{ color: ON_BANNER, lineHeight: 36 }}>
            Tu chasses quoi aujourd’hui ?
          </Txt>
        </View>
      </View>

      {/* Game cards, half over the banner */}
      <View style={styles.cardsOverlap}>
        <FranchiseCards />
      </View>

      <View style={styles.content}>

      {/* Radar for the chosen game */}
      <View style={[styles.radar, { backgroundColor: tint }]}>
        <View style={styles.radarHead}>
          <FranchiseBadge franchise={franchise} size={30} />
          <Txt variant="heading" style={styles.flex}>
            Cartes {franchise.name}
          </Txt>
          <View style={styles.live}>
            <View style={[styles.liveDot, { backgroundColor: theme.signal }]} />
            <Txt variant="caption" tone="soft">
              en direct
            </Txt>
          </View>
        </View>

        {reported > 0 ? (
          <View style={styles.radarBody}>
            <View style={styles.bigLine}>
              <Txt variant="hero" size={48} style={{ lineHeight: 52 }}>
                {counts.beaucoup}
              </Txt>
              <Txt variant="bodyStrong" size={16} style={styles.flex}>
                {counts.beaucoup === 1 ? 'magasin a du stock' : 'magasins ont du stock'} en ce moment
              </Txt>
            </View>
            <View style={styles.pills}>
              <CountPill label="En stock" value={counts.beaucoup} stock="beaucoup" />
              <CountPill label="Presque plus" value={counts.peu} stock="peu" />
              <CountPill label="Épuisé" value={counts.epuise} stock="epuise" />
            </View>
          </View>
        ) : (
          <View style={styles.radarBody}>
            <Txt variant="title">Pas encore d’info aujourd’hui</Txt>
            <Txt variant="small" tone="soft">
              Le radar s’allume quand les fans signalent ce qu’ils voient en boutique.
            </Txt>
          </View>
        )}

        <Txt variant="small" size={13} tone="soft">
          {stores.length} boutiques vendent du {franchise.name} à {CITY_NAME}
        </Txt>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/carte')}
          style={({ pressed }) => [styles.mapButton, { backgroundColor: theme.ink }, pressed && { opacity: 0.85 }]}>
          <Icon name={{ ios: 'map.fill', android: 'map' }} size={18} color={theme.paper} />
          <Txt variant="heading" size={16} style={{ color: theme.paper }}>
            Ouvrir la carte
          </Txt>
        </Pressable>
      </View>

      {/* Next release for this game */}
      <Pressable
        onPress={() => router.navigate('/sorties')}
        style={({ pressed }) => [styles.release, { backgroundColor: theme.paperRaised }, pressed && { opacity: 0.85 }]}>
        {upcoming?.day ? (
          <View style={[styles.dateBlock, { backgroundColor: theme.card }]}>
            <Txt variant="title" size={20}>
              {upcoming.day.getDate()}
            </Txt>
            <Txt variant="caption" size={11} tone="soft">
              {monthShort(upcoming.day)}
            </Txt>
          </View>
        ) : (
          <View style={[styles.dateBlock, { backgroundColor: theme.card }]}>
            <Icon name={{ ios: 'calendar', android: 'calendar_month' }} size={20} color={theme.inkSoft} />
          </View>
        )}
        <View style={styles.flex}>
          <Txt variant="caption" tone="soft">
            Prochaine sortie
          </Txt>
          <Txt variant="bodyStrong" numberOfLines={2}>
            {upcoming ? upcoming.title : 'Rien d’annoncé pour l’instant'}
          </Txt>
        </View>
        {upcoming?.days != null ? (
          <View style={[styles.countdown, { backgroundColor: upcoming.days <= 7 ? theme.signal : theme.chip }]}>
            <Txt variant="caption" size={13} tone={upcoming.days <= 7 ? 'onSignal' : 'ink'}>
              {countdownLabel(upcoming.days)}
            </Txt>
          </View>
        ) : null}
      </Pressable>

      {/* Latest reports */}
      <View style={styles.section}>
        <Txt variant="heading">Derniers signalements</Txt>
        {recent.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.paperRaised }]}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.signalTint }]}>
              <Icon name={{ ios: 'megaphone.fill', android: 'campaign' }} size={20} color={theme.signal} />
            </View>
            <View style={styles.flex}>
              <Txt variant="bodyStrong">Sois le premier à signaler</Txt>
              <Txt variant="small" size={13.5} tone="soft">
                Tu passes devant une boutique ? Dis à la communauté s’il reste des cartes {franchise.name}.
              </Txt>
            </View>
          </View>
        ) : (
          <View style={[styles.group, { backgroundColor: theme.paperRaised }]}>
            {recent.map((r, i) => {
              const store = findStore(r.storeId);
              if (!store) return null;
              const tone = stockTone(theme, r.stock);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => openStore(store.id)}
                  style={({ pressed }) => [
                    styles.reportRow,
                    i < recent.length - 1 && { borderBottomWidth: 1, borderColor: theme.chip },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <View style={[styles.reportDot, { backgroundColor: tone.solid }]} />
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong">{store.name}</Txt>
                    <Txt variant="small" size={13} style={{ color: tone.ink }}>
                      {STOCK_LABEL[r.stock]} · {QUEUE_LABEL[r.queue]}
                    </Txt>
                  </View>
                  <Txt variant="caption" tone="soft">
                    {formatAgo(r.createdAt, now)}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Followed stores */}
      {favoriteStores.length > 0 ? (
        <View style={styles.section}>
          <Txt variant="heading">Tes boutiques</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favScroll} contentContainerStyle={styles.favRow}>
            {favoriteStores.map((s) => {
              const sells = s.franchises.includes(franchise.id);
              const report = sells ? currentReport(s.id, franchise.id, now) : null;
              const tone = stockTone(theme, report?.stock);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => openStore(s.id)}
                  style={({ pressed }) => [styles.favChip, { backgroundColor: theme.paperRaised }, pressed && { opacity: 0.7 }]}>
                  <View style={[styles.reportDot, { backgroundColor: tone.solid }]} />
                  <View>
                    <Txt variant="bodyStrong" size={14.5}>
                      {s.name}
                    </Txt>
                    <Txt variant="caption" style={{ color: tone.ink }}>
                      {!sells ? `Pas de ${franchise.name}` : report ? STOCK_LABEL[report.stock] : 'Pas d’info'}
                    </Txt>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <Txt variant="caption" tone="faint" style={styles.signature}>
        RadarGeek · fait par des fans, pour les fans
      </Txt>
      </View>
    </ScrollView>
  );
}

function CountPill({ label, value, stock }: { label: string; value: number; stock: 'beaucoup' | 'peu' | 'epuise' }) {
  const theme = useTheme();
  const tone = stockTone(theme, stock);
  return (
    <View style={[styles.pill, { backgroundColor: theme.paperRaised }]}>
      <View style={[styles.pillDot, { backgroundColor: tone.solid }]} />
      <Txt variant="caption" size={12.5}>
        {label}
      </Txt>
      <Txt variant="caption" size={12.5} style={{ color: tone.ink }}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 18, marginTop: 4 },
  flex: { flex: 1 },
  banner: {
    paddingHorizontal: 20,
    paddingBottom: 92,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 26,
  },
  overscroll: { position: 'absolute', left: 0, right: 0, top: -800, height: 800 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 12, height: 17, borderRadius: 3, transform: [{ rotate: '-8deg' }] },
  city: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(243,239,230,0.12)',
  },
  welcome: { gap: 4 },
  cardsOverlap: { marginTop: -84 },
  radar: { borderRadius: 24, padding: 18, gap: 14 },
  radarHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  radarBody: { gap: 10 },
  bigLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  mapButton: {
    height: 50,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  release: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: Radius.card, padding: 12 },
  dateBlock: { width: 48, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  countdown: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  section: { gap: 10 },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: Radius.card, padding: 16 },
  emptyIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  group: { borderRadius: Radius.card, paddingHorizontal: 14 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  reportDot: { width: 10, height: 10, borderRadius: 5 },
  favScroll: { marginHorizontal: -16 },
  favRow: { paddingHorizontal: 16, gap: 8 },
  favChip: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  signature: { textAlign: 'center', marginTop: 10 },
});
