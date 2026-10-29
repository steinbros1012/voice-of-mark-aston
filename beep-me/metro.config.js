// Sentry's wrapper around Expo's default Metro config. It assigns Debug IDs to
// bundles and source maps so stack traces symbolicate in Sentry.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

module.exports = config;
