import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/txt';

/** Large title at the top of the tab screens. */
export function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.wrap}>
      <Txt variant="hero" size={34}>
        {title}
      </Txt>
      <Txt variant="small" tone="soft">
        {subtitle}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, marginBottom: 12 },
});
