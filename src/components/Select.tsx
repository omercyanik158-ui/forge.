import { TouchableOpacity, View, Text, Modal, FlatList, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  radius,
  spacing,
  typography,
  useAppTheme,
  shadowStyle,
} from "@/theme";
import { useState } from "react";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const styles = {
  container: { 
    gap: spacing.xs, 
    flexDirection: "column" as const,
  } as ViewStyle,
  selectButton: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  } as ViewStyle,
  selectText: {
    ...typography.bodyMd,
    flex: 1,
  },
  error: {
    ...typography.labelXs,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end" as const,
  } as ViewStyle,
  modalContent: {
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    padding: spacing.lg,
  } as ViewStyle,
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },
  optionText: {
    ...typography.bodyMd,
  },
};

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  error,
}: SelectProps) {
  const { colors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        style={[
          styles.selectButton,
          {
            borderColor: error ? colors.error : colors.outlineVariant,
            backgroundColor: colors.surface,
          },
          shadowStyle("md"),
          disabled && { opacity: 0.5 },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            { color: selectedOption ? colors.onSurface : colors.onSurfaceVariant },
          ]}
        >
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          style={styles.backdrop}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background, maxHeight: 300 },
              shadowStyle("floating"),
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: item.value === value ? colors.primaryContainer : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: item.value === value ? colors.primary : colors.onSurface },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
