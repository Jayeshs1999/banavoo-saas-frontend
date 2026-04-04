# Internationalization (i18n) Setup Guide

This project uses `i18next` and `react-i18next` for internationalization with support for English and Hindi languages.

## Setup Overview

The i18n setup includes:

- **i18next** - Core internationalization library
- **react-i18next** - React bindings for i18next
- **i18next-browser-languagedetector** - Automatic language detection from browser

## File Structure

```
dormitory/
├── lib/
│   └── i18n.ts              # i18n configuration
├── components/
│   ├── I18nProvider.tsx     # i18n provider wrapper
│   └── LanguageSwitcher.tsx # Language switcher component
├── messages/
│   ├── en/
│   │   ├── translation.json # English translations
│   │   └── translation.d.ts # TypeScript declaration
│   └── hi/
│       ├── translation.json # Hindi translations
│       └── translation.d.ts # TypeScript declaration
└── app/
    └── layout.tsx           # Root layout with I18nProvider
```

## How to Use Translations

### In Components

```tsx
import { useTranslation } from "react-i18next";

export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("home.welcomeTitle")}</h1>
      <p>{t("home.welcomeSubtitle")}</p>
    </div>
  );
}
```

### Adding New Translations

1. Add new keys to both `messages/en/translation.json` and `messages/hi/translation.json`:

```json
// messages/en/translation.json
{
  "myNewKey": "English text",
  "mySection": {
    "title": "Section Title"
  }
}
```

```json
// messages/hi/translation.json
{
  "myNewKey": "हिंदी टेक्स्ट",
  "mySection": {
    "title": "सेक्शन शीर्षक"
  }
}
```

## Language Switcher

The `LanguageSwitcher` component is already integrated into the Header. It provides a dropdown to switch between English and Hindi.

## Features

- **Automatic Language Detection**: Detects user's browser language on first visit
- **Persistent Language Selection**: Remembers user's language choice in localStorage
- **SSR Compatible**: Works with Next.js server-side rendering

## Supported Languages

- **English (en)** - Default language
- **Hindi (hi)** - हिंदी

## Adding More Languages

1. Create a new folder in `messages/` with the language code (e.g., `messages/es/` for Spanish)
2. Add `translation.json` with translations
3. Add `translation.d.ts` declaration file
4. Update `lib/i18n.ts` to include the new language:

```typescript
import translationES from "../messages/es/translation.json";

const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
  es: { translation: translationES }, // Add this
};
```

5. Update the `LanguageSwitcher` component to include the new language option
