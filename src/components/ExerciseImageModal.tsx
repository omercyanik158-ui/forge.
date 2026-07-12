import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { repairText } from "@/services/textUtils";
import { createDynamicStyles, radius, spacing, typography, useAppTheme } from "@/theme";

type ExerciseImageModalProps = {
  visible: boolean;
  title: string;
  imageUrls: string[];
  onClose: () => void;
};

export function ExerciseImageModal({
  visible,
  title,
  imageUrls,
  onClose,
}: ExerciseImageModalProps) {
  const { colors } = useAppTheme();
  const usableImages = imageUrls.filter(Boolean);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={2}>
              {repairText(title)}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onClose}
              activeOpacity={0.8}
              style={[styles.closeButton, { backgroundColor: colors.surfaceContainerLow }]}
            >
              <Ionicons name="close" size={20} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageRail}
          >
            {usableImages.length > 0 ? (
              usableImages.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.imagePage}>
                  <Image
                    source={{ uri }}
                    style={styles.image}
                    contentFit="contain"
                    cachePolicy="disk"
                    transition={160}
                  />
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.surfaceContainerLow }]}>
                <Ionicons name="image-outline" size={28} color={colors.outline} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                  Görsel bulunamadı
                </Text>
              </View>
            )}
          </ScrollView>

          {usableImages.length > 1 ? (
            <View style={styles.dots}>
              {usableImages.map((uri, index) => (
                <View
                  key={`${uri}-dot-${index}`}
                  style={[styles.dot, { backgroundColor: colors.outlineVariant }]}
                />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = createDynamicStyles(() => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.56)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.cardPadding,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { ...typography.sectionTitle, flex: 1 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  imageRail: {
    alignItems: "center",
  },
  imagePage: {
    width: 320,
    maxWidth: "100%",
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.xl,
  },
  emptyState: {
    width: 320,
    maxWidth: "100%",
    height: 220,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: { ...typography.bodySm },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
}));
