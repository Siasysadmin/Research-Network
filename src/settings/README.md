# Settings — redesign & refactor

The original `src/settings/setting.jsx` (1,435 lines, inline-styled, single
component) has been replaced by a componentised, themed, accessible module.
The route import in `App.jsx` (`import Settings from "./settings/setting"`) is
**unchanged** — `setting.jsx` still default-exports the page.

## Structure

```
src/settings/
  setting.jsx                  ← shell: sidebar nav, routing between sections,
                                  shared logout modal, keyboard navigation
  services/
    settingsService.js         ← every backend call + auth/token + helpers
  hooks/
    useLocalSetting.js         ← persists local-only prefs to localStorage
    usePasswordStrength.js     ← 0–4 score + per-rule checks
  components/
    SectionHeader.jsx
    SettingsCard.jsx           ← <SettingsCard> + <Row>
    Toggle.jsx                 ← accessible switch (role="switch")
    PasswordField.jsx          ← show/hide + Caps Lock warning
    StrengthMeter.jsx          ← animated bar + live checklist
    Segmented.jsx              ← radiogroup segmented control
    Feedback.jsx               ← SearchInput, EmptyState, Skeleton, RowSkeleton
    ConfirmModal.jsx           ← ESC / focus management / backdrop
  sections/
    AccountSettings.jsx
    SecuritySettings.jsx
    NotificationSettings.jsx
    PrivacySettings.jsx
    AppearanceSettings.jsx
    ConnectedAccounts.jsx
    BlockedUsers.jsx
    HelpSupport.jsx
    DangerZone.jsx
```

## Backend — preserved exactly

These endpoints, methods and payloads are identical to the original and are
the only network calls in the module (all in `settingsService.js`):

| Action            | Method | Endpoint                          | Payload                                           |
|-------------------|--------|-----------------------------------|---------------------------------------------------|
| Blocked users     | GET    | `/account/get-blocked-users`      | —                                                 |
| Block / unblock   | POST   | `/account/block-unblock-user`     | `{ user_id: String }`                             |
| Change password   | POST   | `/account/change-password`        | `{ old_password, new_password, confirm_password }`|
| Logout            | POST   | `/auth/logout`                    | —                                                 |
| Delete account    | DELETE | `/account/delete-account`         | —                                                 |

Auth token is still read from `localStorage.token`; `clearAuthData()` still
preserves the theme across a storage wipe, exactly as before. Theme still goes
through the existing `ThemeContext` (`useTheme`) — its public API is untouched.

## Wired vs. scaffolded

**Live (real backend):** Security/Change password, Blocked users (with search +
pagination), Logout, Delete account, Appearance (via ThemeContext).

**Local scaffolds (no backend exists yet):** Notifications, Privacy, Connected
accounts. These persist to `localStorage` so the controls genuinely work and
survive reloads. To make them server-backed, add the endpoint to
`settingsService.js` and swap the setter inside the relevant section — the UI
doesn't change.

## Accessibility

Vertical `tablist`/`tab`/`tabpanel` with arrow-key + Home/End navigation and
roving `tabindex`; `role="switch"` toggles; `radiogroup` for visibility/theme;
visible `focus-visible` rings throughout; modals trap initial focus, close on
ESC, restore focus and lock body scroll; `motion-reduce:` respected on all
animations.

## Verification note

This was validated with Babel's JSX parser and an import-resolution check; all
files parse and every relative import resolves. A full `vite build` could not be
run in the authoring environment because the bundled `node_modules` shipped
Windows-only native binaries. Run `npm install` (to fetch your platform's
binaries) then `npm run dev` / `npm run build` to verify against your backend.
```
