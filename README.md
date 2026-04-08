# Social Connect - Setup Guide

## 1. Project Initialization
If you haven't initialized your project yet, create a new Expo app, then copy the generated `App.tsx` and `src` folder into it:
```bash
npx create-expo-app social-connect --template expo-template-blank-typescript
```

## 2. Required NPM Packages
Navigate into your project folder and install the dependencies:
```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
# State Management
npm install @reduxjs/toolkit react-redux
# Firebase
npm install firebase
# Wait! Since it's expo, @expo/vector-icons is already included by default.
```

## 3. Firebase Setup Steps
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and create a project named "Social Connect".
3. Open your project dashboard, click the **Web** icon (`</>`) to register a web app.
4. Copy the `firebaseConfig` object provided.
5. Open `src/firebase.ts` in this project and replace the placeholder `firebaseConfig` with your actual credentials.
6. **Authentication**: Go to Authentication -> Sign-in method -> Enable "Email/Password".
7. **Firestore Database**: Go to Firestore Database -> Create database -> Start in "Test Mode" (this will allow open reads/writes).

## 4. Run the App
```bash
npx expo start
```
- Press `i` to open in the iOS simulator.
- Press `a` to open in the Android emulator.
- Or scan the QR code with the Expo Go app on your physical device.
