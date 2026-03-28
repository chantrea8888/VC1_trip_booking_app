export type MemberRole = 'Leader' | 'Member' | string;

export interface Member {
  user_email: string;
  user_name: string;
  role: MemberRole;
}

export interface MessageAttachment {
  name: string;
  mimeType: string;
  dataUrl?: string;
}

export interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  text: string;
  created_at: string;
  type?: 'system' | 'user' | string;
  attachment?: MessageAttachment;
}

export interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  votes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface StoredGroup {
  id: string;
  accessCode: string;
  name: string;
  members: Member[];
  messages: Message[];
  polls: Poll[];
  itinerary: ItineraryItem[];
}

