import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { FranchiseBadge } from '@/components/franchise-badge';
import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { FRANCHISE_ART } from '@/data/franchise-art';
import { getFranchise } from '@/data/franchises';
import type { DatedRelease } from '@/data/upcoming';
import { useTheme } from '@/hooks/use-theme';
import { countdownLabel, longDate, monthShort } from '@/lib/format';

/**
 * A release as a tear-off ticket: a stub in the game's colour with the date,
 * a dashed tear line with two notches, then the details.
 */
export function ReleaseTicket({ release, showGame }: { release: DatedRelease; showGame: boolean }) {
  const theme = useTheme();
  const fr = getFranchise(release.franchise);
  const past = release.days !== null && release.days < 0;
  const soon = release.days !== null && release.days >= 0 && release.days <= 7;

  return (
    <View style={[styles.ticket, { backgroundColor: theme.paperRaised }, past && styles.past]}>
      <View style={[styles.stub, { backgroundColor: fr.color }]}>
        {release.day ? (
          <>
            <Txt variant="hero" size={26} style={{ color: fr.onColor, lineHeight: 28 }}>
              {release.day.getDate()}
            </Txt>
            <Txt variant="caption" size={11.5} style={{ color: fr.onColor }}>
              {monthShort(release.day)}
            </Txt>
          </>
        ) : (
          <Txt variant="hero" size={24} style={{ color: fr.onColor }}>
            ?
          </Txt>
        )}
      </View>

      {/* Tear line with notches cut out of the ticket */}
      <View style={styles.tear}>
        <View style={[styles.notch, styles.notchTop, { backgroundColor: theme.paper }]} />
        <View style={[styles.tearLine, { borderColor: theme.rule }]} />
        <View style={[styles.notch, styles.notchBottom, { backgroundColor: theme.paper }]} />
      </View>

      <View style={styles.body}>
        <Txt variant="bodyStrong" size={15}>
          {release.title}
        </Txt>
        <View style={styles.meta}>
          {showGame ? <FranchiseBadge franchise={fr} size={20} /> : null}
          <Txt variant="caption" tone="soft">
            {release.period ?? release.type}
          </Txt>
          <View
            style={[
              styles.stamp,
              release.confirmed
                ? { backgroundColor: theme.goodTint }
                : { borderWidth: 1, borderStyle: 'dashed', borderColor: theme.inkFaint },
            ]}>
            <Txt variant="caption" size={11} tone={release.confirmed ? 'goodInk' : 'soft'}>
              {release.confirmed ? 'Confirmé' : 'Estimé'}
            </Txt>
          </View>
        </View>
        {release.note ? (
          <Txt variant="small" size={13} tone="soft">
            {release.note}
          </Txt>
        ) : null}
      </View>

      {release.days !== null ? (
        <View style={[styles.countdown, { backgroundColor: soon ? theme.signal : past ? 'transparent' : theme.chip }]}>
          <Txt variant="caption" size={12.5} tone={soon ? 'onSignal' : past ? 'faint' : 'ink'}>
            {countdownLabel(release.days)}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

/** Big coloured card for the next release, with the game's illustration on the right. */
export function NextReleaseHero({ release, showGame }: { release: DatedRelease; showGame: boolean }) {
  const fr = getFranchise(release.franchise);
  const days = release.days ?? 0;
  return (
    <View style={[styles.hero, { backgroundColor: fr.color }]}>
      <View style={styles.heroArt} pointerEvents="none">
        <SvgXml xml={FRANCHISE_ART[fr.id]} width="100%" height="100%" />
      </View>
      <Txt variant="caption" size={13} style={{ color: fr.onColor, opacity: 0.8 }}>
        {showGame ? `Prochaine sortie · ${fr.name}` : 'Prochaine sortie'}
      </Txt>
      <View style={styles.heroCount}>
        <Txt variant="hero" size={days === 0 ? 40 : 52} style={{ color: fr.onColor, lineHeight: 56 }}>
          {days === 0 ? 'Jour J' : `J-${days}`}
        </Txt>
      </View>
      <Txt variant="bodyStrong" size={16} numberOfLines={2} style={[styles.heroTitle, { color: fr.onColor }]}>
        {release.title}
      </Txt>
      {release.day ? (
        <Txt variant="small" size={13.5} style={{ color: fr.onColor, opacity: 0.85 }}>
          {longDate(release.day)}
          {release.confirmed ? '' : ' · date estimée'}
        </Txt>
      ) : null}
    </View>
  );
}

const NOTCH = 14;

const styles = StyleSheet.create({
  ticket: { flexDirection: 'row', alignItems: 'stretch', borderRadius: Radius.tile, overflow: 'hidden' },
  past: { opacity: 0.5 },
  stub: { width: 62, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  tear: { width: 0, alignItems: 'center' },
  tearLine: { flex: 1, borderLeftWidth: 1.5, borderStyle: 'dashed', marginVertical: NOTCH / 2 + 2 },
  notch: { position: 'absolute', width: NOTCH, height: NOTCH, borderRadius: NOTCH / 2, left: -NOTCH / 2 },
  notchTop: { top: -NOTCH / 2 },
  notchBottom: { bottom: -NOTCH / 2 },
  body: { flex: 1, paddingVertical: 13, paddingLeft: 14, paddingRight: 8, gap: 5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  stamp: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  countdown: {
    alignSelf: 'flex-start',
    marginTop: 13,
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  hero: { borderRadius: 24, padding: 18, gap: 2, overflow: 'hidden', minHeight: 176 },
  heroArt: { position: 'absolute', right: -4, top: 4, width: 128, height: 174 },
  heroCount: { marginTop: 2 },
  heroTitle: { maxWidth: '64%', marginTop: 2 },
});
