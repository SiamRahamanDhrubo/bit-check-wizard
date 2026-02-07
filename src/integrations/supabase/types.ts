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
      code_batches: {
        Row: {
          app_type: string
          batch_name: string
          codes_count: number
          created_at: string
          helper_id: string | null
          id: string
          robux_type: string | null
        }
        Insert: {
          app_type: string
          batch_name: string
          codes_count: number
          created_at?: string
          helper_id?: string | null
          id?: string
          robux_type?: string | null
        }
        Update: {
          app_type?: string
          batch_name?: string
          codes_count?: number
          created_at?: string
          helper_id?: string | null
          id?: string
          robux_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_batches_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helpers"
            referencedColumns: ["id"]
          },
        ]
      }
      code_redemptions: {
        Row: {
          code_id: string
          device_identifier: string | null
          id: string
          ip_address: string | null
          redeemed_at: string
          user_id: string | null
        }
        Insert: {
          code_id: string
          device_identifier?: string | null
          id?: string
          ip_address?: string | null
          redeemed_at?: string
          user_id?: string | null
        }
        Update: {
          code_id?: string
          device_identifier?: string | null
          id?: string
          ip_address?: string | null
          redeemed_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "redemption_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "uuid_users"
            referencedColumns: ["id"]
          },
        ]
      }
      download_links: {
        Row: {
          architecture: string | null
          created_at: string
          id: string
          music: string | null
          os: string
          url: string
        }
        Insert: {
          architecture?: string | null
          created_at?: string
          id?: string
          music?: string | null
          os: string
          url: string
        }
        Update: {
          architecture?: string | null
          created_at?: string
          id?: string
          music?: string | null
          os?: string
          url?: string
        }
        Relationships: []
      }
      helpers: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          last_login_at: string | null
          name: string
          notes: string | null
          password_hash: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          name: string
          notes?: string | null
          password_hash: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          name?: string
          notes?: string | null
          password_hash?: string
        }
        Relationships: []
      }
      redemption_codes: {
        Row: {
          app_type: string
          batch_id: string | null
          code: string
          created_at: string
          current_uses: number
          expiry_month: number
          expiry_year: number
          helper_id: string | null
          id: string
          is_active: boolean
          is_sold: boolean
          max_uses: number
          secret_key1: string
          secret_key2: string
          sold_price: number | null
        }
        Insert: {
          app_type: string
          batch_id?: string | null
          code: string
          created_at?: string
          current_uses?: number
          expiry_month: number
          expiry_year: number
          helper_id?: string | null
          id?: string
          is_active?: boolean
          is_sold?: boolean
          max_uses?: number
          secret_key1: string
          secret_key2: string
          sold_price?: number | null
        }
        Update: {
          app_type?: string
          batch_id?: string | null
          code?: string
          created_at?: string
          current_uses?: number
          expiry_month?: number
          expiry_year?: number
          helper_id?: string | null
          id?: string
          is_active?: boolean
          is_sold?: boolean
          max_uses?: number
          secret_key1?: string
          secret_key2?: string
          sold_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "redemption_codes_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "code_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_codes_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helpers"
            referencedColumns: ["id"]
          },
        ]
      }
      roblox_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_used: boolean
          redeemed_at: string | null
          redeemed_by: string | null
          robux_amount: number
          robux_type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_used?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
          robux_amount: number
          robux_type: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_used?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
          robux_amount?: number
          robux_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "roblox_codes_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "uuid_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "uuid_users"
            referencedColumns: ["id"]
          },
        ]
      }
      uuid_users: {
        Row: {
          ban_reason: string | null
          created_at: string
          id: string
          is_banned: boolean
          last_login_at: string | null
          password_hash: string
          uuid_code: string
        }
        Insert: {
          ban_reason?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          last_login_at?: string | null
          password_hash: string
          uuid_code: string
        }
        Update: {
          ban_reason?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          last_login_at?: string | null
          password_hash?: string
          uuid_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_code: {
        Args: { code_input: string }
        Returns: {
          app_type: string
          current_uses: number
          expiry_month: number
          expiry_year: number
          id: string
          is_valid: boolean
          max_uses: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
