export type MessageCategory =
  | "Academic"
  | "Bullying/Social"
  | "Class Policy"
  | "Personal Support"
  | "Other";

export type MessageStatus = "unread" | "replied";

export interface MessageReply {
  text: string;
  repliedAt: number | string;
  teacherEmail: string;
  teacherName?: string;
}

export interface StudentMessage {
  id: string;
  original_text: string;
  refined_text: string;
  category: MessageCategory;
  timestamp: number | string;
  status: MessageStatus;
  studentSessionId: string;
  moodEmoji?: string;
  toneSummary?: string;
  keyPoints?: string[];
  reply?: MessageReply;
  isUrgent?: boolean;
}

export interface TrendTheme {
  title: string;
  count: number;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface EmpatheticAction {
  actionTitle: string;
  description: string;
  suggestedTimeline: string;
  difficulty: "easy" | "moderate";
}

export interface TrendSummary {
  id?: string;
  createdAt: number | string;
  executiveSummary: string;
  sentimentScore: number;
  sentimentLabel: string;
  keyThemes: TrendTheme[];
  empatheticActions: EmpatheticAction[];
  urgentAlerts: string[];
  messageCount: number;
}

export type AppView = "student" | "teacher";
export type TeacherTab = "inbox" | "analytics" | "insights";
export type StudentTab = "compose" | "history" | "privacy";
