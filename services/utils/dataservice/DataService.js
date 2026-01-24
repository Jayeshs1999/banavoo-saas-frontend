import axios from "axios";
import { getToken } from "../../../utils/index";
axios.defaults.withCredentials = true;

class DataService {
  static token = null;

  constructor() {
    this._baseUrl = process.env.REACT_APP_API_URL;

    // Set up an Axios response interceptor
    this._setupInterceptors();
  }

  static getToken = () => {
    const storedToken = getToken();
    if (storedToken) {
      DataService.token = storedToken;
      return true;
    }
    return false;
  };

  get(relativeUrl, config = {}) {
    try {
      return axios.get(this._generateUrl(relativeUrl), this._config(config));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  post(relativeUrl, data = null, config = {}) {
    try {
      return axios.post(
        this._generateUrl(relativeUrl),
        data,
        this._config(config)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  put(relativeUrl, data = null, config = {}) {
    try {
      return axios.put(
        this._generateUrl(relativeUrl),
        data,
        this._config(config)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  patch(relativeUrl, data = null, config = {}) {
    try {
      return axios.patch(
        this._generateUrl(relativeUrl),
        data,
        this._config(config)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  delete(relativeUrl, data = null, config = {}) {
    try {
      if (data)
        return axios.delete(
          this._generateUrl(relativeUrl),
          { data: data },
          this._config(config)
        );
      else
        return axios.delete(
          this._generateUrl(relativeUrl),
          this._config(config)
        );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  setCommonHeader(key, value) {
    axios.defaults.headers.common[key] = value;
  }

  setBaseUrl(baseUrl) {
    this._baseUrl = baseUrl;
  }

  _generateUrl(relativeUrl) {
    return `${this._baseUrl}/${relativeUrl}`;
  }

  _config(config = {}) {
    if (!DataService.token) {
      DataService.getToken(); // Retrieve the token if it's not set
    }
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: DataService?.token
          ? `Bearer ${JSON.parse(DataService?.token)}`
          : undefined,
      },
      ...config,
    };
  }

  _setupInterceptors() {
    // Response interceptor
    axios.interceptors.response.use(
      (response) => response, // If response is successful, return it
      (error) => {
        console.log("error", error.response.status);

        if (error.response && error.response.status === 401) {
          // Handle unauthorized error (token expired)
          console.error("Session expired. Logging out...");
          const errorMessage = error.response?.data?.message;
          if (
            [
              "User not found",
              "Invalid signin credentials",
              "Your account is disabled. Please contact your provider admin for assistance.",
            ]?.includes(errorMessage)
          ) {
            // Handle specific error cases
          } else {
            this._handleLogout();
          }
        }
        return Promise.reject(error); // Always reject the error so it can be caught downstream
      }
    );
  }

  _handleLogout() {
    localStorage.clear(); // Custom function to clear tokens from storage
    sessionStorage.clear();
    // Clear tokens and redirect the user to the login page
    // localStorage.clear(); // Custom function to clear tokens from storage
    window.location.href = "/login"; // Redirect to login page
  }
}

export default DataService;
