import axios from "axios";

export const handleResponse = (navigateCb) => {
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (axios.isCancel(error)) {
                return Promise.reject(error);
            }

            if (error.response && error.response.status === 401) {
                navigateCb("/login");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else if (error.response && error.response.status === 400) {
                return error.response;
            }
            else {
                throw error;
            }
        }
    );
};