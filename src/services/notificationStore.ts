import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { NotificationContentInput } from 'expo-notifications';

import { loadCoachPreferences } from './coachPreferences';
import { loadMeals } from './mealStore';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';
import { loadWorkoutLogs } from './workoutStore';

const CHANNEL_ID = 'forge-reminders';

type NotificationsModule = typeof import('expo-notifications');

export type ReminderKey = 'meal' | 'water' | 'workout';
export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

export type ReminderPreference = {
  enabled: boolean;
  hour: number;
  minute: number;
  identifier?: string;
  manualTimeSet?: boolean;
};

export type NotificationPreferences = Record<ReminderKey, ReminderPreference>;

const DEFAULTS: NotificationPreferences = {
  meal: { enabled: false, hour: 9, minute: 0 },
  water: { enabled: false, hour: 14, minute: 30 },
  workout: { enabled: false, hour: 19, minute: 0 },
};

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let notificationHandlerConfigured = false;
let syncPromise: Promise<NotificationPreferences> | null = null;

/**
 * Android SDK 53+ üzerinde Expo Go, expo-notifications'ın uzaktan bildirim
 * tarafını desteklemez. Paket kök seviyede import edildiğinde Expo Go daha
 * uygulama açılırken hata loglayabildiği için modülü yalnızca gerçek/dev
 * build içinde dinamik olarak yüklüyoruz.
 */
function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web' || isExpoGo()) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications')
      .then((module) => {
        if (!notificationHandlerConfigured) {
          module.setNotificationHandler({
            handleNotification: async () => ({
              shouldPlaySound: true,
              shouldSetBadge: false,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
          notificationHandlerConfigured = true;
        }

        return module;
      })
      .catch((error: unknown) => {
        console.warn('[notifications] Bildirim modülü yüklenemedi.', error);
        notificationsModulePromise = null;
        return null;
      });
  }

  return notificationsModulePromise;
}

function isReminderPreference(value: unknown): value is ReminderPreference {
  if (!value || typeof value !== 'object') return false;

  const reminder = value as ReminderPreference;

  return (
    typeof reminder.enabled === 'boolean' &&
    Number.isInteger(reminder.hour) &&
    reminder.hour >= 0 &&
    reminder.hour <= 23 &&
    Number.isInteger(reminder.minute) &&
    reminder.minute >= 0 &&
    reminder.minute <= 59 &&
    (reminder.identifier === undefined || typeof reminder.identifier === 'string') &&
    (reminder.manualTimeSet === undefined || typeof reminder.manualTimeSet === 'boolean')
  );
}

function isNotificationPreferences(value: unknown): value is NotificationPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const preferences = value as Partial<NotificationPreferences>;

  return (['meal', 'water', 'workout'] as ReminderKey[]).every((key) =>
    isReminderPreference(preferences[key]),
  );
}

function clampReminderTime(hour: number, minute: number): { hour: number; minute: number } {
  return {
    hour: Math.max(0, Math.min(23, Math.trunc(hour))),
    minute: Math.max(0, Math.min(59, Math.trunc(minute))),
  };
}

function readPermissionFlags(value: unknown): {
  granted: boolean;
  canAskAgain: boolean;
} {
  if (!value || typeof value !== 'object') {
    return { granted: false, canAskAgain: true };
  }

  const record = value as Record<string, unknown>;

  return {
    granted: record.granted === true,
    canAskAgain: record.canAskAgain !== false,
  };
}

export function isNotificationRuntimeAvailable(): boolean {
  return Platform.OS !== 'web' && !isExpoGo();
}

export async function prepareNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'FORGE Hatırlatmaları',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  const loaded = await loadStoredValue<NotificationPreferences>({
    key: STORAGE_KEYS.notifications,
    fallback: DEFAULTS,
    validate: isNotificationPreferences,
  });

  return {
    meal: { ...DEFAULTS.meal, ...loaded.meal },
    water: { ...DEFAULTS.water, ...loaded.water },
    workout: { ...DEFAULTS.workout, ...loaded.workout },
  };
}

async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<void> {
  await saveStoredValue(STORAGE_KEYS.notifications, preferences);
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return 'undetermined';

  await prepareNotificationChannel();
  const current = await Notifications.getPermissionsAsync();
  const permission = readPermissionFlags(current);

  if (permission.granted) return 'granted';
  if (!permission.canAskAgain) return 'denied';

  return 'undetermined';
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  await prepareNotificationChannel();

  const current = await Notifications.getPermissionsAsync();
  let { granted } = readPermissionFlags(current);

  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = readPermissionFlags(requested).granted;
  }

  return granted;
}

async function cancelReminderIdentifier(identifier?: string): Promise<void> {
  if (!identifier) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Bildirim daha önce silinmiş olabilir. Bir sonraki senkronizasyon
    // kayıtlı tercihleri yeniden eşleştirir.
  }
}

async function scheduleReminder(
  key: ReminderKey,
  preferences: NotificationPreferences,
): Promise<string | undefined> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return undefined;

  const reminder = preferences[key];

  return Notifications.scheduleNotificationAsync({
    content: buildReminderContent(key),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  });
}

async function performReminderScheduleSync(): Promise<NotificationPreferences> {
  const preferences = await loadNotificationPreferences();
  const Notifications = await getNotificationsModule();

  // Expo Go veya web içinde tercihleri koru; native bildirim API'sini çağırma.
  if (!Notifications) {
    return preferences;
  }

  await prepareNotificationChannel();

  const permission = await getNotificationPermissionState();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((item) => item.identifier));

  const next: NotificationPreferences = {
    meal: { ...preferences.meal },
    water: { ...preferences.water },
    workout: { ...preferences.workout },
  };

  const coachPreferences = await loadCoachPreferences();

  if (coachPreferences.adaptiveReminders) {
    const [meals, workouts] = await Promise.all([loadMeals(), loadWorkoutLogs()]);

    const mealHours = meals
      .slice(0, 20)
      .map((item) => new Date(item.createdAt).getHours())
      .filter((hour) => Number.isFinite(hour));

    const workoutHours = workouts
      .slice(0, 12)
      .map((item) => new Date(item.completedAt).getHours())
      .filter((hour) => Number.isFinite(hour));

    const suggested = {
      meal: averageHour(mealHours, next.meal.hour),
      workout: averageHour(workoutHours, next.workout.hour),
    };

    for (const key of ['meal', 'workout'] as const) {
      if (next[key].manualTimeSet) continue;

      const hourChanged = next[key].hour !== suggested[key];

      if (hourChanged && next[key].identifier) {
        await cancelReminderIdentifier(next[key].identifier);
      }

      next[key] = {
        ...next[key],
        hour: suggested[key],
        minute: 0,
        identifier: hourChanged ? undefined : next[key].identifier,
      };
    }
  }

  for (const key of Object.keys(next) as ReminderKey[]) {
    const reminder = next[key];

    if (!reminder.enabled) {
      if (reminder.identifier) {
        await cancelReminderIdentifier(reminder.identifier);
        next[key].identifier = undefined;
      }
      continue;
    }

    if (permission !== 'granted') {
      if (reminder.identifier) {
        await cancelReminderIdentifier(reminder.identifier);
      }

      next[key] = {
        ...reminder,
        identifier: undefined,
      };
      continue;
    }

    if (!reminder.identifier || !scheduledIds.has(reminder.identifier)) {
      next[key].identifier = await scheduleReminder(key, next);
    }
  }

  await saveNotificationPreferences(next);
  return next;
}

export async function syncReminderSchedules(): Promise<NotificationPreferences> {
  // Aynı anda birden fazla boot/screen çağrısı gelirse çift bildirim planlanmasını önler.
  if (!syncPromise) {
    syncPromise = performReminderScheduleSync().finally(() => {
      syncPromise = null;
    });
  }

  return syncPromise;
}

function averageHour(hours: number[], fallback: number): number {
  if (hours.length < 3) return fallback;

  const average = Math.round(
    hours.reduce((sum, hour) => sum + hour, 0) / hours.length,
  );

  return Math.max(6, Math.min(22, average));
}

export async function setReminderEnabled(
  key: ReminderKey,
  enabled: boolean,
): Promise<NotificationPreferences> {
  const preferences = await loadNotificationPreferences();

  const next: NotificationPreferences = {
    ...preferences,
    [key]: {
      ...preferences[key],
      enabled,
      identifier: undefined,
    },
  };

  await cancelReminderIdentifier(preferences[key].identifier);

  if (enabled) {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      next[key].enabled = false;
      await saveNotificationPreferences(next);
      return next;
    }

    await prepareNotificationChannel();
    next[key].identifier = await scheduleReminder(key, next);
  }

  await saveNotificationPreferences(next);
  return next;
}

export async function setReminderTime(
  key: ReminderKey,
  hour: number,
  minute: number,
): Promise<NotificationPreferences> {
  const preferences = await loadNotificationPreferences();
  const normalizedTime = clampReminderTime(hour, minute);

  const next: NotificationPreferences = {
    ...preferences,
    [key]: {
      ...preferences[key],
      ...normalizedTime,
      manualTimeSet: true,
    },
  };

  await saveNotificationPreferences(next);

  if (next[key].enabled) {
    return setReminderEnabled(key, true);
  }

  return next;
}

export function countEnabledReminders(preferences: NotificationPreferences): number {
  return (Object.keys(preferences) as ReminderKey[]).filter(
    (key) => preferences[key].enabled,
  ).length;
}

function buildReminderContent(key: ReminderKey): NotificationContentInput {
  const contentMap: Record<ReminderKey, NotificationContentInput> = {
    meal: {
      title: 'Beslenme ritmini koru',
      body: 'Bugünün öğün kaydını ekleyip kalori özetini canlı tut.',
      data: { url: '/nutrition' },
    },
    water: {
      title: 'Su molası zamanı',
      body: 'Kısa bir su eklemesiyle günlük hedefini tamamlamaya yaklaş.',
      data: { url: '/nutrition' },
    },
    workout: {
      title: 'Antrenman zamanı',
      body: 'Planını aç ve bugünkü seansını tamamla.',
      data: { url: '/fitness' },
    },
  };

  return contentMap[key];
}

export async function clearNotificationPreferences(): Promise<void> {
  const Notifications = await getNotificationsModule();

  if (Notifications) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error: unknown) {
      console.warn('[notifications] Planlanmış bildirimler temizlenemedi.', error);
    }
  }

  await removeStoredValue(STORAGE_KEYS.notifications);
}
