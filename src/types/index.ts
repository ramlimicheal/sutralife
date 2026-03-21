export type UserTier = "free" | "basic" | "premium" | "collector";
export type UserRole = "user" | "admin" | "creator";
export type MessageRole = "user" | "assistant";
export type SubscriptionStatus = "inactive" | "active" | "expired" | "cancelled";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  tier: UserTier;
  nsfw_enabled: boolean;
  age_verified: boolean;
  role: UserRole;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatar_url: string;
  category: string;
  traits: string[];
  speaking_style: string;
  system_prompt: string | null;
  is_premium: boolean;
  is_nsfw: boolean;
  is_published: boolean;
  rating: number;
  view_count: number;
  chat_count: number;
  creator_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  character_id: string;
  last_message_at: string;
  message_count: number;
  created_at: string;
  character?: Character;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface CharacterImage {
  id: string;
  character_id: string;
  image_url: string;
  is_nsfw: boolean;
  sort_order: number;
  created_at: string;
}

export interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface AdminSubscriber {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  status: "active" | "cancelled" | "past_due";
  amount: number;
  nextBilling: string;
}

export interface AdminStats {
  totalRevenue: number;
  activeSubscribers: number;
  premiumCount: number;
  churnRate: number;
}
