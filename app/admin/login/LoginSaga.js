import { all, put, takeLatest } from "redux-saga/effects";
import { componentKey, setIsLoggedIn, setIsTokenRefreshing } from "./LoginSlice";
import AuthDataService from "../../../services/AuthDataService";
import store from "../../../store/store";
// import {
//   hideLoader,
//   showLoader,
// } from "../../component-lib/Molecules/loader/LoaderSlice";
// import { eventEHRCustomToastMessage } from "../../component-lib/Atoms/custom-toast-message/EventEHRCustomToastMessage";
// import { encryptData } from "../../utils/cryptoUtils";

export const { login, forgotUserPassword, resetUserPassword, getLogInInfo, refreshToken } = {
  login: (payload) => {
    return {
      type: "USER/LOG_IN",
      payload,
    };
  },
  forgotUserPassword: (payload) => {
    return {
      type: "USER/FORGOT_PASSWORD",
      payload,
    };
  },
  resetUserPassword: (payload) => {
    return {
      type: "USER/RESET_PASSWORD",
      payload,
    };
  },
  getLogInInfo: (payload) => {
    return {
      type: "USER/LOGIN_INFO",
      payload,
    };
  },
  refreshToken: (payload) => {
    return {
      type: "USER/REFRESH_TOKEN",
      payload,
    };
  },
};

function* loginAsync(action) {
  try {
    // yield put(showLoader());
    const userData = {
      email: action?.payload?.email,
      password: action?.payload.password,
      // EncodeDecodeUtils.encode(action.payload.password)
    };
    const response = yield AuthDataService.login(userData);
    const { status } = response;
    if (status) {
      const { data } = response;
      // const encryptedUserData = encryptData(data?.user);

      if (!data?.user) {
        throw { title: "Encryption failed", subTitle: "User data could not be stored." };
        
      }

      // eventEHRCustomToastMessage({
      //   title: `${data?.user?.name}` || "Login",
      //   subTitle: `Welcome! You’ve logged in successfully.`,
      //   status: "success",
      // });

      if (action?.payload?.rememberMe) {
        // IF REMEMBER ME TRUE, SET DATA TO LOCAL STORAGE
        localStorage.setItem("token", JSON.stringify(data?.sessionJwt));
        localStorage.setItem("refreshToken", JSON.stringify(data?.refreshJwt));
        // localStorage.setItem("loginUserData", JSON.stringify(data?.user));
        localStorage.setItem("loginUserData", data?.user);

        localStorage.setItem(
          "role",
          JSON.stringify(data?.user?.roleNames?.[0])
        );
        localStorage.setItem(
          "loginUserId",
          JSON.stringify(data?.user?.customAttributes?.userId)
        );
        // Store facilities data
        if (data?.facilities) {
          localStorage.setItem("facilities", JSON.stringify(data?.facilities));
        }
      } else {
        // IF REMEMBER ME FALSE, SET DATA TO SESSION STORAGE
        sessionStorage.setItem("token", JSON.stringify(data?.sessionJwt));
        sessionStorage.setItem(
          "refreshToken",
          JSON.stringify(data?.refreshJwt)
        );
        // sessionStorage.setItem("loginUserData", JSON.stringify(data?.user));
        sessionStorage.setItem("loginUserData", data?.user);

        sessionStorage.setItem(
          "role",
          JSON.stringify(data?.user?.roleNames?.[0])
        );
        sessionStorage.setItem(
          "loginUserId",
          JSON.stringify(data?.user?.customAttributes?.userId)
        );
        // Store facilities data
        if (data?.facilities) {
          sessionStorage.setItem("facilities", JSON.stringify(data?.facilities));
        }
      }
      yield put(setIsLoggedIn(true));
    }
  } catch (error) {
    // USE TOAST MESSAGE LIKE THIS
    // eventEHRCustomToastMessage({
    //   title: error?.title || error?.response?.data?.message || "Error",
    //   // subTitle: error?.subTitle || "Something went wrong, please try again",
    //   status: "error",
    // });

    console.log("err: ", error);
  } finally {
    // yield put(hideLoader());
    // yield put(setLoginLoadingState({ state: PAGE_STATE.PAGE_READY }));
  }
}
function* forgotUserPasswordAsync(action) {
  // yield put(showLoader());

  try {
    const { email, navigate } = action.payload;
    const response = yield AuthDataService.forgotPassword(email);
    if (response?.status) {
      eventEHRCustomToastMessage({
        title: `Password reset email sent successfully`,
        status: "success",
      });
      navigate("/email-check");
    }
  } catch (error) {
    // eventEHRCustomToastMessage({
    //   title: `${error?.response?.data?.message}`,
    //   status: "error",
    // });
    console.log("err: ", error);
  } finally {
    // yield put(hideLoader());
  }
}

function* getLogInInfoAsync() {
  try {
    const response = yield AuthDataService.getLogInDetails();
    const { status } = response.data;
    if (status) {
      // Handle login info
    }
  } catch (error) {
    console.log("err: ", error);
  }
}

function* refreshTokenAsync(action) {
  try {
    yield put(setIsTokenRefreshing(true));
    // yield put(showLoader());
    
    const refreshTokenValue = action.payload;
    
    const refreshData = {
      refreshJwt: refreshTokenValue,
      portal: "Admin"
    };
    

    const response = yield AuthDataService.refreshToken(refreshData);
    const { status } = response;
    
    if (status) {
      const { data } = response;
      
      // Encrypt user data if available
      let encryptedUserData = null;
      if (data?.user) {
        // encryptedUserData = encryptData(data.user);
        
        if (!data?.user) {
          throw { title: "Encryption failed", subTitle: "User data could not be stored." };
        }
      }
      
      // Update tokens and user data in storage - exactly like login API
      const isRememberMe = localStorage.getItem("token") !== null;
      
      if (isRememberMe) {
        // IF REMEMBER ME TRUE, SET DATA TO LOCAL STORAGE
        localStorage.setItem("token", JSON.stringify(data?.sessionJwt));
        localStorage.setItem("refreshToken", JSON.stringify(data?.refreshJwt));
        localStorage.setItem("loginUserData", data?.user);
        localStorage.setItem("role", JSON.stringify(data?.user?.roleNames?.[0]));
        localStorage.setItem("loginUserId", JSON.stringify(data?.user?.customAttributes?.userId));
        // Store facilities data
        if (data?.facilities) {
          localStorage.setItem("facilities", JSON.stringify(data?.facilities));
        }
      } else {
        // IF REMEMBER ME FALSE, SET DATA TO SESSION STORAGE
        sessionStorage.setItem("token", JSON.stringify(data?.sessionJwt));
        sessionStorage.setItem("refreshToken", JSON.stringify(data?.refreshJwt));
        sessionStorage.setItem("loginUserData", data?.user);
        sessionStorage.setItem("role", JSON.stringify(data?.user?.roleNames?.[0]));
        sessionStorage.setItem("loginUserId", JSON.stringify(data?.user?.customAttributes?.userId));
        // Store facilities data
        if (data?.facilities) {
          sessionStorage.setItem("facilities", JSON.stringify(data?.facilities));
        }
      }

      yield put(setIsLoggedIn(true));
      
      // Return the new token for the interceptor
      return data?.sessionJwt;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Don't clear storage or redirect to login immediately
    // Let the app handle the error state
    console.log("Refresh token error details:", error);
    throw error;
  } finally {
    yield put(setIsTokenRefreshing(false));
    // yield put(hideLoader());
  }
}

function* rootSaga() {
  yield all([
    takeLatest(login().type, loginAsync),
    takeLatest(forgotUserPassword().type, forgotUserPasswordAsync),
    takeLatest(getLogInInfo().type, getLogInInfoAsync),
    takeLatest(refreshToken().type, refreshTokenAsync),
  ]);
}

store.sagaManager.addSaga(componentKey, rootSaga);
