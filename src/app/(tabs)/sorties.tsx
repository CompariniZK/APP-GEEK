import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FranchiseBadge } from '@/components/franchise-badge';
import { ReleaseCalendar } from '@/components/release-calendar';
import { NextReleaseHero, ReleaseTicket } from '@/components/release-ticket';
import { ScreenTitle } from '@/components/screen-title';
import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { FRANCHISES, getFranchise } from '@/data/franchises';
import { allReleases, nextRelease } from '@/data/upcoming';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { longDate, monthName, sameMonth, startOfMonth } from '@/lib/format';
import type { FranchiseId } from '@/lib/types';
import { useFranchise } from '@/state/franchise';

type Scope = FranchiseId | 'all';

export default function ReleasesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNow(60000);
  const today = useMemo(() => new Date(now), [now]);
  const { franchise } = useFranchise();
  const [scope, setScope] = useState<Scope>(franchise.id);

  // Follow the game chosen on the home screen; "Tout" stays available here.
  useEffect(() => setScope(franchise.id), [franchise.id]);

  const releases = useMemo(() => allReleases(today, scope), [today, scope]);
  const upcoming = useMemo(() => nextRelease(today, scope), [today, scope]);
  const [month, setMonth] = useState(() => startOfMonth(upcoming?.day ?? today));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // A new game opens on the month of its next release.
  useEffect(() => {
    setMonth(startOfMonth(nextRelease(new Date(), scope)?.day ?? new Date()));
    setSelectedDay(null);
  }, [scope]);

  const monthReleases = releases.filter((r) => r.day && sameMonth(r.day, month));
  const dayReleases = selectedDay ? monthReleases.filter((r) => r.day!.getDate() === selectedDay) : [];
  const shown = selectedDay ? dayReleases : monthReleases;
  const undated = releases.filter((r) => !r.day);
  const showGame = scope === 'all';

  const moveMonth = (delta: number) => {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    setSelectedDay(null);
  };

  const scopes: { key: Scope; label: string }[] = [
    { key: 'all', label: 'Tout' },
    ...FRANCHISES.map((f) => ({ key: f.id, label: f.name })),
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.paper }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        Platform.OS === 'android' && { paddingTop: insets.top + 16, paddingBottom: 120 },
      ]}>
      <ScreenTitle title="Sorties" subtitle="Le calendrier de tes jeux de cartes" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scopeScroll} contentContainerStyle={styles.scopeRow}>
        {scopes.map((s) => {
          const active = s.key === scope;
          return (
            <Pressable
              key={s.key}
              onPress={() => setScope(s.key)}
              style={[styles.scopeChip, { backgroundColor: active ? theme.ink : theme.paperRaised }]}>
              {s.key !== 'all' ? <FranchiseBadge franchise={getFranchise(s.key)} size={22} /> : null}
              <Txt variant="caption" size={13} style={{ color: active ? theme.paper : theme.ink }}>
                {s.label}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {upcoming ? <NextReleaseHero release={upcoming} showGame={showGame} /> : null}

      <ReleaseCalendar
        month={month}
        releases={releases}
        today={today}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onPrev={() => moveMonth(-1)}
        onNext={() => moveMonth(1)}
      />

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Txt variant="heading">
            {selectedDay
              ? longDate(new Date(month.getFullYear(), month.getMonth(), selectedDay))
              : `En ${monthName(month)}`}
          </Txt>
          {selectedDay ? (
            <Pressable hitSlop={8} onPress={() => setSelectedDay(null)}>
              <Txt variant="caption" tone="signal">
                Tout le mois
              </Txt>
            </Pressable>
          ) : null}
        </View>

        {shown.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: theme.paperRaised }]}>
            <Txt variant="bodyStrong">Rien de prévu ce mois-ci</Txt>
            {upcoming?.day && !sameMonth(upcoming.day, month) ? (
              <Pressable
                onPress={() => {
                  setMonth(startOfMonth(upcoming.day!));
                  setSelectedDay(upcoming.day!.getDate());
                }}
                style={[styles.jump, { backgroundColor: theme.chip }]}>
                <Txt variant="caption" size={13}>
                  Voir la prochaine sortie
                </Txt>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.list}>
            {shown.map((r) => (
              <ReleaseTicket key={r.id} release={r} showGame={showGame} />
            ))}
          </View>
        )}
      </View>

      {undated.length > 0 ? (
        <View style={styles.section}>
          <Txt variant="heading">Date à confirmer</Txt>
          <View style={styles.list}>
            {undated.map((r) => (
              <ReleaseTicket key={r.id} release={r} showGame={showGame} />
            ))}
          </View>
        </View>
      ) : null}

      <Txt variant="small" size={13} tone="soft" style={styles.footnote}>
        Dates compilées depuis les calendriers de la communauté et les pages des éditeurs. Une date « estimée »
        peut encore bouger : vérifie avant de te déplacer. One Piece, Dragon Ball Super et Digimon sortent en anglais
        en Europe.
      </Txt>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 18 },
  scopeScroll: { flexGrow: 0, marginHorizontal: -16, marginTop: -8 },
  scopeRow: { paddingHorizontal: 16, gap: 8 },
  scopeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingLeft: 7,
    paddingRight: 14,
    borderRadius: Radius.pill,
  },
  section: { gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4 },
  list: { gap: 10 },
  empty: { borderRadius: Radius.tile, padding: 16, gap: 10, alignItems: 'flex-start' },
  jump: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill },
  footnote: { paddingHorizontal: 4 },
});
