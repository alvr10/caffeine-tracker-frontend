export default {
  expo: {
    name: "CaffTracker",
    slug: "cafftracker",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    scheme: "cafftracker", // ADD THIS for return URL
    splash: {
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.cafftracker",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#000000",
      },
      package: "com.yourcompany.cafftracker",
    },
  },
};
