"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { Store } from "../../types";
import { storeAPI, CreateStorePayload, UpdateStorePayload } from "../../services/api";
import { useAuth } from "./AuthContext";

// ─── Context type ──────────────────────────────────────────────────────────────

interface StoreContextType {
  currentStore: Store | null;
  storeLoading: boolean;
  fetchMyStore: () => Promise<void>;
  createStore: (payload: CreateStorePayload) => Promise<{ success: boolean; error?: string }>;
  updateStore: (payload: UpdateStorePayload) => Promise<{ success: boolean; error?: string }>;
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

  // Fetch the store whenever the user becomes a seller (or on mount if already seller)
  const fetchMyStore = useCallback(async () => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.getMyStore();
      if (res.success && res.data) {
        setCurrentStore(res.data);
      } else {
        setCurrentStore(null);
      }
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

  // ── Create store ──────────────────────────────────────────────────────────
  const createStore = async (
    payload: CreateStorePayload
  ): Promise<{ success: boolean; error?: string }> => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.createStore(payload);
      if (res.success && res.data) {
        setCurrentStore(res.data);
        // Update currentUser in AuthContext so role + store info is immediately accurate
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            role: "seller",
            store: {
              id:     res.data.id,
              name:   res.data.name,
              slug:   res.data.slug,
              status: res.data.status,
            },
          });
        }
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to create store." };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create store.";
      return { success: false, error: message };
    } finally {
      setStoreLoading(false);
    }
  };

  // ── Update store ──────────────────────────────────────────────────────────
  const updateStore = async (
    payload: UpdateStorePayload
  ): Promise<{ success: boolean; error?: string }> => {
    setStoreLoading(true);
    try {
      const res = await storeAPI.updateMyStore(payload);
      if (res.success && res.data) {
        setCurrentStore(res.data);
        // Keep user's embedded store summary in sync
        if (currentUser?.store) {
          setCurrentUser({
            ...currentUser,
            store: {
              ...currentUser.store,
              name:   res.data.name,
              status: res.data.status,
            },
          });
        }
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to update store." };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update store.";
      return { success: false, error: message };
    } finally {
      setStoreLoading(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{ currentStore, storeLoading, fetchMyStore, createStore, updateStore }}
    >
      {children}
    </StoreContext.Provider>
  );
};
