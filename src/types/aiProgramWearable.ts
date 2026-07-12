/**
 * Faz 12 — Wearable / Health Integration
 *
 * Apple Health / Health Connect'ten toparlanma sinyalleri (uyku, dinlenme
 * nabzı, HRV, vücut ağırlığı) için soyutlama katmanı. Gerçek native modül
 * (expo-health vb.) eklenene kadar no-op: available=false. Constitution:
 * kullanıcının açık izni olmadan veri toplanmaz; bu katman yalnızca
 * kullanıcı etkinleştirdiyse sinyal sağlar.
 */

export type WearableProviderId = 'apple_health' | 'health_connect' | 'none';

export type WearableRecoverySignal = {
  available: boolean;
  provider: WearableProviderId;
  /** Son gece uyku (saat). */
  sleepHoursLastNight?: number;
  /** Dinlenme nabzı (bpm). */
  restingHeartRate?: number;
  /** Kalp atış hızı değişkenliği (ms). */
  heartRateVariability?: number;
  /** Güncel vücut ağırlığı (kg). */
  bodyWeightKg?: number;
  measuredAt?: string;
};

export type WearablePermissionState = 'granted' | 'denied' | 'not_determined';

export type WearableAdapter = {
  isAvailable(): boolean;
  getPermissionState(): WearablePermissionState;
  requestPermission(): Promise<WearablePermissionState>;
  readRecoverySignal(): Promise<WearableRecoverySignal>;
};
