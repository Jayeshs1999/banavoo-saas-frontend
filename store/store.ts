import { configureStore } from "@reduxjs/toolkit";
// import exampleReducer from "./exampleSlice"; // ← add your slices here

/**
 * Redux store.
 *
 * Usage:
 *   import { store } from "../store/store";
 *   import { Provider } from "react-redux";
 *
 *   <Provider store={store}>...</Provider>
 */
export const store = configureStore({
  reducer: {
    // example: exampleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
