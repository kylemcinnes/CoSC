export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TranscriptSegment = {
  offsetSec: number;
  text: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          notify_email: boolean;
          notify_sms: boolean;
          notify_push: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          notify_email?: boolean;
          notify_sms?: boolean;
          notify_push?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          notify_email?: boolean;
          notify_sms?: boolean;
          notify_push?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          starts_at: string;
          is_live: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          starts_at: string;
          is_live?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          starts_at?: string;
          is_live?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sermons: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_by: string | null;
          preached_at: string;
          duration_seconds: number | null;
          video_url: string | null;
          audio_url: string | null;
          thumbnail_path: string | null;
          key_verses: string[];
          tags: string[];
          bible_books: string[];
          transcript: TranscriptSegment[] | Json;
          embedding: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_by?: string | null;
          preached_at: string;
          duration_seconds?: number | null;
          video_url?: string | null;
          audio_url?: string | null;
          thumbnail_path?: string | null;
          key_verses?: string[];
          tags?: string[];
          bible_books?: string[];
          transcript?: TranscriptSegment[] | Json;
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          created_by?: string | null;
          preached_at?: string;
          duration_seconds?: number | null;
          video_url?: string | null;
          audio_url?: string | null;
          thumbnail_path?: string | null;
          key_verses?: string[];
          tags?: string[];
          bible_books?: string[];
          transcript?: TranscriptSegment[] | Json;
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          keys: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          keys: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          keys?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_outbox: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          channel: "email" | "sms" | "push";
          notification_type: "reminder_24h" | "reminder_1h" | "live_now";
          payload: Json;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          channel: "email" | "sms" | "push";
          notification_type: "reminder_24h" | "reminder_1h" | "live_now";
          payload?: Json;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          channel?: "email" | "sms" | "push";
          notification_type?: "reminder_24h" | "reminder_1h" | "live_now";
          payload?: Json;
          created_at?: string;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      event_reminders_sent: {
        Row: {
          event_id: string;
          reminder_type: "reminder_24h" | "reminder_1h";
          sent_at: string;
        };
        Insert: {
          event_id: string;
          reminder_type: "reminder_24h" | "reminder_1h";
          sent_at?: string;
        };
        Update: {
          event_id?: string;
          reminder_type?: "reminder_24h" | "reminder_1h";
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
