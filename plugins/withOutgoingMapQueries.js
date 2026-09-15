const { withAndroidManifest } = require('expo/config-plugins');

const PACKAGES = ['com.google.android.apps.maps', 'com.waze'];
const SCHEMES = ['https', 'geo', 'google.navigation', 'waze', 'comgooglemaps'];

function intentForScheme(scheme) {
  return {
    action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
    data: [{ $: { 'android:scheme': scheme } }],
  };
}

function withOutgoingMapQueries(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    const existing = manifest.queries ?? [];
    const block = existing[0] ?? {};
    const packages = [...(block.package ?? [])];
    const intents = [...(block.intent ?? [])];

    for (const name of PACKAGES) {
      if (!packages.some((item) => item.$?.['android:name'] === name)) {
        packages.push({ $: { 'android:name': name } });
      }
    }
    for (const scheme of SCHEMES) {
      if (
        !intents.some((item) => item.data?.[0]?.$?.['android:scheme'] === scheme)
      ) {
        intents.push(intentForScheme(scheme));
      }
    }

    manifest.queries = [{ ...block, package: packages, intent: intents }];
    return mod;
  });
}

module.exports = withOutgoingMapQueries;
