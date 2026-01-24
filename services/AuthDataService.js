import AppDataService from "./AppDataService";

const COMMON_BASE = "auth";

export default class AuthDataService {
  static async login(data) {
    return await AppDataService.post(`${COMMON_BASE}/admin/login`, data);
  }

  static async changePassword(data) {
    return await AppDataService.post(`${COMMON_BASE}/change-password`, data);
  }

  static async forgotPassword(data) {
    return await AppDataService.post(`${COMMON_BASE}/forgot/password`, {
      email: data,
    });
  }

  static async resetPassword(data) {
    return await AppDataService.post(`${COMMON_BASE}/password-reset`, data);
  }

  static async getLogInDetails() {
    return await AppDataService.get(`providergroup`);
  }

  static async refreshToken(data) {
    return await AppDataService.post(`${COMMON_BASE}/refresh/token`, data);
  }
}
