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
      global_settings: {
        Row: {
          commission_demais_antecipado: number
          commission_demais_parcelado: number
          commission_moda_antecipado: number
          commission_moda_parcelado: number
          fixed_fee: number
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          commission_demais_antecipado?: number
          commission_demais_parcelado?: number
          commission_moda_antecipado?: number
          commission_moda_parcelado?: number
          fixed_fee?: number
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          commission_demais_antecipado?: number
          commission_demais_parcelado?: number
          commission_moda_antecipado?: number
          commission_moda_parcelado?: number
          fixed_fee?: number
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      help_pages: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          id: string
          platform: string
          slug: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          platform: string
          slug: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          platform?: string
          slug?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      pricing_history: {
        Row: {
          calculated_weight: number | null
          commission_rate: number | null
          commission_type: string | null
          contribution_margin: number | null
          contribution_margin_percentage: number | null
          created_at: string | null
          dispatch_level: string
          estimated_receipt: number | null
          financial_modality: string | null
          fixed_fee: number | null
          height_cm: number | null
          id: string
          is_custom_commission: boolean | null
          is_heavy: boolean | null
          length_cm: number | null
          operational_cost: number | null
          product_category: string | null
          product_cost: number | null
          product_name: string | null
          product_price: number
          profit_margin: number | null
          profit_margin_percentage: number | null
          shipping_coparticipation: number | null
          shipping_coparticipation_calculated: boolean | null
          shipping_coparticipation_value: number | null
          tax_percentage: number | null
          user_id: string
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          calculated_weight?: number | null
          commission_rate?: number | null
          commission_type?: string | null
          contribution_margin?: number | null
          contribution_margin_percentage?: number | null
          created_at?: string | null
          dispatch_level: string
          estimated_receipt?: number | null
          financial_modality?: string | null
          fixed_fee?: number | null
          height_cm?: number | null
          id?: string
          is_custom_commission?: boolean | null
          is_heavy?: boolean | null
          length_cm?: number | null
          operational_cost?: number | null
          product_category?: string | null
          product_cost?: number | null
          product_name?: string | null
          product_price: number
          profit_margin?: number | null
          profit_margin_percentage?: number | null
          shipping_coparticipation?: number | null
          shipping_coparticipation_calculated?: boolean | null
          shipping_coparticipation_value?: number | null
          tax_percentage?: number | null
          user_id: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          calculated_weight?: number | null
          commission_rate?: number | null
          commission_type?: string | null
          contribution_margin?: number | null
          contribution_margin_percentage?: number | null
          created_at?: string | null
          dispatch_level?: string
          estimated_receipt?: number | null
          financial_modality?: string | null
          fixed_fee?: number | null
          height_cm?: number | null
          id?: string
          is_custom_commission?: boolean | null
          is_heavy?: boolean | null
          length_cm?: number | null
          operational_cost?: number | null
          product_category?: string | null
          product_cost?: number | null
          product_name?: string | null
          product_price?: number
          profit_margin?: number | null
          profit_margin_percentage?: number | null
          shipping_coparticipation?: number | null
          shipping_coparticipation_calculated?: boolean | null
          shipping_coparticipation_value?: number | null
          tax_percentage?: number | null
          user_id?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          plan_name: string
          start_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          plan_name: string
          start_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          plan_name?: string
          start_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_settings: {
        Row: {
          custom_commission_enabled: boolean | null
          custom_commission_rate: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          custom_commission_enabled?: boolean | null
          custom_commission_rate?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          custom_commission_enabled?: boolean | null
          custom_commission_rate?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_update_rates: boolean | null
          created_at: string | null
          custom_commission_rate: number | null
          custom_fixed_fee: number | null
          id: string
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_update_rates?: boolean | null
          created_at?: string | null
          custom_commission_rate?: number | null
          custom_fixed_fee?: number | null
          id?: string
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_update_rates?: boolean | null
          created_at?: string | null
          custom_commission_rate?: number | null
          custom_fixed_fee?: number | null
          id?: string
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
