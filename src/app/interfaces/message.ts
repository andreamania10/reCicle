export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: 0 | 1;
  sent_at: string;
}

export interface PrivateMessagePayload {
  conversation_id: number;
  sender_id: number;
  content: string;
}
