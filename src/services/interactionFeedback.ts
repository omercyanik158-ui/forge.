import * as Haptics from 'expo-haptics';

export function selectionFeedback(): void {
  if (process.env.EXPO_OS !== 'ios') return;
  void Haptics.selectionAsync();
}

export function successFeedback(): void {
  if (process.env.EXPO_OS !== 'ios') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
