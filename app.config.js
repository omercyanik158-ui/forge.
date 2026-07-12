const GOOGLE_TEST_IOS_APP_ID =
  'ca-app-pub-3940256099942544~1458002511';

const GOOGLE_TEST_ANDROID_APP_ID =
  'ca-app-pub-3940256099942544~3347511713';

function configureGoogleMobileAdsPlugin(plugins = []) {
  // Önceden eklenmiş AdMob plugin kayıtlarını temizle.
  const filteredPlugins = plugins.filter((plugin) => {
    if (typeof plugin === 'string') {
      return plugin !== 'react-native-google-mobile-ads';
    }

    if (Array.isArray(plugin)) {
      return plugin[0] !== 'react-native-google-mobile-ads';
    }

    return true;
  });

  const testMode =
    process.env.EXPO_PUBLIC_ADMOB_TEST_MODE === 'true';

  const realIosAppId =
    process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID;

  const realAndroidAppId =
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID;

  /*
   * Gerçek App ID tanımlı değilse otomatik olarak Google test App ID kullanılır.
   * Böylece native SDK, App ID eksikliği nedeniyle açılışta çökmez.
   */
  const iosAppId =
    testMode || !realIosAppId
      ? GOOGLE_TEST_IOS_APP_ID
      : realIosAppId;

  const androidAppId =
    testMode || !realAndroidAppId
      ? GOOGLE_TEST_ANDROID_APP_ID
      : realAndroidAppId;

  filteredPlugins.push([
    'react-native-google-mobile-ads',
    {
      iosAppId,
      androidAppId,
      delayAppMeasurementInit: true,
      userTrackingUsageDescription:
        'FORGE uses this identifier only to load rewarded ads after AI analysis limits.',
    },
  ]);

  return filteredPlugins;
}

module.exports = ({ config }) => ({
  ...config,
  plugins: configureGoogleMobileAdsPlugin(config.plugins || []),
});