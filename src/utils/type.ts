// src/types.ts
export interface User {
  email: string;
  fcmToken: string;
  name: string;
  id: string;
  mobile?: string;
  status: number;
  token: string;
}

export interface ChatUser {
  chat_room_id?: string;
  email?: string;
  image?: string;
  loginType?: string;
  mobileNo?: string;
  name?: string;
  notificationStatus?: string;
  onlineStatus?: string;
  fcmToken?: string;
  userId?: string;
  userType?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  mobileNo: string;
  countryCode: string;
  deviceId: string;
  userFcmToken: string | null;
  providerFcmToken: string | null;
  roleType: string; // limit roles to allowed strings
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  // deviceId?: string;
  // userFcmToken: string | null;
  // providerFcmToken: string | null;
  // roleType: string; // limit roles to allowed strings
}


export interface ResenOtpReq {
  token: string;
}
export interface VerifyOtpReq {
  otp: string | number;
}
export interface ExtraHeaders {
  [key: string]: string;
}
