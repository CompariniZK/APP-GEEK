import { Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, type Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'hero' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'small' | 'caption';
type Tone =
  | 'ink'
  | 'soft'
  | 'faint'
  | 'signal'
  | 'onSignal'
  | 'good'
  | 'goodInk'
  | 'warn'
  | 'warnInk'
  | 'out'
  | 'outInk';

const TONE: Record<Tone, keyof Palette> = {
  ink: 'ink',
  soft: 'inkSoft',
  faint: 'inkFaint',
  signal: 'signal',
  onSignal: 'onSignal',
  good: 'good',
  goodInk: 'goodInk',
  warn: 'warn',
  warnInk: 'warnInk',
  out: 'out',
  outInk: 'outInk',
};

const VARIANT: Record<Variant, TextStyle> = {
  hero: { fontFamily: Fonts.bold, fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  title: { fontFamily: Fonts.bold, fontSize: 21, lineHeight: 26, letterSpacing: -0.3 },
  heading: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 21 },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: Fonts.medium, fontSize: 15, lineHeight: 20 },
  small: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 16 },
};

export type TxtProps = TextProps & { variant?: Variant; tone?: Tone; size?: number };

export function Txt({ variant = 'body', tone = 'ink', size, style, ...rest }: TxtProps) {
  const theme = useTheme();
  const sizeStyle: TextStyle | undefined = size ? { fontSize: size, lineHeight: Math.round(size * 1.22) } : undefined;
  return (
    <Text
      style={[VARIANT[variant], { color: theme[TONE[tone]], fontVariant: ['tabular-nums'] }, sizeStyle, style]}
      {...rest}
    />
  );
}
