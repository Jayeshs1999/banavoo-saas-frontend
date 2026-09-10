"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../../context/AuthContext";
import { useStore } from "../../../../context/StoreContext";
import Button from "../../../../../components/Button";
import StorefrontRenderer from "../../../../../components/storefront/StorefrontRenderer";
import {
  DEFAULT_THEME,
  TEMPLATE_PRESETS,
  COLOR_PALETTES,
  ALLOWED_FONTS,
  ALLOWED_BUTTON_STYLES,
  getEffectiveTheme,
} from "../../../../../lib/storeTheme";
import type {
  Store,
  StoreTheme,
  StoreTemplate,
  StoreHomepage,
  SocialLinks,
  ContactSettings,
  StoreSeo,
} from "../../../../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "template" | "colors" | "fonts" | "buttons" | "homepage" | "social" | "seo";
type Preview = "desktop" | "tablet" | "mobile";

// ─── Small helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-5 first:mt-0">{children}</h3>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="w-20 rounded border border-gray-200 px-2 py-1 text-xs font-mono"
        />
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Image upload row ─────────────────────────────────────────────────────────

function ImageUploadRow({
  label,
  current,
  uploading,
  onUpload,
  onDelete,
}: {
  label:     string;
  current?:  { url: string | null; publicId: string | null } | null;
  uploading: boolean;
  onUpload:  (file: File) => void;
  onDelete:  () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {current?.url ? (
          <Image
            src={current.url}
            alt={label}
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
            None
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
          >
            {uploading ? "Uploading…" : current?.url ? "Replace" : "Upload"}
          </button>
          {current?.url && (
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CustomizePage() {
  const router              = useRouter();
  const { currentUser, initializing } = useAuth();
  const {
    currentStore, storeLoading,
    updateBranding,
    uploadLogo,   deleteLogo,
    uploadBanner, deleteBanner,
    uploadFavicon, deleteFavicon,
  } = useStore();

  // ── Draft state (mirrors currentStore, editable) ──────────────────────────
  const [draft, setDraft]     = useState<Store | null>(null);
  const [activeTab, setActiveTab]   = useState<Tab>("template");
  const [previewMode, setPreviewMode] = useState<Preview>("desktop");
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imgLoading, setImgLoading]   = useState<string | null>(null); // "logo"|"banner"|"favicon"
  const isDirty = draft !== currentStore && draft !== null;

  // ── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initializing) return;
    if (!currentUser) { router.replace("/login"); return; }
    if (currentUser.role !== "seller") { router.replace("/become-seller"); return; }
    if (!storeLoading && !currentStore) { router.replace("/seller"); }
  }, [currentUser, initializing, storeLoading, currentStore, router]);

  // ── Sync draft when store loads ───────────────────────────────────────────
  const storeId = currentStore?.id;
  useEffect(() => {
    if (currentStore) setDraft({ ...currentStore });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // ── Draft helpers ─────────────────────────────────────────────────────────
  const patchTheme = useCallback((patch: Partial<StoreTheme>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const current = getEffectiveTheme(prev);
      return { ...prev, theme: { ...current, ...patch } };
    });
  }, []);

  const patchColors = useCallback((patch: Partial<StoreTheme["colors"]>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const current = getEffectiveTheme(prev);
      return { ...prev, theme: { ...current, colors: { ...current.colors, ...patch } } };
    });
  }, []);

  const patchTypography = useCallback((patch: Partial<StoreTheme["typography"]>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const current = getEffectiveTheme(prev);
      return { ...prev, theme: { ...current, typography: { ...current.typography, ...patch } } };
    });
  }, []);

  const patchButtons = useCallback((patch: Partial<StoreTheme["buttons"]>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const current = getEffectiveTheme(prev);
      return { ...prev, theme: { ...current, buttons: { ...current.buttons, ...patch } } };
    });
  }, []);

  const patchHomepage = useCallback((patch: Partial<StoreHomepage>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        homepage: { ...(prev.homepage ?? {}), ...patch } as StoreHomepage,
      };
    });
  }, []);

  const patchHero = useCallback((patch: Partial<StoreHomepage["hero"]>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const hp = prev.homepage!;
      return {
        ...prev,
        homepage: { ...hp, hero: { ...hp.hero, ...patch } } as StoreHomepage,
      };
    });
  }, []);

  const patchAbout = useCallback((patch: Partial<StoreHomepage["about"]>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const hp = prev.homepage!;
      return {
        ...prev,
        homepage: { ...hp, about: { ...hp.about, ...patch } } as StoreHomepage,
      };
    });
  }, []);

  const patchSocial = useCallback((patch: Partial<SocialLinks>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, socialLinks: { ...(prev.socialLinks ?? {}), ...patch } as SocialLinks };
    });
  }, []);

  const patchContact = useCallback((patch: Partial<ContactSettings>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        contactSettings: { ...(prev.contactSettings ?? {}), ...patch } as ContactSettings,
      };
    });
  }, []);

  const patchSeo = useCallback((patch: Partial<StoreSeo>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, seo: { ...(prev.seo ?? {}), ...patch } as StoreSeo };
    });
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    const result = await updateBranding({
      theme:           draft.theme,
      homepage:        draft.homepage,
      socialLinks:     draft.socialLinks,
      contactSettings: draft.contactSettings,
      seo:             draft.seo,
    });
    setSaving(false);
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || "Failed to save.");
    }
  };

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleUpload = async (type: "logo" | "banner" | "favicon", file: File) => {
    setImgLoading(type);
    let result;
    if (type === "logo")    result = await uploadLogo(file);
    else if (type === "banner") result = await uploadBanner(file);
    else                    result = await uploadFavicon(file);
    setImgLoading(null);
    if (!result.success && result.error) setSaveError(result.error);
  };

  const handleDelete = async (type: "logo" | "banner" | "favicon") => {
    setImgLoading(type);
    let result;
    if (type === "logo")    result = await deleteLogo();
    else if (type === "banner") result = await deleteBanner();
    else                    result = await deleteFavicon();
    setImgLoading(null);
    if (!result.success && result.error) setSaveError(result.error);
  };

  // ── Loading guards ────────────────────────────────────────────────────────
  if (initializing || (storeLoading && !currentStore)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "seller" || !draft) return null;

  const theme = getEffectiveTheme(draft);

  // ── Sidebar tabs ──────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: "template", label: "Template" },
    { id: "colors",   label: "Colors"   },
    { id: "fonts",    label: "Fonts"    },
    { id: "buttons",  label: "Buttons"  },
    { id: "homepage", label: "Homepage" },
    { id: "social",   label: "Social"   },
    { id: "seo",      label: "SEO"      },
  ];

  const previewWidth =
    previewMode === "mobile"  ? "390px"  :
    previewMode === "tablet"  ? "768px"  : "100%";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* ── Top bar ── */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/seller" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-800">Customize Store</span>
          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Preview size */}
        <div className="hidden md:flex items-center gap-1">
          {(["desktop", "tablet", "mobile"] as Preview[]).map((m) => (
            <button
              key={m}
              onClick={() => setPreviewMode(m)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${
                previewMode === m
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-green-600 font-medium">Saved ✓</span>
          )}
          {saveError && (
            <span className="text-xs text-red-600 max-w-xs truncate">{saveError}</span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={saving}
          >
            Save
          </Button>
        </div>
      </div>

      {/* ── Main layout: sidebar + preview ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          {/* Tab nav */}
          <nav className="flex flex-wrap gap-1 p-3 border-b border-gray-100">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === t.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="p-4 flex-1 space-y-1">

            {/* ── Branding images (always visible) ── */}
            <div className="mb-4 space-y-4 pb-4 border-b border-gray-100">
              <SectionTitle>Branding</SectionTitle>
              <ImageUploadRow
                label="Logo (400×400px)"
                current={currentStore?.logo}
                uploading={imgLoading === "logo"}
                onUpload={(f) => handleUpload("logo", f)}
                onDelete={() => handleDelete("logo")}
              />
              <ImageUploadRow
                label="Banner (1600×600px)"
                current={currentStore?.banner}
                uploading={imgLoading === "banner"}
                onUpload={(f) => handleUpload("banner", f)}
                onDelete={() => handleDelete("banner")}
              />
              <ImageUploadRow
                label="Favicon (64×64px)"
                current={currentStore?.favicon}
                uploading={imgLoading === "favicon"}
                onUpload={(f) => handleUpload("favicon", f)}
                onDelete={() => handleDelete("favicon")}
              />
            </div>

            {/* ── Template ── */}
            {activeTab === "template" && (
              <div>
                <SectionTitle>Choose Template</SectionTitle>
                <div className="space-y-2">
                  {(["classic", "minimal", "artisan"] as StoreTemplate[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const preset = TEMPLATE_PRESETS[t];
                        setDraft((prev) => prev ? { ...prev, theme: preset } : prev);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all capitalize ${
                        theme.template === t
                          ? "border-blue-600 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {t}
                      <span className="block text-xs font-normal text-gray-500 mt-0.5">
                        {t === "classic"  && "Warm, professional layout with standard fonts"}
                        {t === "minimal"  && "Clean, monochrome — maximum focus on products"}
                        {t === "artisan"  && "Earthy serif design for handcrafted goods"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Colors ── */}
            {activeTab === "colors" && (
              <div>
                <SectionTitle>Color Palettes</SectionTitle>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {COLOR_PALETTES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => patchColors(p)}
                      className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                    >
                      <div className="flex gap-1 mb-1">
                        {[p.primary, p.accent, p.background].map((c) => (
                          <div
                            key={c}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">{p.name}</span>
                    </button>
                  ))}
                </div>

                <SectionTitle>Custom Colors</SectionTitle>
                <div className="space-y-3">
                  <ColorInput label="Primary"    value={theme.colors.primary}    onChange={(v) => patchColors({ primary:    v })} />
                  <ColorInput label="Secondary"  value={theme.colors.secondary}  onChange={(v) => patchColors({ secondary:  v })} />
                  <ColorInput label="Accent"     value={theme.colors.accent}     onChange={(v) => patchColors({ accent:     v })} />
                  <ColorInput label="Text"       value={theme.colors.text}       onChange={(v) => patchColors({ text:       v })} />
                  <ColorInput label="Background" value={theme.colors.background} onChange={(v) => patchColors({ background: v })} />
                </div>

                <button
                  type="button"
                  onClick={() => patchColors(DEFAULT_THEME.colors)}
                  className="mt-4 text-xs text-gray-400 hover:text-gray-600"
                >
                  Reset to defaults
                </button>
              </div>
            )}

            {/* ── Fonts ── */}
            {activeTab === "fonts" && (
              <div>
                <SectionTitle>Heading Font</SectionTitle>
                <div className="space-y-1.5 mb-5">
                  {ALLOWED_FONTS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => patchTypography({ headingFont: f.value })}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                        theme.typography.headingFont === f.value
                          ? "border-blue-600 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <SectionTitle>Body Font</SectionTitle>
                <div className="space-y-1.5">
                  {ALLOWED_FONTS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => patchTypography({ bodyFont: f.value })}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                        theme.typography.bodyFont === f.value
                          ? "border-blue-600 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Buttons ── */}
            {activeTab === "buttons" && (
              <div>
                <SectionTitle>Button Style</SectionTitle>
                <div className="flex gap-2 mb-5">
                  {ALLOWED_BUTTON_STYLES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => patchButtons({ style: s.value })}
                      className={`flex-1 py-2 text-xs font-medium border transition-all ${
                        theme.buttons.style === s.value
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-500"
                      } ${
                        s.value === "rounded" ? "rounded-lg"  :
                        s.value === "pill"    ? "rounded-full" : "rounded-none"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <SectionTitle>Button Size</SectionTitle>
                <div className="flex gap-2 mb-5">
                  {(["small", "medium", "large"] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => patchButtons({ size: sz })}
                      className={`flex-1 py-2 text-xs font-medium border rounded-lg transition-all capitalize ${
                        theme.buttons.size === sz
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <SectionTitle>Layout</SectionTitle>
                <div className="space-y-3">
                  <div>
                    <Label>Container width</Label>
                    <select
                      value={theme.layout.containerWidth}
                      onChange={(e) => patchTheme({ layout: { ...theme.layout, containerWidth: e.target.value as "narrow" | "wide" | "full" } })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="narrow">Narrow (900px)</option>
                      <option value="wide">Wide (1280px)</option>
                      <option value="full">Full width</option>
                    </select>
                  </div>
                  <div>
                    <Label>Product columns</Label>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      value={theme.layout.productColumns}
                      onChange={(e) => patchTheme({ layout: { ...theme.layout, productColumns: Number(e.target.value) } })}
                      className="w-full accent-blue-600"
                    />
                    <p className="text-xs text-gray-500 text-center">{theme.layout.productColumns} columns</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Homepage ── */}
            {activeTab === "homepage" && (
              <div className="space-y-4">
                <SectionTitle>Hero Section</SectionTitle>
                <Toggle
                  label="Show hero"
                  checked={draft.homepage?.hero?.enabled ?? true}
                  onChange={(v) => patchHero({ enabled: v })}
                />
                <div>
                  <Label>Headline</Label>
                  <input
                    type="text"
                    value={draft.homepage?.hero?.title ?? ""}
                    onChange={(e) => patchHero({ title: e.target.value })}
                    maxLength={120}
                    placeholder={draft.name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <input
                    type="text"
                    value={draft.homepage?.hero?.subtitle ?? ""}
                    onChange={(e) => patchHero({ subtitle: e.target.value })}
                    maxLength={200}
                    placeholder={draft.description ?? ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label>Button text</Label>
                  <input
                    type="text"
                    value={draft.homepage?.hero?.buttonText ?? "Shop Now"}
                    onChange={(e) => patchHero({ buttonText: e.target.value })}
                    maxLength={40}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <SectionTitle>About Section</SectionTitle>
                  <Toggle
                    label="Show about"
                    checked={draft.homepage?.about?.enabled ?? true}
                    onChange={(v) => patchAbout({ enabled: v })}
                  />
                  <div className="mt-3">
                    <Label>Heading</Label>
                    <input
                      type="text"
                      value={draft.homepage?.about?.heading ?? ""}
                      onChange={(e) => patchAbout({ heading: e.target.value })}
                      maxLength={100}
                      placeholder={`About ${draft.name}`}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="mt-2">
                    <Label>Description</Label>
                    <textarea
                      value={draft.homepage?.about?.description ?? ""}
                      onChange={(e) => patchAbout({ description: e.target.value })}
                      rows={4}
                      maxLength={600}
                      placeholder={draft.description ?? "Tell your story…"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <SectionTitle>Sections</SectionTitle>
                  <Toggle
                    label="Featured products"
                    checked={draft.homepage?.featuredProducts?.enabled ?? true}
                    onChange={(v) => patchHomepage({ featuredProducts: { enabled: v } })}
                  />
                  <Toggle
                    label="Contact section"
                    checked={draft.homepage?.contact?.enabled ?? true}
                    onChange={(v) => patchHomepage({ contact: { enabled: v } })}
                  />
                </div>
              </div>
            )}

            {/* ── Social ── */}
            {activeTab === "social" && (
              <div className="space-y-4">
                <SectionTitle>Social Links</SectionTitle>
                {[
                  { key: "instagram" as const, label: "Instagram URL" },
                  { key: "facebook"  as const, label: "Facebook URL"  },
                  { key: "youtube"   as const, label: "YouTube URL"   },
                  { key: "whatsapp"  as const, label: "WhatsApp (phone number or wa.me link)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <input
                      type="text"
                      value={draft.socialLinks?.[key] ?? ""}
                      onChange={(e) => patchSocial({ [key]: e.target.value })}
                      placeholder={
                        key === "whatsapp"
                          ? "9876543210"
                          : `https://${key}.com/yourhandle`
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <SectionTitle>Contact Visibility</SectionTitle>
                  <Toggle
                    label="Show email on storefront"
                    checked={draft.contactSettings?.showEmail ?? false}
                    onChange={(v) => patchContact({ showEmail: v })}
                  />
                  <Toggle
                    label="Show phone on storefront"
                    checked={draft.contactSettings?.showPhone ?? false}
                    onChange={(v) => patchContact({ showPhone: v })}
                  />
                </div>
              </div>
            )}

            {/* ── SEO ── */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <SectionTitle>SEO</SectionTitle>
                <div>
                  <Label>Page title (max 70 characters)</Label>
                  <input
                    type="text"
                    value={draft.seo?.title ?? ""}
                    onChange={(e) => patchSeo({ title: e.target.value })}
                    maxLength={70}
                    placeholder={`${draft.name} — Banavoo`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {(draft.seo?.title ?? "").length}/70
                  </p>
                </div>
                <div>
                  <Label>Meta description (max 170 characters)</Label>
                  <textarea
                    value={draft.seo?.description ?? ""}
                    onChange={(e) => patchSeo({ description: e.target.value })}
                    rows={3}
                    maxLength={170}
                    placeholder={draft.description ?? ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {(draft.seo?.description ?? "").length}/170
                  </p>
                </div>
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                  These fields control how your store appears in Google search results and social media shares.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Preview pane */}
        <main className="flex-1 overflow-auto bg-gray-200 flex flex-col items-center p-6">
          <div
            style={{
              width:     previewWidth,
              minWidth:  previewMode === "desktop" ? undefined : previewWidth,
              maxWidth:  "100%",
              transition: "width 0.25s ease",
            }}
            className="bg-white shadow-xl rounded-lg overflow-hidden"
          >
            <StorefrontRenderer store={draft} email={null} phone={null} />
          </div>
        </main>
      </div>
    </div>
  );
}
