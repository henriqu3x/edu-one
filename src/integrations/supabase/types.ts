export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_edits: {
        Row: {
          author_id: string
          category_id: string | null
          content_url: string | null
          course_id: string
          created_at: string | null
          description: string
          difficulty_level: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_type: string | null
          video_urls: string[] | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content_url?: string | null
          course_id: string
          created_at?: string | null
          description: string
          difficulty_level: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_type?: string | null
          video_urls?: string[] | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content_url?: string | null
          course_id?: string
          created_at?: string | null
          description?: string
          difficulty_level?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_type?: string | null
          video_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "course_edits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_edits_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_likes: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_likes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_ratings: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reports: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          reason: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          reason: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          reason?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "course_reports_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_saves: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_saves_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_views: {
        Row: {
          course_id: string
          id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          course_id: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          course_id?: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_views_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          author_id: string
          average_rating: number | null
          category_id: string | null
          content_url: string | null
          created_at: string | null
          description: string
          difficulty_level: string | null
          id: string
          like_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          rating_count: number | null
          rejection_reason: string | null
          report_count: number | null
          save_count: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_type: string
          video_urls: string[] | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          average_rating?: number | null
          category_id?: string | null
          content_url?: string | null
          created_at?: string | null
          description: string
          difficulty_level?: string | null
          id?: string
          like_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          rating_count?: number | null
          rejection_reason?: string | null
          report_count?: number | null
          save_count?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_type?: string
          video_urls?: string[] | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          average_rating?: number | null
          category_id?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string
          difficulty_level?: string | null
          id?: string
          like_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          rating_count?: number | null
          rejection_reason?: string | null
          report_count?: number | null
          save_count?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_type?: string
          video_urls?: string[] | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          reply_count: number | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          reply_count?: number | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          reply_count?: number | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reports: {
        Row: {
          id: string
          reply_id: string
          reporter_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed'
          created_at: string | null
          updated_at: string | null
          admin_notes: string | null
          admin_id: string | null
        }
        Insert: {
          id?: string
          reply_id: string
          reporter_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string | null
          updated_at?: string | null
          admin_notes?: string | null
          admin_id?: string | null
        }
        Update: {
          id?: string
          reply_id?: string
          reporter_id?: string
          reason?: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string | null
          updated_at?: string | null
          admin_notes?: string | null
          admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_reports_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reports_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_topic_reports: {
        Row: {
          id: string
          topic_id: string
          reporter_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed'
          created_at: string | null
          updated_at: string | null
          admin_notes: string | null
          admin_id: string | null
        }
        Insert: {
          id?: string
          topic_id: string
          reporter_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string | null
          updated_at?: string | null
          admin_notes?: string | null
          admin_id?: string | null
        }
        Update: {
          id?: string
          topic_id?: string
          reporter_id?: string
          reason?: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string | null
          updated_at?: string | null
          admin_notes?: string | null
          admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topic_reports_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topic_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topic_reports_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_trails: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          follower_count: number | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          follower_count?: number | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          follower_count?: number | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_trails_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action: Database["public"]["Enums"]["content_status"]
          course_id: string
          created_at: string | null
          id: string
          moderator_id: string
          reason: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["content_status"]
          course_id: string
          created_at?: string | null
          id?: string
          moderator_id: string
          reason?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["content_status"]
          course_id?: string
          created_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned: boolean
          banned_at: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_verified_author: boolean | null
          level: number | null
          total_points: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          banned?: boolean
          banned_at?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_verified_author?: boolean | null
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          banned?: boolean
          banned_at?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_verified_author?: boolean | null
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      trail_courses: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          order_index: number
          trail_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          order_index: number
          trail_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          order_index?: number
          trail_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trail_courses_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "learning_trails"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_course_edit: { Args: { edit_id: string }; Returns: undefined }
      has_pending_edit: { Args: { _course_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_forum_topic_view: {
        Args: { topic_id: string }
        Returns: undefined
      }
      is_moderator_email: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      content_status: "pending" | "approved" | "rejected"
      report_status: "pending" | "dismissed" | "resolved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      content_status: ["pending", "approved", "rejected"],
      report_status: ["pending", "dismissed", "resolved"],
    },
  },
} as const
