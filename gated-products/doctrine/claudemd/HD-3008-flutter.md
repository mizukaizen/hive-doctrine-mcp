# CLAUDE.md — Flutter Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Flutter 3.24+, Dart 3.5+, Riverpod/Bloc, GoRouter, Freezed, Firebase

## Project Overview

This configuration governs Flutter mobile app projects targeting iOS and Android. The architecture follows feature-first organisation with strict state management patterns. Flutter gives you the tools to build beautiful apps fast — this file keeps you from building unmaintainable ones.

## Project Structure

```
├── lib/
│   ├── main.dart                       # App entry point
│   ├── app.dart                        # MaterialApp/CupertinoApp config
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart         # Theme colours
│   │   │   ├── app_spacing.dart        # Spacing, padding values
│   │   │   └── api_endpoints.dart      # API URL constants
│   │   ├── errors/
│   │   │   ├── exceptions.dart         # Custom exceptions
│   │   │   └── failures.dart           # Failure classes (Either pattern)
│   │   ├── network/
│   │   │   ├── api_client.dart         # Dio HTTP client setup
│   │   │   ├── interceptors.dart       # Auth, logging interceptors
│   │   │   └── network_info.dart       # Connectivity checker
│   │   ├── router/
│   │   │   └── app_router.dart         # GoRouter configuration
│   │   ├── theme/
│   │   │   ├── app_theme.dart          # ThemeData definitions
│   │   │   └── text_styles.dart        # Typography
│   │   └── utils/
│   │       ├── extensions.dart         # Dart extensions
│   │       └── validators.dart         # Input validation
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── datasources/        # Remote + local data sources
│   │   │   │   ├── models/             # JSON serialisation models
│   │   │   │   └── repositories/       # Repository implementations
│   │   │   ├── domain/
│   │   │   │   ├── entities/           # Business entities
│   │   │   │   ├── repositories/       # Repository interfaces
│   │   │   │   └── usecases/           # Business logic
│   │   │   └── presentation/
│   │   │       ├── providers/          # Riverpod providers (or Bloc)
│   │   │       ├── screens/            # Full screens
│   │   │       └── widgets/            # Feature-specific widgets
│   │   ├── home/
│   │   │   └── ...                     # Same structure
│   │   └── settings/
│   │       └── ...
│   └── shared/
│       └── widgets/                    # Cross-feature widgets
├── test/
│   ├── unit/
│   ├── widget/
│   ├── integration/
│   └── goldens/                        # Golden test snapshots
├── integration_test/                   # Flutter integration tests
├── assets/
│   ├── images/
│   ├── fonts/
│   └── animations/
├── android/
│   ├── app/
│   │   ├── build.gradle                # Android build config
│   │   └── src/
│   │       ├── main/                   # Production
│   │       ├── dev/                    # Dev flavour overrides
│   │       └── staging/                # Staging flavour overrides
├── ios/
│   ├── Runner/
│   └── Runner.xcodeproj/
├── pubspec.yaml
├── analysis_options.yaml               # Lint rules
├── l10n.yaml                           # Localisation config
└── .env.example
```

## Naming Conventions

- **Files:** snake_case always (`user_profile_screen.dart`, `auth_provider.dart`)
- **Classes:** PascalCase (`UserProfileScreen`, `AuthRepository`)
- **Variables/functions:** camelCase (`fetchUserProfile`, `isAuthenticated`)
- **Constants:** camelCase for top-level, SCREAMING_SNAKE_CASE only for truly global constants
- **Private members:** prefix with underscore (`_authState`, `_handleLogin`)
- **Screens:** suffix with `Screen` (`HomeScreen`, `LoginScreen`)
- **Widgets:** suffix with descriptive noun (`UserAvatar`, `PriceTag`, `OrderCard`)
- **Providers (Riverpod):** suffix with `Provider` or `Notifier` (`authProvider`, `cartNotifier`)
- **Blocs:** suffix with `Bloc` or `Cubit` (`AuthBloc`, `CartCubit`)
- **Models:** suffix with `Model` for data layer (`UserModel`), no suffix for domain entities (`User`)

## Dart Conventions

- Strict `analysis_options.yaml` — use `flutter_lints` or `very_good_analysis` package
- Enable all recommended lint rules. Zero lint warnings in CI.
- Use `final` by default. Only use `var` when reassignment is genuinely needed.
- Prefer `const` constructors wherever possible (performance benefit in Flutter widget tree)
- Use `late` sparingly — prefer nullable types with null checks
- Pattern matching (Dart 3): use switch expressions and sealed classes for exhaustive state handling
- Use Freezed for immutable data classes with `copyWith`, `==`, and JSON serialisation
- Avoid `dynamic` type — use proper generics or `Object?`

```dart
// CORRECT — Freezed immutable model
@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String displayName,
    DateTime? lastLoginAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// WRONG — mutable class with no equality
class User {
  String id;
  String email;
  User(this.id, this.email);
}
```

## State Management

### Riverpod (Recommended)
- Use `@riverpod` annotation (code generation) for providers — cleaner than manual provider definitions
- `AsyncNotifier` for async state (API calls, database queries)
- `Notifier` for synchronous state (UI state, form state)
- Keep providers close to the feature they serve (in `features/auth/presentation/providers/`)
- Global providers (auth state, theme) live in `core/providers/`
- Never put business logic in widgets — delegate to providers/notifiers

### Bloc (Alternative)
- One Bloc per feature or screen
- Events are past-tense verbs (`LoginRequested`, `ProfileUpdated`)
- States are adjectives or nouns (`AuthInitial`, `AuthLoading`, `AuthAuthenticated`, `AuthError`)
- Use sealed classes for states — enables exhaustive `switch` handling
- Bloc-to-Bloc communication via streams, not direct references

## Navigation (GoRouter)

- Define all routes in `core/router/app_router.dart`
- Use typed route paths with constants — never hardcode path strings in widgets
- Nested navigation: use `ShellRoute` for tab-based layouts
- Auth-aware routing: redirect unauthenticated users to login in the router configuration
- Deep linking: configure for both iOS (Universal Links) and Android (App Links)
- Pass data between routes via path parameters or query parameters — avoid passing complex objects

## Flavours (Environment Management)

| Flavour | API | Logging | Analytics | Purpose |
|---------|-----|---------|-----------|---------|
| `dev` | Local/staging API | Verbose | Disabled | Development |
| `staging` | Staging API | Info level | Enabled (staging) | QA testing |
| `production` | Production API | Errors only | Enabled (production) | App Store release |

- Configure flavours in `android/app/build.gradle` (productFlavors) and iOS schemes
- Use `--flavor` flag with `flutter run` and `flutter build`
- Environment config loaded from flavour-specific `.env` files via `flutter_dotenv` or compile-time constants
- Firebase: separate `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) per flavour

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | flutter_test | 85% of domain + data layers | Use cases, repositories, models, validators |
| Widget | flutter_test | Key screens and components | Rendering, user interaction, state changes |
| Golden | flutter_test + golden_toolkit | UI primitives | Visual regression for buttons, cards, layouts |
| Integration | integration_test | Critical flows | Login, main feature, purchase, settings |
| Manual | Physical devices | Both platforms | Performance, native feel, edge cases |

### Testing Rules
- Mock all external dependencies (API, database, platform channels) in unit and widget tests
- Use `ProviderContainer` overrides for Riverpod, or `MockBloc` for Bloc testing
- Golden tests: update goldens intentionally with `flutter test --update-goldens` — review diffs in PR
- Integration tests: run on CI with Android emulator and iOS simulator
- Test on minimum supported OS versions (iOS 16, Android API 26)

## Build and Deployment

### CI/CD Pipeline (GitHub Actions or Codemagic)

```yaml
# On every PR
- flutter analyze           # Lint checks
- flutter test              # Unit + widget tests
- flutter test --update-goldens  # Golden comparison (fail on diff)

# On merge to main
- flutter build appbundle --flavor production    # Android
- flutter build ipa --flavor production          # iOS
- Upload to Play Store (internal track)
- Upload to TestFlight
```

### Release Workflow

1. **Development:** Flutter hot reload with `dev` flavour
2. **QA:** Build `staging` flavour, distribute via Firebase App Distribution or TestFlight
3. **Release candidate:** Build `production` flavour, submit to App Store Connect and Google Play Console
4. **Production:** Promote from internal testing to production after QA approval
5. **Hotfix:** Branch from the release tag, fix, rebuild, expedited review

### Version Management
- `pubspec.yaml` version: `major.minor.patch+buildNumber` (`1.2.3+45`)
- Increment `patch` for bug fixes, `minor` for features, `major` for breaking changes
- `buildNumber` auto-increments in CI
- Tag releases in Git: `v1.2.3`

## Security Rules

1. **Secure storage:** Use `flutter_secure_storage` for tokens, credentials, and sensitive data. Never use `SharedPreferences` for secrets — it stores as plaintext.
2. **Network security:** Configure Android Network Security Config to restrict cleartext traffic. Use certificate pinning for API communication.
3. **ProGuard (Android):** Enable ProGuard/R8 for release builds. Configure rules to prevent stripping of required classes (Gson, Retrofit models).
4. **Code obfuscation:** Enable Dart obfuscation in release builds: `flutter build --obfuscate --split-debug-info=build/debug-info/`
5. **API keys:** Never hardcode API keys in Dart source. Use `--dart-define` for compile-time injection or environment-specific config files.
6. **Biometric auth:** Use `local_auth` plugin for fingerprint/face authentication. Gate sensitive features, not just app launch.
7. **Root/jailbreak detection:** Detect and warn on rooted/jailbroken devices for security-sensitive apps using `flutter_jailbreak_detection`.
8. **Data at rest:** Encrypt local databases (Isar/Hive encryption) for apps handling sensitive data.

## Common Pitfalls

- **Widget rebuild storms.** Using `setState` in deeply nested widgets causes subtree rebuilds. Use Riverpod/Bloc for state, `const` constructors for static widgets, and `RepaintBoundary` for expensive render subtrees.
- **Missing `const` constructors.** Every stateless widget and configuration object should have `const` constructors. This enables Flutter's widget comparison optimisation.
- **Blocking the UI thread.** Heavy computation (JSON parsing, image processing) must run in an isolate (`compute()` or `Isolate.spawn()`). Dart is single-threaded — blocking the main isolate freezes the UI.
- **Platform channel misuse.** Platform channels are for native code integration, not general async work. Keep channel calls minimal and batch data to reduce crossing overhead.
- **Ignoring lifecycle.** Handle `AppLifecycleState` changes: pause API polling on background, resume on foreground, save state on detach.
- **Not testing on Android.** iOS Simulator is fast and convenient. But Android rendering, font metrics, and navigation behaviour differ. Test on real Android devices before release.

## Code Review Checklist

- [ ] No lint warnings (flutter analyze passes clean)
- [ ] Freezed models used for data classes (immutable, with equality)
- [ ] State management follows project pattern (Riverpod/Bloc, not raw setState)
- [ ] Navigation uses GoRouter with typed paths
- [ ] Sensitive data stored in `flutter_secure_storage`
- [ ] API keys injected via `--dart-define`, not hardcoded
- [ ] `const` constructors used wherever possible
- [ ] Heavy work runs in isolates, not main thread
- [ ] Error handling: no unhandled Future exceptions, proper error states in UI
- [ ] Localisation: user-facing strings use `l10n`, not hardcoded text
- [ ] Tests cover new logic (unit) and new UI (widget/golden)
- [ ] Works on both iOS and Android (tested in CI or manually)

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
