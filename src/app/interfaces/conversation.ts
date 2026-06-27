export interface Conversation {
  id: number;
  article_id: number;
  buyer_id: number;
  seller_id: number;
}

export interface ConversationInbox {
  conversation_id: number;
  article_id: number;
  buyer_id: number;
  seller_id: number;
  created_at: string;
  article_title: string;
  article_price: number;
  buyer_name: string;
  seller_name: string;
}

export interface ChatContext {
  partnerName: string;
  articleTitle: string;
  articlePrice?: number;
  partnerId?: number;
}
