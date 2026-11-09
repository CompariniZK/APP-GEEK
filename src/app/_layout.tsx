// Import each weight from its own subpath so only these 4 font files are bundled.
import { Rubik_400Regular } from '@expo-google-fonts/rubik/400Regular';
import { Rubik_500Medium } from '@expo-google-fonts/rubik/500Medium';
import { Rubik_600SemiBold } from '@expo-google-fonts/rubik/600SemiBold';
import { Rubik_700Bold } from '@expo-google-fonts/rubik/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

import { Radius } from '@/constants/theme';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { CommunityProvider } from '@/state/community';
import { FranchiseProvider } from '@/state/franchise';
import { SelectionProvider } from '@/state/selection';

SplashScreen.preventAutoHideAsync();

/** Height of the store sheet's first (compact) step, in px: game, name, status, one line of facts, button. */
const COMPACT_SHEET_PX = 370;

export default function RootLayout() {
  const theme = useTheme();
  const dark = useIsDark();
  const { height } = useWindowDimensions();
  const [fontsLoaded, fontError] = useFonts({ Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold });

  const ready = fontsLoaded || !!fontError;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.signal,
      background: theme.paper,
      card: theme.paper,
      text: theme.ink,
      border: theme.rule,
    },
  };
  const compactDetent = Math.min(0.62, Math.max(0.34, COMPACT_SHEET_PX / height));

  return (
    <ThemeProvider value={navTheme}>
      <CommunityProvider>
        <FranchiseProvider>
        <SelectionProvider>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.paper } }}>
            <Stack.Screen name="(tabs)" />
            {/* Native iOS sheet, like Apple Maps: compact step first, pull up for everything.
                The map stays usable behind the compact step. */}
            <Stack.Screen
              name="store/[id]"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [compactDetent, 0.94],
                sheetInitialDetentIndex: 0,
                sheetLargestUndimmedDetentIndex: 0,
                sheetGrabberVisible: true,
                sheetCornerRadius: Radius.sheet,
                sheetExpandsWhenScrolledToEdge: true,
                contentStyle: { backgroundColor: theme.paperRaised },
              }}
            />
            <Stack.Screen name="report/[id]" options={{ presentation: 'modal' }} />
          </Stack>
        </SelectionProvider>
        </FranchiseProvider>
      </CommunityProvider>
    </ThemeProvider>
  );
}
