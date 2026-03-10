# CLAUDE.md — React Native Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Expo SDK 52+, React Navigation / Expo Router, Zustand, EAS Build, TypeScript

## Project Overview

This configuration governs React Native mobile app projects using Expo as the development platform. The architecture prioritises Expo-managed workflows where possible, dropping to bare workflows only when a native module genuinely requires it. Every deviation from Expo-managed must be justified and documented.

## Project Structure

```
├── app/                              # Expo Router file-based routing
│   ├── (tabs)/                       # Tab navigator group
│   │   ├── _layout.tsx               # Tab bar configuration
│   │   ├── index.tsx                 # Home tab
│   │   ├── search.tsx                # Search tab
│   │   └── profile.tsx               # Profile tab
│   ├── (auth)/                       # Auth flow group
│   │   ├── _layout.tsx               # Auth stack layout
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (modals)/                     # Modal screens
│   │   └── settings.tsx
│   ├── [id].tsx                      # Dynamic routes
│   ├── _layout.tsx                   # Root layout (providers, fonts)
│   └── +not-found.tsx                # 404 screen
├── components/
│   ├── ui/                           # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── forms/                        # Form components
│   ├── lists/                        # FlatList renderers
│   └── navigation/                   # Custom nav components
├── lib/
│   ├── api.ts                        # API client (fetch/axios)
│   ├── auth.ts                       # Auth state and token management
│   ├── storage.ts                    # expo-secure-store wrapper
│   └── notifications.ts             # Push notification setup
├── stores/
│   ├── auth-store.ts                 # Zustand auth store
│   ├── app-store.ts                  # App-level state
│   └── cache-store.ts               # Offline cache
├── hooks/
│   ├── use-auth.ts
│   ├── use-api.ts
│   └── use-notifications.ts
├── constants/
│   ├── colors.ts                     # Theme colours
│   ├── layout.ts                     # Spacing, typography
│   └── config.ts                     # Environment config
├── assets/
│   ├── images/
│   ├── fonts/
│   └── animations/                   # Lottie files
├── plugins/                          # Expo config plugins
├── __tests__/                        # Test files
├── app.json                          # Expo config
├── eas.json                          # EAS Build profiles
├── tsconfig.json
└── package.json
```

## Naming Conventions

- **Screen files:** kebab-case following Expo Router conventions (`user-profile.tsx` maps to `/user-profile`)
- **Components:** PascalCase files and exports (`UserAvatar.tsx` exports `UserAvatar`)
- **Hooks:** camelCase prefixed with `use` (`useAuth.ts`, `useNotifications.ts`)
- **Stores:** kebab-case suffixed with `-store` (`auth-store.ts`)
- **Constants:** camelCase exports in kebab-case files (`colors.ts` exports `primaryBlue`)
- **Assets:** kebab-case with descriptive names (`icon-settings-24.png`, `hero-background.jpg`)
- **Test files:** `[component].test.tsx` colocated or in `__tests__/`
- **Types:** PascalCase, suffixed by purpose (`UserProfile`, `ApiResponse<T>`, `NavigationParams`)

## Navigation (Expo Router)

- Use Expo Router for file-based routing — every screen is a file in `app/`
- Group related screens with parenthetical directories: `(tabs)/`, `(auth)/`, `(modals)/`
- Dynamic routes use bracket syntax: `[id].tsx`, `[...slug].tsx`
- Deep linking configuration: define the `scheme` in `app.json`, test with `npx uri-scheme`
- Protected routes: check auth state in the root `_layout.tsx` and redirect to `(auth)/login` if unauthenticated
- Never use `react-navigation` directly when using Expo Router — they conflict

```typescript
// Root layout with auth gate
export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return (
    <Stack>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
```

## State Management (Zustand)

- Use Zustand for global state — lightweight, TypeScript-friendly, no boilerplate
- One store per domain: `auth-store`, `app-store`, `cache-store`
- Persist critical state to `expo-secure-store` (auth tokens) or `AsyncStorage` (preferences)
- Keep stores flat — no deeply nested objects
- Actions and state in the same store — no separate action files

```typescript
// Clean store pattern
interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}
```

## Native Modules and Platform Code

- Prefer Expo SDK modules over bare React Native or third-party native modules
- If a native module is needed: use Expo config plugins, not manual native code changes
- Document any native dependency in the project README with justification
- Platform-specific code: use `.ios.tsx` / `.android.tsx` suffixes only when platform behaviour genuinely differs
- Turbo Modules (New Architecture): opt in per-module when Expo supports it, do not force the new architecture globally unless all dependencies are compatible
- Test on both iOS and Android before merging — behaviour differences are common in camera, notifications, and file system access

## Push Notifications

- Use `expo-notifications` for push notification handling
- Request permissions at a contextual moment (after onboarding, before first notification-worthy event) — never on app launch
- Store push tokens server-side, associated with the user account
- Handle notifications in three states: foreground (in-app banner), background (system tray), killed (launch from notification)
- Deep link from notifications to the relevant screen using Expo Router's linking config
- Test with EAS Push: `npx expo-notifications:push` for development testing

## OTA Updates (expo-updates)

- Configure `expo-updates` for over-the-air JavaScript bundle updates
- Update policy: check for updates on app launch, prompt user to restart if critical
- Never ship native code changes via OTA — native changes require a new build
- Use update channels: `production`, `staging`, `preview` mapped to EAS Build profiles
- Rollback plan: publish a new update that reverts changes — OTA updates are append-only

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | Jest | 80% of lib/, stores/, hooks/ | Business logic, state management, API transforms |
| Component | Jest + React Native Testing Library | Key components | User interactions, conditional rendering, form validation |
| Snapshot | Jest | UI primitives | Layout regression for reusable components |
| E2E | Detox | Critical flows | Onboarding, login, main feature, purchase, settings |
| Manual | Device testing | Both platforms | iOS + Android on physical devices before release |

- Mock native modules in Jest config (`jest.setup.js`)
- Detox E2E tests run against a debug build on CI (iOS simulator + Android emulator)
- Test on the oldest supported OS version (iOS 16+, Android 10+) — not just the latest

## Build and Deployment (EAS)

### EAS Build Profiles (`eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  }
}
```

### Deployment Workflow

1. **Development:** `npx expo start` with development client — hot reload, debugger access
2. **Preview:** `eas build --profile preview` for internal testing (TestFlight / Firebase App Distribution)
3. **Production:** `eas build --profile production` then `eas submit` to App Store and Play Store
4. **OTA hotfix:** `eas update --channel production` for JavaScript-only fixes

### Version Management
- `version` in `app.json`: semantic versioning (`1.2.3`) — increment on every App Store release
- `buildNumber` (iOS) / `versionCode` (Android): auto-incremented by EAS
- OTA updates do not change the app version — they are patches within a version

## Security Rules

1. **Secure storage:** Use `expo-secure-store` for auth tokens, API keys, and sensitive data. Never use `AsyncStorage` for secrets — it is unencrypted.
2. **Certificate pinning:** Pin TLS certificates for API communication using `expo-certificate-transparency` or a config plugin. Prevents MITM attacks.
3. **Code obfuscation:** Enable Hermes bytecode compilation (default in Expo SDK 52+). For additional protection, use `react-native-obfuscating-transformer` in production builds.
4. **API keys:** Client-side API keys (maps, analytics) go in `app.json` extra config. Server-side API keys never appear in the app bundle.
5. **Biometric auth:** Use `expo-local-authentication` for biometric gates. Store the "authenticated" flag in secure storage, not in memory.
6. **Deep link validation:** Validate all incoming deep link parameters. Never trust external URLs to contain safe data.
7. **Clipboard:** Clear sensitive data from clipboard after a timeout. Do not copy tokens or passwords to clipboard.
8. **Screen capture:** Disable screenshots on sensitive screens (banking, auth) using `expo-screen-capture`.

## Common Pitfalls

- **FlatList performance.** Large lists must use `FlatList` or `FlashList`, never `ScrollView` with `.map()`. Set `keyExtractor`, use `React.memo` on render items, and avoid inline arrow functions in `renderItem`.
- **Re-renders from context.** Zustand avoids the re-render problem of React Context. If you must use Context, split it into multiple providers to prevent unnecessary re-renders.
- **Expo SDK version mismatches.** All Expo packages must match the SDK version. Running `npx expo install` ensures compatible versions. Never manually pin Expo package versions.
- **Missing permissions.** Camera, location, notifications, and contacts all require explicit permissions. Request at the point of use, not on startup. Handle "denied" gracefully — show why the permission is needed and link to Settings.
- **Ignoring Android back button.** Android has a hardware/gesture back button. Every screen must handle back navigation correctly. Use `useBackHandler` or Expo Router's built-in back handling.
- **Testing only on iOS.** Android rendering, navigation, and native module behaviour differ. Test on both platforms in CI and on physical devices before release.

## Code Review Checklist

- [ ] Screen uses Expo Router file-based routing (not manual navigation)
- [ ] Auth tokens stored in `expo-secure-store`, not `AsyncStorage`
- [ ] Lists use `FlatList`/`FlashList` with `keyExtractor` and memoised items
- [ ] Permissions requested at point of use with graceful denial handling
- [ ] Platform-specific code has both iOS and Android implementations
- [ ] No inline styles on frequently re-rendered components (use StyleSheet)
- [ ] Push notification handlers cover foreground, background, and killed states
- [ ] Deep links validated before navigation
- [ ] API calls have error handling, loading states, and timeout
- [ ] TypeScript strict mode — no `any` types without justification
- [ ] EAS build profiles configured for dev, preview, and production
- [ ] Tested on both iOS and Android

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
