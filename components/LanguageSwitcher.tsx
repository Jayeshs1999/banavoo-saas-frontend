"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language?.split("-")[0] || "en";

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 transition-colors"
        aria-label="Change language"
      >
        <Globe size={18} />
        <span className="text-sm font-medium uppercase">
          {currentLanguage === "mr"
            ? "मराठी"
            : currentLanguage === "hi"
              ? "हिंदी"
              : "EN"}
        </span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          <button
            onClick={() => changeLanguage("en")}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              currentLanguage === "en"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage("mr")}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              currentLanguage === "mr"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            मराठी
          </button>
          <button
            onClick={() => changeLanguage("hi")}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              currentLanguage === "hi"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>
    </div>
  );
}
