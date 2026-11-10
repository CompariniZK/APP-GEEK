import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FranchiseBadge } from '@/components/franchise-badge';
import { Icon } from '@/components/icon';
import { Txt } from '@/components/txt';
import { Radius, type Palette } from '@/constants/theme';
import { getFranchise } from '@/data/franchises';
import { findStore } from '@/data/stores';
import { useTheme } from '@/hooks/use-theme';
import type { PurchaseLimit, QueueLevel, StockLevel } from '@/lib/types';
import { ReportError, useCommunity } from '@/state/community';

const ERROR_TEXT: Record<ReportError['reason'], { title: string; body: string }> = {
  rate_limited: {
    title: 'Déjà signalé !',
    body: 'Tu as signalé ce magasin il y a moins de 5 minutes. Reviens un peu plus tard.',
  },
  auth: { title: 'Connexion impossible', body: 'Le serveur ne répond pas. Réessaie dans un moment.' },
  network: { title: 'Pas de réseau', body: 'Vérifie ta connexion, puis touche à nouveau ta réponse.' },
};

type IconName = React.ComponentProps<typeof Icon>['name'];
type Option = { value: string; label: string; hint?: string; icon?: IconName; tone?: 'good' | 'warn' | 'out' };

const STOCK_OPTIONS: Option[] = [
  { value: 'beaucoup', label: 'Oui, plein', hint: 'Les rayons sont bien remplis', icon: { ios: 'checkmark', android: 'check' }, tone: 'good' },
  { value: 'peu', label: 'Presque plus', hint: 'Quelques boîtes ou boosters', icon: { ios: 'exclamationmark', android: 'priority_high' }, tone: 'warn' },
  { value: 'epuise', label: 'Épuisé', hint: 'Plus rien en rayon', icon: { ios: 'xmark', android: 'close' }, tone: 'out' },
];

const QUEUE_OPTIONS: Option[] = [
  { value: 'aucune', label: 'Personne', hint: 'On entre directement', icon: { ios: 'figure.walk', android: 'directions_walk' } },
  { value: 'petite', label: 'Petite file', hint: 'Moins de 10 personnes', icon: { ios: 'person.2.fill', android: 'group' } },
  { value: 'longue', label: 'Longue file', hint: '10 personnes ou plus', icon: { ios: 'person.3.fill', android: 'groups' } },
];

const LIMIT_OPTIONS: Option[] = [
  { value: '1', label: '1 par client' },
  { value: '2', label: '2 par client' },
  { value: '3+', label: '3 ou plus' },
  { value: 'aucune', label: 'Pas de limite' },
  { value: 'inconnue', label: 'Je ne sais pas' },
];

const QUESTIONS = ['Il reste du stock ?', 'Et la file d’attente ?', 'Une limite par client ?'];

function toneColors(theme: Palette, tone: Option['tone']) {
  if (tone === 'good') return { bg: theme.goodTint, solid: theme.good, ink: theme.goodInk };
  if (tone === 'warn') return { bg: theme.warnTint, solid: theme.warn, ink: theme.warnInk };
  if (tone === 'out') return { bg: theme.outTint, solid: theme.out, ink: theme.outInk };
  return { bg: theme.card, solid: theme.ink, ink: theme.ink };
}

export default function ReportScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id, franchise: franchiseParam } = useLocalSearchParams<{ id: string; franchise?: string }>();
  const store = findStore(id);
  const fr = getFranchise(franchiseParam);
  const { addReport } = useCommunity();

  const [step, setStep] = useState(0);
  const [stock, setStock] = useState<StockLevel | null>(null);
  const [queue, setQueue] = useState<QueueLevel | null>(null);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ReportError['reason'] | null>(null);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.back(), 1400);
    return () => clearTimeout(t);
  }, [done]);

  if (!store) return null;

  if (done) {
    return (
      <View style={[styles.doneScreen, { backgroundColor: theme.signal }]}>
        <View style={styles.doneIcon}>
          <Icon name={{ ios: 'heart.fill', android: 'favorite' }} size={30} color={theme.signal} />
        </View>
        <Txt variant="hero" size={52} tone="onSignal">
          Merci !
        </Txt>
        <Txt variant="body" tone="onSignal" style={styles.doneSub}>
          Tu viens d’aider les fans de {fr.name} de La Roche-sur-Yon.
        </Txt>
      </View>
    );
  }

  const choose = async (value: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (step === 0) {
      setStock(value as StockLevel);
      setStep(1);
    } else if (step === 1) {
      setQueue(value as QueueLevel);
      setStep(2);
    } else if (stock && queue && !sending) {
      setSending(true);
      setError(null);
      try {
        await addReport({ storeId: store.id, franchise: fr.id, stock, queue, limit: value as PurchaseLimit });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setDone(true);
      } catch (e) {
        setError(e instanceof ReportError ? e.reason : 'network');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.paper, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.headRow}>
        <Pressable hitSlop={12} onPress={() => (step === 0 ? router.back() : setStep(step - 1))}>
          <Txt variant="bodyStrong" tone="signal">
            {step === 0 ? 'Annuler' : 'Retour'}
          </Txt>
        </Pressable>
        <Txt variant="caption" tone="soft">
          Étape {step + 1} sur 3
        </Txt>
      </View>
      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? theme.signal : theme.chip }]} />
        ))}
      </View>

      <View style={styles.question}>
        <View style={styles.context}>
          <FranchiseBadge franchise={fr} size={24} />
          <Txt variant="bodyStrong" tone="soft">
            Cartes {fr.name} · {store.name}
          </Txt>
        </View>
        <Txt variant="hero" size={32}>
          {QUESTIONS[step]}
        </Txt>
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.signalTint }]}>
          <Icon name={{ ios: 'exclamationmark.triangle.fill', android: 'warning' }} size={18} color={theme.signal} />
          <View style={styles.errorText}>
            <Txt variant="bodyStrong" tone="signal">
              {ERROR_TEXT[error].title}
            </Txt>
            <Txt variant="small" size={13.5}>
              {ERROR_TEXT[error].body}
            </Txt>
          </View>
        </View>
      ) : null}

      {step < 2 ? (
        <View style={styles.list}>
          {(step === 0 ? STOCK_OPTIONS : QUEUE_OPTIONS).map((opt) => {
            const c = toneColors(theme, opt.tone);
            return (
              <Pressable
                key={opt.value}
                onPress={() => choose(opt.value)}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: c.bg },
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                ]}>
                <View style={[styles.optionIcon, { backgroundColor: opt.tone ? c.solid : theme.paperRaised }]}>
                  {opt.icon ? <Icon name={opt.icon} size={20} color={opt.tone ? '#FFFFFF' : theme.ink} /> : null}
                </View>
                <View style={styles.optionText}>
                  <Txt variant="title" size={20} style={{ color: c.ink }}>
                    {opt.label}
                  </Txt>
                  {opt.hint ? (
                    <Txt variant="small" size={13.5} style={{ color: c.ink, opacity: 0.75 }}>
                      {opt.hint}
                    </Txt>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.grid}>
          {LIMIT_OPTIONS.map((opt, i) => (
            <Pressable
              key={opt.value}
              onPress={() => choose(opt.value)}
              disabled={sending}
              style={({ pressed }) => [
                styles.gridTile,
                { backgroundColor: theme.card },
                i === LIMIT_OPTIONS.length - 1 && styles.gridTileWide,
                (pressed || sending) && { transform: [{ scale: 0.97 }], opacity: 0.6 },
              ]}>
              <Txt variant="title" size={19} tone={opt.value === 'inconnue' ? 'soft' : 'ink'}>
                {opt.label}
              </Txt>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 22, gap: 22 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progress: { flexDirection: 'row', gap: 5, marginTop: -10 },
  progressSeg: { flex: 1, height: 5, borderRadius: 3 },
  question: { gap: 6, marginTop: 6 },
  context: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  list: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.card,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridTile: {
    width: '48.5%',
    height: 84,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTileWide: { width: '100%', height: 64 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: Radius.tile, padding: 14 },
  errorText: { flex: 1, gap: 2 },
  doneScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  doneSub: { textAlign: 'center', opacity: 0.9 },
});
