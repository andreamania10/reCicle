export interface NotificationItem {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  read: boolean;
  type?: string;
  reference_id?: number;
  created_at?: string;
}

export interface NotificationsResponse {
  result?: NotificationItem[];
  results?: NotificationItem[];
  data?: NotificationItem[];
  notifications?: NotificationItem[];
}
