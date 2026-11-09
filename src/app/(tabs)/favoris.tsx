import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { OpenBadge } from '@/components/open-badge';
import { ScreenTitle } from '@/components/screen-title';
import { SignalBars, stockTone } from '@/components/situation';
import { StorePin } from '@/components/store-pin';
import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { STORES } from '@/data/stores';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { formatAgo, STOCK_LABEL } from '@/lib/format';
import { useCommunity } from '@/state/community';
import { useFranchise } from '@/state/franchise';

export default function FavoritesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { favorites, currentReport } = useCommunity();
  const { franchise } = useFranchise();
  const stores = STORES.filter((s) => favorites.includes(s.id));

  return (
    <ScrollView
      style={{ backgroundColor: theme.paper }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        Platform.OS === 'android' && { paddingTop: insets.top + 16, paddingBottom: 120 },
      ]}>
      <ScreenTitle
        title="Favoris"
        subtitle={
          stores.length === 0
            ? 'Les magasins que tu suis'
            : `${stores.length} magasin${stores.length > 1 ? 's' : ''} suivi${stores.length > 1 ? 's' : ''} · cartes ${franchise.name}`
        }
      />

      {stores.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.paperRaised }]}>
          <View style={styles.emptyPins}>
            <StorePin selected={false} tilt={-8} />
            <StorePin selected={false} tilt={6} stock="beaucoup" />
            <StorePin selected={false} tilt={-3} stock="peu" />
          </View>
          <Txt variant="title">Aucun favori pour l’instant</Txt>
          <Txt variant="body" tone="soft">
            Ouvre un magasin sur la carte, tire le panneau vers le haut et touche « Suivre ».
          </Txt>
          <Button label="Voir la carte" kind="soft" onPress={() => router.navigate('/carte')} style={styles.emptyButton} />
        </View>
      ) : (
        <View style={styles.list}>
          {stores.map((store) => {
            const sells = store.franchises.includes(franchise.id);
            const report = sells ? currentReport(store.id, franchise.id, now) : null;
            const tone = stockTone(theme, report?.stock);
            return (
              <Pressable
                key={store.id}
                onPress={() => router.push({ pathname: '/store/[id]', params: { id: store.id } })}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: theme.paperRaised },
                  pressed && { opacity: 0.75 },
                ]}>
                <View style={styles.rowBody}>
                  <Txt variant="title" size={19} numberOfLines={1}>
                    {store.name}
                  </Txt>
                  <OpenBadge hours={store.hours} now={now} />
                  <View style={[styles.status, { backgroundColor: tone.tint }]}>
                    {report ? <SignalBars stock={report.stock} color={tone.solid} /> : null}
                    <Txt variant="caption" size={13} style={{ color: tone.ink }}>
                      {!sells
                        ? `Pas de cartes ${franchise.name} ici`
                        : report
                          ? `${STOCK_LABEL[report.stock]} · ${formatAgo(report.createdAt, now)}`
                          : 'Pas d’info récente'}
                    </Txt>
                  </View>
                </View>
                <Icon name={{ ios: 'chevron.right', android: 'chevron_right' }} size={14} color={theme.inkFaint} />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  empty: { borderRadius: Radius.card, padding: 20, gap: 10 },
  emptyPins: { flexDirection: 'row', marginLeft: -10 },
  emptyButton: { alignSelf: 'flex-start', marginTop: 6 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.card,
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 16,
  },
  rowBody: { flex: 1, gap: 8 },
  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
