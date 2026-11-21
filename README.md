# DomainGuard — Secure Google Authentication Portal (Powered by Supabase)

> **Enterprise SSO & Domain-Enforced Identity Gate for React Native & React Native Web with Supabase Auth & PostgreSQL RLS**

DomainGuard is a production-grade, cross-platform authentication portal built with **React Native**, **React Native Web**, **TypeScript**, and **Supabase**. It enforces strict single sign-on (SSO) boundaries, permitting authenticated access **exclusively** to verified users belonging to the official company domain: **`hbplus.fit`**.

---

## 1. Project Overview

In enterprise environments, standard Google OAuth logins often permit any user with a public `@gmail.com` or external Google account to authenticate unless strict domain-level isolation is enforced. 

**DomainGuard** solves this at both the **application boundary** and the **database boundary (PostgreSQL Row Level Security)**:
* **Allowed Domain**: `hbplus.fit`
  * `aman@hbplus.fit` ➔ **Allowed** (Enterprise Admin / Member)
  * `employee@hbplus.fit` ➔ **Allowed** (Enterprise Member)
  * `aman@gmail.com` ➔ **Rejected** (`"Access restricted. Please login using your official domain email."`)
  * `user@yahoo.com` ➔ **Rejected**
  * `aman@fakehbplus.fit` ➔ **Rejected** (Domain spoofing blocked)
  * `aman@hbplus.fit.evil.com` ➔ **Rejected** (Subdomain attack blocked)

---

## 2. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | React Native 0.76, React Native Web 0.19, Expo SDK 52 |
| **Language** | TypeScript (Strict mode enabled) |
| **Authentication** | Google OAuth 2.0 via `@supabase/supabase-js` Auth |
| **Database & RBAC** | Supabase PostgreSQL (`public.profiles`, `public.audit_logs`) |
| **Backend Security** | `supabase.sql` (PostgreSQL Row Level Security & strict `@hbplus.fit` regex function) |
| **Navigation & Guard** | Cross-platform state-driven `AppNavigator` with Web URL hash protection |
| **Testing** | Jest, ts-jest (16 exhaustive unit tests covering all domain spoofing vectors) |

---

## 3. Folder Structure

```text
login project/
├── .env.example                     # Sample environment variable template
├── app.json                         # Expo cross-platform configuration
├── babel.config.js                  # Babel configuration for Expo & Web
├── supabase.sql                     # Enterprise PostgreSQL schema & RLS policies
├── index.js                         # Application entrypoint
├── jest.config.js                   # Jest unit test configuration
├── package.json                     # Project manifest and scripts
├── tsconfig.json                    # Strict TypeScript configuration
└── src/
    ├── components/
    │   ├── AppButton.tsx            # Reusable button with variants & loading states
    │   ├── GeometricLogo.tsx        # Custom minimalist DomainGuard mark
    │   ├── GoogleSignInButton.tsx   # Google SSO button with authentic vector emblem
    │   ├── LoadingScreen.tsx        # Identity verification transition screen
    │   └── StatusBadge.tsx          # Pill indicators (Verified, Suffix, Roles)
    ├── config/
    │   └── supabaseConfig.ts        # Environment loader & diagnostics
    ├── context/
    │   └── AuthContext.tsx          # Centralized auth state & lifecycle provider
    ├── navigation/
    │   └── AppNavigator.tsx         # Route protection & web URL guard
    ├── screens/
    │   ├── DashboardScreen.tsx      # Protected enterprise workspace & session details
    │   └── LoginScreen.tsx          # Minimalist login portal & domain test perimeter
    ├── services/
    │   ├── authService.ts           # Google OAuth execution, session handling & checks
    │   └── supabaseService.ts       # Supabase sync, role resolution & audit logging
    ├── types/
    │   └── index.ts                 # UserProfile, AuthStatus, and RejectionDetails
    └── utils/
        ├── domainValidation.ts      # Strict domain normalization & verification algorithms
        └── __tests__/
            └── domainValidation.test.ts # Exhaustive test suite for security validation
```

---

## 4. Backend Security & Row Level Security (RLS)

Security is guaranteed at the database layer via PostgreSQL Row Level Security in [supabase.sql](file:///d:/project/login%20project/supabase.sql):

```sql
CREATE OR REPLACE FUNCTION public.is_hbplus_employee()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL
    AND (auth.jwt() ->> 'email') IS NOT NULL
    AND (auth.jwt() ->> 'email') LIKE '%@hbplus.fit'
    AND (
      (auth.jwt() ->> 'email_verified')::boolean IS TRUE
      OR (auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean IS TRUE
      OR (auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Only verified @hbplus.fit accounts can query profiles
CREATE POLICY "Employees can view profiles"
  ON public.profiles FOR SELECT
  USING (public.is_hbplus_employee());
```

---

## 5. Supabase Setup Guide (2 Minutes)

### Step 1: Create a Free Supabase Project
1. Go to [database.new](https://database.new) (Supabase Dashboard) and create a project.

### Step 2: Run the Schema Migration
1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open [supabase.sql](file:///d:/project/login%20project/supabase.sql) from this project, copy its contents, paste them into the SQL Editor, and click **Run**.
3. This creates the `profiles` table, `audit_logs` table, and activates the Row Level Security (RLS) policies.

### Step 3: Enable Google Authentication in Supabase
1. In the Supabase Dashboard, go to **Authentication ➔ Providers**.
2. Click **Google** and toggle it **On**.
3. Enter your Google Client ID and Secret (from Google Cloud Console).
4. Add your site URL (e.g. `http://localhost:8081` or your production domain) under **Authentication ➔ URL Configuration ➔ Redirect URLs**.

### Step 4: Add Your Supabase Keys to `.env`
1. In the Supabase Dashboard, go to **Project Settings (gear icon) ➔ API**.
2. Copy your **Project URL** and **Project API Key (`anon` / public)**.
3. Open [.env](file:///d:/project/login%20project/.env) and paste:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
   ```

---

## 6. Running the Application

### Running on Web
```bash
npm run web
```
or export a static production bundle:
```bash
npx expo export --platform web
```

### Running on Android
```bash
npm run android
```

### Running on iOS
```bash
npm run ios
```

### Running Tests
```bash
npm test
```
*(All 16 unit tests validate domain parsing, trimming, case-insensitivity, email verification status, and injection defenses).*
