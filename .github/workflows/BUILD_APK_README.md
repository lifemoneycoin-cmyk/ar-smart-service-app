# AR Smart Service v34 (Capacitor Android APK + Field Precision UI)

## What Was Fixed & Upgraded
1. **Unified "Field Precision" UI (`theme.css`)**: Applied the Google Stitch Field Precision design system (`#001428` / `#0f2942` Navy, `#1471e6` Electric Blue, `#f9f9ff` surface, `Plus Jakarta Sans` + `Inter` typography) across all 12 HTML pages.
2. **Fixed Page Navigation & Role Routing (`nav.js`, `ai.html`, `tools.html`, `shop-admin.html`, `customer.html`)**:
   - Fixed mismatched customer home links (`customer.html` vs `booking.html`).
   - Fixed unauthenticated redirects to route cleanly to `login.html` instead of bouncing randomly.
3. **Fixed Service Worker (`sw.js`) Trap**:
   - Disabled Service Worker registration inside Capacitor native APK so pages always load directly from the bundled `www/` folder (never opening Chrome or falling back to `index.html`).
4. **Added Native Android Bridge (`app-bridge.js`)**:
   - Handles Android hardware Back button cleanly.
   - Ensures `wa.me`, `tel:`, and `mailto:` links open properly without breaking WebView.

## How to Generate the `.apk` File (2 Easy Ways)

### Option A: 100% Free Cloud Build via GitHub (No PC / Android Studio Needed)
1. Create a **Private** repository on GitHub (github.com).
2. Upload all files from this folder (including `.github/workflows/build-apk.yml`).
3. Go to the **Actions** tab in your GitHub repo -> click **Build Android APK (AR Smart Service)** -> **Run workflow**.
4. In 2–3 minutes, download **`AR-Smart-Service-v34-APK`** (which contains `app-debug.apk`)!

### Option B: Build Locally with Android Studio (PC)
```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```
Then in Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
