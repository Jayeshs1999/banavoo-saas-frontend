"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { Store, StoreTheme, ImageField } from "../../types";
import {
  storeAPI,
  CreateStorePayload,
  UpdateStorePayload,
  UpdateBrandingPayload,
} from "../../services/api";
import { useAuth } from "./AuthContext";

// ─── Context type ──────────────────────────────────────────────────────────────

interface StoreContextType {
  currentStore:   Store | null;
  storeLoading:   boolean;
  fetchMyStore:   () => Promise<void>;
  createStore:    (payload: CreateStorePayload)    => Promise<{ success: boolean; error?: string }>;
  updateStore:    (payload: UpdateStorePayload)    => Promise<{ success: boolean; error?: string }>;
  updateBranding: (payload: UpdateBrandingPayload) => Promise<{ success: boolean; error?: string }>;
  updateTheme:    (theme: Partial<StoreTheme>)     => Promise<{ success: boolean; error?: string }>;
  uploadLogo:     (file: File) => Promise<{ success: boolean; data?: ImageField; error?: string }>;
  deleteLogo:     ()           => Promise<{ success: boolean; error?: string }>;
  uploadBanner:   (file: File) => Promise<{ success: boolean; data?: ImageField; error?: string }>;
  deleteBanner:   ()           => Promise<{ success: boolean; error?: string }>;
  uploadFavicon:  (file: File) => Promise<{ success: boolean; data?: ImageField; error?: string }>;
  deleteFavicon:  ()           => Promise<{ success: boolean; error?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};

// ─── Provider ──────────────────────────────────────────────────────────────────

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchMyStore = useCallback(async () => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.getMyStore();
      setCurrentStore(res.success && res.data ? res.data : null);
    } catch {
      setCurrentStore(null);
    } finally {
      setStoreLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "seller") {
      fetchMyStore();
    } else {
      setCurrentStore(null);
    }
  }, [currentUser?.role, fetchMyStore]);

  // ── Helper to wrap every mutation ────────────────────────────────────────
  async function withLoading<T>(
    fn: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    setStoreLoading(true);
    try {
      const data = await fn();
      return { success: true, data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed.";
      return { success: false, error: message };
    } finally {
      setStoreLoading(false);
    }
  }

  // ── Create store ──────────────────────────────────────────────────────────
  const createStore = async (
    payload: CreateStorePayload
  ): Promise<{ success: boolean; error?: string }> => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.createStore(payload);
      if (res.success && res.data) {
        setCurrentStore(res.data);
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            role:  "seller",
            store: { id: res.data.id, name: res.data.name, slug: res.data.slug, status: res.data.status },
          });
        }
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to create store." };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create store." };
    } finally {
      setStoreLoading(false);
    }
  };

  // ── Update basic store info ───────────────────────────────────────────────
  const updateStore = async (
    payload: UpdateStorePayload
  ): Promise<{ success: boolean; error?: string }> => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.updateMyStore(payload);
      if (res.success && res.data) {
        setCurrentStore(res.data);
        if (currentUser?.store) {
          setCurrentUser({ ...currentUser, store: { ...currentUser.store, name: res.data.name, status: res.data.status } });
        }
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to update store." };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update store." };
    } finally {
      setStoreLoading(false);
    }
  };

  // ── Update full branding (theme + homepage + social + seo + contact) ──────
  const updateBranding = async (
    payload: UpdateBrandingPayload
  ): Promise<{ success: boolean; error?: string }> => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.updateBranding(payload);
      if (res.success && res.data) {
        setCurrentStore(res.data);
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to save customization." };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to save customization." };
    } finally {
      setStoreLoading(false);
    }
  };

  // ── Update theme only ─────────────────────────────────────────────────────
  const updateTheme = async (
    theme: Partial<StoreTheme>
  ): Promise<{ success: boolean; error?: string }> => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.updateTheme(theme);
      if (res.success && res.data && currentStore) {
        setCurrentStore({ ...currentStore, theme: res.data });
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to update theme." };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update theme." };
    } finally {
      setStoreLoading(false);
    }
  };

  // ── Image uploads ─────────────────────────────────────────────────────────
  const uploadLogo = async (
    file: File
  ): Promise<{ success: boolean; data?: ImageField; error?: string }> => {
    const result = await withLoading(() => storeAPI.uploadLogo(file));
    if (result.success && result.data?.data && currentStore) {
      setCurrentStore({ ...currentStore, logo: result.data.data });
    }
    return { success: result.success, data: result.data?.data, error: result.error };
  };

  const deleteLogo = async (): Promise<{ success: boolean; error?: string }> => {
    const result = await withLoading(() => storeAPI.deleteLogo());
    if (result.success && currentStore) {
      setCurrentStore({ ...currentStore, logo: { url: null, publicId: null } });
    }
    return { success: result.success, error: result.error };
  };

  const uploadBanner = async (
    file: File
  ): Promise<{ success: boolean; data?: ImageField; error?: string }> => {
    const result = await withLoading(() => storeAPI.uploadBanner(file));
    if (result.success && result.data?.data && currentStore) {
      setCurrentStore({ ...currentStore, banner: result.data.data });
    }
    return { success: result.success, data: result.data?.data, error: result.error };
  };

  const deleteBanner = async (): Promise<{ success: boolean; error?: string }> => {
    const result = await withLoading(() => storeAPI.deleteBanner());
    if (result.success && currentStore) {
      setCurrentStore({ ...currentStore, banner: { url: null, publicId: null } });
    }
    return { success: result.success, error: result.error };
  };

  const uploadFavicon = async (
    file: File
  ): Promise<{ success: boolean; data?: ImageField; error?: string }> => {
    const result = await withLoading(() => storeAPI.uploadFavicon(file));
    if (result.success && result.data?.data && currentStore) {
      setCurrentStore({ ...currentStore, favicon: result.data.data });
    }
    return { success: result.success, data: result.data?.data, error: result.error };
  };

  const deleteFavicon = async (): Promise<{ success: boolean; error?: string }> => {
    const result = await withLoading(() => storeAPI.deleteFavicon());
    if (result.success && currentStore) {
      setCurrentStore({ ...currentStore, favicon: { url: null, publicId: null } });
    }
    return { success: result.success, error: result.error };
  };

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        storeLoading,
        fetchMyStore,
        createStore,
        updateStore,
        updateBranding,
        updateTheme,
        uploadLogo,
        deleteLogo,
        uploadBanner,
        deleteBanner,
        uploadFavicon,
        deleteFavicon,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
