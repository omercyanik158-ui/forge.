import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import { safeGoBack } from "@/services/navigation";
import {
  createDynamicStyles,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  const targetDate = typeof date === "string" ? date : undefined;

  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (locked || !data) return;
    setLocked(true);
    router.replace({
      pathname: "/add-meal",
      params: targetDate
        ? { date: targetDate, barcode: data }
        : { barcode: data },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t("migrated.barcode_scanner_001")} />

      {!permission ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : permission.granted ? (
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
            }}
            onBarcodeScanned={locked ? undefined : handleScan}
          />
          <View pointerEvents="none" style={styles.overlay}>
            <View style={[styles.frame, { borderColor: colors.primary }]} />
            <Text style={[styles.overlayTitle, { color: colors.white }]}>
              {t("migrated.barcode_scanner_002")}
            </Text>
            <Text style={[styles.overlayBody, { color: colors.whiteAlpha60 }]}>
              {t("migrated.barcode_scanner_003")}
            </Text>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("migrated.barcode_scanner_004")}
              onPress={() => safeGoBack(router)}
              activeOpacity={0.84}
              style={[styles.footerButton, { backgroundColor: colors.surface }]}
            >
              <Text
                style={[styles.footerButtonText, { color: colors.onSurface }]}
              >
                {t("migrated.barcode_scanner_004")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("migrated.barcode_scanner_005")}
              onPress={() => setLocked(false)}
              activeOpacity={0.84}
              style={[styles.footerButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons
                name="scan-outline"
                size={18}
                color={colors.onPrimary}
              />
              <Text
                style={[styles.footerButtonText, { color: colors.onPrimary }]}
              >
                {t("migrated.barcode_scanner_005")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.permissionState}>
          <View
            style={[
              styles.permissionIcon,
              { backgroundColor: `${colors.primary}14` },
            ]}
          >
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.permissionTitle, { color: colors.onSurface }]}>
            {t("migrated.barcode_scanner_006")}
          </Text>
          <Text
            style={[styles.permissionBody, { color: colors.onSurfaceVariant }]}
          >
            {t("migrated.barcode_scanner_007")}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.barcode_scanner_008")}
            onPress={() => void requestPermission()}
            activeOpacity={0.84}
            style={[
              styles.permissionButton,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[styles.footerButtonText, { color: colors.onPrimary }]}
            >
              {t("migrated.barcode_scanner_008")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  cameraWrap: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: "rgba(7, 12, 24, 0.3)",
  },
  frame: {
    width: "78%",
    maxWidth: 320,
    aspectRatio: 1.7,
    borderRadius: radius["3xl"],
    borderWidth: 3,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  overlayTitle: { ...typography.screenTitle, textAlign: "center" },
  overlayBody: { ...typography.bodySm, textAlign: "center", maxWidth: 320 },
  footer: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.section,
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    ...shadowStyle("sm"),
  },
  footerButtonText: { ...typography.buttonLg },
  permissionState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.smPlus,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  permissionTitle: { ...typography.sectionTitle, textAlign: "center" },
  permissionBody: { ...typography.bodyMd, textAlign: "center", maxWidth: 320 },
  permissionButton: {
    minHeight: 50,
    paddingHorizontal: spacing.mdPlus,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    ...shadowStyle("sm"),
  },
}));
