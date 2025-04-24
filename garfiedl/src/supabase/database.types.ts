export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      comics: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last_updated: string | null
          locator: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_updated?: string | null
          locator: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_updated?: string | null
          locator?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          body: string
          comic: string | null
          created_at: string
          id: number
          likes: number
          link: string | null
          reference: number | null
          replies: number
          type: Database["public"]["Enums"]["post_type"]
        }
        Insert: {
          author?: string | null
          body?: string
          comic?: string | null
          created_at?: string
          id?: number
          likes?: number
          link?: string | null
          reference?: number | null
          replies?: number
          type?: Database["public"]["Enums"]["post_type"]
        }
        Update: {
          author?: string | null
          body?: string
          comic?: string | null
          created_at?: string
          id?: number
          likes?: number
          link?: string | null
          reference?: number | null
          replies?: number
          type?: Database["public"]["Enums"]["post_type"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_comic_fkey"
            columns: ["comic"]
            isOneToOne: false
            referencedRelation: "comics"
            referencedColumns: ["locator"]
          },
          {
            foreignKeyName: "posts_reference_fkey"
            columns: ["reference"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_likes: {
        Row: {
          created_at: string
          id: number
          post: number
          user: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          post: number
          user?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          post?: number
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_likes_post_fkey"
            columns: ["post"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_likes_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_reports: {
        Row: {
          body: string
          created_at: string
          id: number
          reference: number | null
          submitted_by: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          id?: number
          reference?: number | null
          submitted_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: number
          reference?: number | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_reports_reference_fkey"
            columns: ["reference"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          display_name: string | null
          id: string
          posts_banned: boolean
        }
        Insert: {
          display_name?: string | null
          id: string
          posts_banned?: boolean
        }
        Update: {
          display_name?: string | null
          id?: string
          posts_banned?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      change_username: {
        Args: {
          user_id: string
          new_username: string
        }
        Returns: undefined
      }
      count_likes: {
        Args: {
          post_id: number
        }
        Returns: number
      }
      generate_username: {
        Args: {
          email: string
        }
        Returns: string
      }
      get_user_info: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      post_is_liked: {
        Args: {
          post_id: number
        }
        Returns: boolean
      }
      report_post: {
        Args: {
          post_id: number
          report_body: string
        }
        Returns: undefined
      }
      upload_comic: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      username_exists:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              username_new: string
            }
            Returns: boolean
          }
    }
    Enums: {
      post_type: "post" | "repost" | "quote" | "reply"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

