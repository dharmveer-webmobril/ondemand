// src/types.ts
export interface User  {
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
  full_name: string;
  email: string;
  password: string;
  mobile: string;
  fcmToken: string|null;
  device_id: string;
  device_type: string;
}


export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  fcmToken: string|null;
  device_id: string;
  device_type: string;
}
 

export interface ResenOtpReq {
  email: string;
}
export interface VerifyOtpReq {
  otp: string|number;
}
export interface ExtraHeaders {
  [key: string]: string;
}
