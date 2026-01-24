import React, { useEffect } from "react";
import store from "./store";

export default function useFlexCleanup(key) {
  useEffect(() => {
    return () => {
      store.reducerManager.remove(key);
    };
  }, [key]);
}
