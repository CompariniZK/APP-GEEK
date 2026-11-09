/**
 * Visual identity: warm paper, dark ink, one signal red, soft tinted blocks.
 * Status colours (good / warn / out) are reserved for stock levels and each has
 * a solid colour, a light tint for backgrounds and a dark "ink" for text on that tint.
 */
export const Colors = {
  light: {
    paper: '#F3EFE6',
    paperRaised: '#FBF9F4',
    card: '#F1EDE4',
    chip: '#EFEBE2',
    ink: '#16140F',
    inkSoft: '#5E594F',
    inkFaint: '#A39D90',
    rule: '#E6E0D3',
    signal: '#E1361C',
    signalTint: '#F7E0D9',
    onSignal: '#FFFFFF',
    good: '#1E7A4C',
    goodTint: '#E3EEE6',
    goodInk: '#17603C',
    warn: '#B36F00',
    warnTint: '#F5E9D3',
    warnInk: '#7F4F00',
    out: '#8B867B',
    outTint: '#ECE9E3',
    outInk: '#55514A',
  },
  dark: {
    paper: '#13120F',
    paperRaised: '#1E1C18',
    card: '#26241F',
    chip: '#2C2A25',
    ink: '#F2EEE5',
    inkSoft: '#ABA594',
    inkFaint: '#6D685D',
    rule: '#34302A',
    signal: '#FF4A2E',
    signalTint: '#3B1D16',
    onSignal: '#FFFFFF',
    good: '#41B47C',
    goodTint: '#18301F',
    goodInk: '#86D8AC',
    warn: '#F0A532',
    warnTint: '#3A2C12',
    warnInk: '#F6C67E',
    out: '#8D877B',
    outTint: '#2A2824',
    outInk: '#C9C3B6',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

/** Rubik, one family per weight (React Native picks fonts by family name, not by fontWeight). */
export const Fonts = {
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium',
  semibold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
} as const;

export const Radius = {
  pill: 999,
  tile: 18,
  card: 20,
  sheet: 28,
} as const;
