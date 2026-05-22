import axiosInstance from '../axiosInstance';
import EndPoints from '../EndPoints';

export interface AiAssistantMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  actions?: AiAssistantAction[];
  _local?: boolean;
}

export interface AiAssistantAction {
  type: 'book' | 'provider' | string;
  label?: string;
  url?: string;
}

export interface AiAssistantHistoryMeta {
  totalMessages: number;
  returnedMessages: number;
  hasMore: boolean;
  limit?: number;
}

export interface AiAssistantHistoryData {
  sessionId?: string;
  messages: AiAssistantMessage[];
  totalMessages?: number;
  returnedMessages?: number;
  limit?: number;
  hasMore?: boolean;
  hasMoreOlder?: boolean;
}

export interface AiAssistantChatData {
  sessionId?: string;
  reply: string;
  usedAi?: boolean;
  actions?: AiAssistantAction[];
  message?: AiAssistantMessage;
}

interface ApiEnvelope<T> {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: T;
}

const CHAT_TIMEOUT_MS = 120_000;

export async function fetchAiAssistantHistory(params?: {
  limit?: number;
  before?: string;
}): Promise<ApiEnvelope<AiAssistantHistoryData>> {
  const { data } = await axiosInstance.get<ApiEnvelope<AiAssistantHistoryData>>(
    EndPoints.AI_ASSISTANT_HISTORY,
    { params },
  );
  return data;
}

export async function sendAiAssistantMessage(payload: {
  message: string;
  contextSpId?: string;
}): Promise<ApiEnvelope<AiAssistantChatData>> {
  const { data } = await axiosInstance.post<ApiEnvelope<AiAssistantChatData>>(
    EndPoints.AI_ASSISTANT_CHAT,
    payload,
    { timeout: CHAT_TIMEOUT_MS },
  );
  return data;
}

export async function clearAiAssistantHistory(): Promise<
  ApiEnvelope<{ sessionId?: string }>
> {
  const { data } = await axiosInstance.delete<
    ApiEnvelope<{ sessionId?: string }>
  >(EndPoints.AI_ASSISTANT_HISTORY);
  return data;
}
