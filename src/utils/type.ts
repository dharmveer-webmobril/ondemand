export interface Chat {
  id: string;
  members: string[];
  lastMessage?: string;
  timestamp?: number;
}

export interface messageUser {
  userId: string | number;
  name: string;
}

export interface Message {
  _id: any;
  key?: string;
  createdAt: Date | number;
  text: string;
  user: messageUser;
}
 
export interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  loading: boolean;
  allUsers: ChatUser[];
  inboxUsers: ChatUser[];
  userData: ChatUser | null;
  fetchMessages: (chatId: string, timeStamp?: any) => Promise<void>;
  createUser: (userId: string, userObject: any) => void;
  createUserInbox: (obj: any, id: any, otherUserId: any) => void;
  sendMessage: (senderId: string, receiverId: string, message: string, senderInfo: messageUser) => void;

  fetchAllUsers: () => Promise<void>;
  getInboxUsers: (userId: string) => Promise<void>;
  deleteChatForBothUsers: (userId: string, otherUserId: string) => Promise<void>;
  toggleBlockUser: (userId: string, otherUserId: string, block: boolean) => void;
  muteBlockUser: (userId: string, otherUserId: string, block: boolean) => void;
  getUserMuteBlockStatus: (userId: string, otherUserId: string) => Promise<{ isBlocked: boolean; isMuted: boolean }>;
}

// Extend ChatUser to include inbox-related data
export interface ExtendedChatUser extends ChatUser {
  lastMessage?: string;
  timestamp?: number;
  isBlocked?: boolean;
}
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
  notificationStatus?: boolean;
  onlineStatus?: boolean;
  fcmToken?: string;
  userId?: string;
  roleType?: string;
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
