// TypeScript types for the YouTube sponsorship database schema
// This is a read-only database connection

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'twitter';

export interface SponsorshipDatabase {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string;
          name: string;
          normalized_name: string;
          website: string | null;
          description: string | null;
          primary_category: string | null;
          created_at: string;
          updated_at: string;
          search_vector: string | null;
        };
        Insert: never; // Read-only
        Update: never; // Read-only
      };
      brand_aliases: {
        Row: {
          id: string;
          brand_id: string;
          alias: string;
          normalized_alias: string;
          platform: Platform | null;
          created_at: string;
        };
        Insert: never; // Read-only
        Update: never; // Read-only
      };
      creators: {
        Row: {
          id: string;
          display_name: string;
          normalized_name: string;
          category: string | null;
          country_code: string | null;
          total_followers: number | null;
          created_at: string;
          updated_at: string;
          search_vector: string | null;
        };
        Insert: never; // Read-only
        Update: never; // Read-only
      };
      creator_accounts: {
        Row: {
          id: string;
          creator_id: string;
          platform: Platform;
          platform_user_id: string;
          username: string;
          normalized_username: string;
          url: string | null;
          followers: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never; // Read-only
        Update: never; // Read-only
      };
      videos: {
        Row: {
          id: string;
          platform: Platform;
          platform_video_id: string;
          creator_account_id: string;
          creator_id: string;
          title: string | null;
          description: string | null;
          language_code: string | null;
          category: string | null;
          published_at: string | null;
          views: number | null;
          url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never; // Read-only
        Update: never; // Read-only
      };
      sponsorships: {
        Row: {
          id: string;
          brand_id: string;
          video_id: string;
          creator_id: string;
          detection_confidence: number | null;
          mention_type: string | null;
          start_second: number | null;
          created_at: string;
        };
        Insert: never; // Read-only
        Update: never; // Read-only
      };
    };
  };
}

