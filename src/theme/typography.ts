import { Platform, type TextStyle } from "react-native";

const roundedMedium =
  Platform.OS === "ios"
    ? { fontFamily: "SF Pro Rounded", fontWeight: "500" as const }
    : { fontFamily: "Montserrat_500Medium" };
const roundedSemiBold =
  Platform.OS === "ios"
    ? { fontFamily: "SF Pro Rounded", fontWeight: "600" as const }
    : { fontFamily: "Montserrat_600SemiBold" };
const roundedBold =
  Platform.OS === "ios"
    ? { fontFamily: "SF Pro Rounded", fontWeight: "700" as const }
    : { fontFamily: "Montserrat_700Bold" };
const textRegular =
  Platform.OS === "ios"
    ? { fontFamily: "SF Pro Rounded", fontWeight: "400" as const }
    : { fontFamily: "Inter_400Regular" };
const textSemiBold =
  Platform.OS === "ios"
    ? { fontFamily: "SF Pro Rounded", fontWeight: "600" as const }
    : { fontFamily: "Inter_600SemiBold" };

export const typography = {
  displayLg: {
    ...roundedBold,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -0.8,
  },
  displayLgMobile: {
    ...roundedBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  headlineLg: {
    ...roundedBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  headlineLgMobile: {
    ...roundedBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.35,
  },
  headlineMd: {
    ...roundedSemiBold,
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.2,
  },
  screenTitle: {
    ...roundedSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    ...roundedSemiBold,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  cardTitle: {
    ...roundedSemiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.15,
  },
  statsNumber: {
    ...roundedBold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
  },
  numericLg: {
    ...roundedBold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.45,
    fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
  },
  numericMd: {
    ...roundedSemiBold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
  },
  bodyLg: { ...textRegular, fontSize: 16, lineHeight: 23, letterSpacing: 0 },
  bodyMd: { ...textRegular, fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  bodySm: { ...textRegular, fontSize: 13, lineHeight: 19, letterSpacing: 0.04 },
  bodyXs: { ...textRegular, fontSize: 12, lineHeight: 17, letterSpacing: 0.04 },
  labelMd: { ...textSemiBold, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  labelCaps: {
    ...roundedMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  labelXs: {
    ...textSemiBold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.3,
  },
  buttonLg: {
    ...roundedSemiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  buttonSm: {
    ...roundedSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
} satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;
