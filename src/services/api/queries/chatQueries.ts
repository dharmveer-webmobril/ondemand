import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import EndPoints from '../EndPoints';

// Types for API Response
export interface ConversationParticipant {
  _id: string;
  name: string;
  email: string;
  contact: string;
  profileImage?: string;
  [key: string]: any;
}

export interface ConversationBooking {
  _id: string;
  bookingId: string;
  spId: string;
  customerId: string;
  date: string;
  time: string;
  bookingStatus: string;
  paymentStatus: string;
  [key: string]: any;
}

export interface Conversation {
  _id: string;
  participantOne: ConversationParticipant;
  participantOneType: string;
  participantTwo: ConversationParticipant;
  participantTwoType: string;
  bookingId: ConversationBooking;
  conversationType: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSentBy: string;
  participantOneUnreadCount: number;
  participantTwoUnreadCount: number;
  status: boolean;
  participantOneMuted: boolean;
  participantTwoMuted: boolean;
  createdAt: string;
  updatedAt: string;
  chatTitle: string;
}

export interface ConversationsResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetConversationsParams {
  page?: number;
  limit?: number;
}

/**
 * Get conversations list
 * @param params - Query parameters (page, limit)
 * @param enabled - Whether the query should run
 */
const CONVERSATIONS_PAGE_SIZE = 10;
export const useGetConversationsInfinite = (enabled: boolean = true) => {
  return useInfiniteQuery<ConversationsResponse, Error>({
    queryKey: ['conversations-infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(pageParam));
      queryParams.append('limit', String(CONVERSATIONS_PAGE_SIZE));
      const url = `${EndPoints.GET_CONVERSATIONS}?${queryParams.toString()}`;
      console.log('url-----useGetConversationsInfinite', url);
      const response = await axiosInstance.get<ConversationsResponse>(url);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (!pagination || pagination.page >= pagination.pages) return undefined;
      return pagination.page + 1;
    },
    enabled,
    staleTime: 30000,
  });
};
export const useGetConversations = (params: GetConversationsParams = {}, enabled: boolean = true) => {
  return useQuery<ConversationsResponse, Error>({
    queryKey: ['conversations', params.page, params.limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const url = `${EndPoints.GET_CONVERSATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axiosInstance.get<ConversationsResponse>(url);
      return response.data;
    },
    enabled: enabled,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Invalidate conversations query cache
 * Useful after sending a message or when conversation list needs to be refreshed
 */
export const useInvalidateConversations = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };
};

// Message Types - Matching actual API response
export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType?: string;
  senderName?: string;
  senderProfileImage?: string;
  receiverId: string;
  receiverType?: string;
  message: string; // Note: API uses 'message' not 'text'
  messageType?: string;
  mediaUrl?: string;
  mediaSize?: number;
  mediaDuration?: number;
  isRead?: boolean;
  readAt?: string;
  replyTo?: string | null;
  replyToMessage?: string;
  isForwarded?: boolean;
  forwardedFrom?: string | null;
  isEdited?: boolean;
  editedAt?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  bookingId?: string;
  status?: boolean;
  reactions?: any[];
  createdAt: string;
  updatedAt: string;
  senderDetails?: any;
  receiverDetails?: any;
  [key: string]: any;
}

export interface MessagesResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch messages for a conversation (normal API get with page number).
 * Use this with manual state: call with page 1 for initial load, then increment page and append on load more.
 */
export const fetchMessages = async (
  conversationId: string,
  page: number,
  limit: number = 20
): Promise<MessagesResponse> => {
  const response = await axiosInstance.get<MessagesResponse>(
    `${EndPoints.GET_CONVERSATION_MESSAGES}/${conversationId}/messages?page=${page}&limit=${limit}`,
  );
  return response.data;
};

/**
 * Invalidate messages query cache
 * Useful after sending a message
 */
export const useInvalidateMessages = () => {
  const queryClient = useQueryClient();
  
  return (conversationId?: string) => {
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  };
};

export interface CreateOrGetConversationParams {
  participantTwoId: string;
  participantTwoType: string;
  conversationType?: string;
  bookingId?: string;
}

export interface CreateOrGetConversationResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: Conversation;
}

/**
 * Create or get a conversation
 * @param params - Conversation parameters
 */
export const createOrGetConversation = async (
  params: CreateOrGetConversationParams
): Promise<CreateOrGetConversationResponse> => {
  console.log('params-----createOrGetConversation', params);
  const response = await axiosInstance.post<CreateOrGetConversationResponse>(
    EndPoints.CREATE_OR_GET_CONVERSATION,
    params
  );
  return response.data;
};

export interface MarkConversationAsReadResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: any;
}

/**
 * Mark all messages in a conversation as read
 * @param conversationId - The conversation ID
 */
export const markConversationAsRead = async (
  conversationId: string
): Promise<MarkConversationAsReadResponse> => {
  console.log('conversationId-----markConversationAsRead', conversationId);
  let url = `${EndPoints.MARK_CONVERSATION_AS_READ}/${conversationId}/read`;
  console.log('EndPoints.MARK_CONVERSATION_AS_READ-----markConversationAsRead', url);
  const response = await axiosInstance.put<MarkConversationAsReadResponse>(
    url
  );
  return response.data;
};

export interface BookingChatDetailsResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    conversation: Conversation;
    messages: ChatMessage[];
  };
}

/**
 * Get chat details by booking ID (async function for direct calls)
 * @param bookingId - The booking ID
 */
export const getBookingChatDetails = async (
  bookingId: string
): Promise<BookingChatDetailsResponse> => {
  const response = await axiosInstance.get<BookingChatDetailsResponse>(
    `${EndPoints.GET_BOOKING_CHAT_DETAILS}/${bookingId}`
  );
  return response.data;
};

/**
 * React Query hook to get chat details by booking ID
 * @param bookingId - The booking ID
 * @param enabled - Whether the query should run (defaults to true if bookingId exists)
 */
export const useGetBookingChatDetails = (
  bookingId: string | null | undefined,
  enabled: boolean = true
) => {
  return useQuery<BookingChatDetailsResponse, Error>({
    queryKey: ['bookingChatDetails', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('Booking ID is required');
      const response = await axiosInstance.get<BookingChatDetailsResponse>(
        `${EndPoints.GET_BOOKING_CHAT_DETAILS}/${bookingId}`
      );
      return response.data;
    },
    enabled: enabled && !!bookingId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};