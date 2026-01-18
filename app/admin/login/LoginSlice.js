import store from "@/store/store";
export const componentKey = "AUTH_SLICE";

const { actions } = store.reducerManager.add({
  key: componentKey,
  addedReducers: {
    setLoginLoadingState: (state, action) => {
      state.loginLoadingState = action.payload;
    },

    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },

    setIsTokenRefreshing: (state, action) => {
      state.isTokenRefreshing = action.payload;
    },
    setLoginInfo: (state, action) => {
      state.loginInfo = action.payload;
    }
  },
  initialReducerState: {
    isLoggedIn: false,
    loginLoadingState: { state: "", message: "Loading..." },
    isTokenRefreshing: false,
  },
});

export const { setLoginLoadingState, setIsLoggedIn, setIsTokenRefreshing, setLoginInfo } = actions;
