import {
  createDynamicStyles,
  layout,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { useAppLocalization } from "@/providers/localization-context";

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
};

function TabIcon({ name, label, focused }: TabIconProps) {
  const { colors } = useAppTheme();

  return (
    <View accessible={false} style={styles.tabVisual}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? colors.primary : colors.onSurfaceVariant}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? colors.primary : colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.overlay,
          borderTopColor: colors.overlayBorder,
          borderTopWidth: 1,
          height: 66,
          paddingTop: 6,
          paddingBottom: 6,
          paddingHorizontal: spacing.sm,
          ...shadowStyle("floating"),
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarItemStyle: {
          height: "100%",
          paddingVertical: 0,
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t({ tr: "Ana Sayfa", en: "Home" }),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="home"
              label={t({ tr: "Ana Sayfa", en: "Home" })}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: t({ tr: "Antrenman", en: "Training" }),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="fitness"
              label={t({ tr: "Antrenman", en: "Training" })}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t({ tr: "Beslenme", en: "Nutrition" }),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="nutrition"
              label={t({ tr: "Beslenme", en: "Nutrition" })}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI Hub",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="sparkles" label="AI Hub" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t({ tr: "Profil", en: "Profile" }),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="person"
              label={t({ tr: "Profil", en: "Profile" })}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = createDynamicStyles(() => ({
  tabVisual: {
    minWidth: 60,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    maxWidth: layout.maxContentWidth / 5,
  },
  tabLabel: {
    ...typography.labelXs,
  },
}));
