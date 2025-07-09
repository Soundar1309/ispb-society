export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          content: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      conference_registrations: {
        Row: {
          amount_paid: number | null
          conference_id: string | null
          created_at: string | null
          id: string
          payment_status: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          registration_type: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          conference_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          registration_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          conference_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          registration_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conference_registrations_conference_id_fkey"
            columns: ["conference_id"]
            isOneToOne: false
            referencedRelation: "conferences"
            referencedColumns: ["id"]
          },
        ]
      }
      conferences: {
        Row: {
          created_at: string | null
          date_from: string | null
          date_to: string | null
          deadline: string | null
          description: string | null
          early_bird_deadline: string | null
          early_bird_fee: number | null
          fee: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link: string | null
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          date_from?: string | null
          date_to?: string | null
          deadline?: string | null
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_fee?: number | null
          fee?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          date_from?: string | null
          date_to?: string | null
          deadline?: string | null
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_fee?: number | null
          fee?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      life_members: {
        Row: {
          created_at: string | null
          designation: string | null
          email: string | null
          id: string
          image_url: string | null
          institution: string | null
          is_active: boolean | null
          member_since: string | null
          name: string
          phone: string | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          member_since?: string | null
          name: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          member_since?: string | null
          name?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mandates: {
        Row: {
          content: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string
          duration_months: number
          features: Json
          id: string
          is_active: boolean
          plan_type: string
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_months: number
          features?: Json
          id?: string
          is_active?: boolean
          plan_type: string
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_months?: number
          features?: Json
          id?: string
          is_active?: boolean
          plan_type?: string
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          is_manual: boolean | null
          member_code: string | null
          membership_type: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_manual?: boolean | null
          member_code?: string | null
          membership_type: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_manual?: boolean | null
          member_code?: string | null
          membership_type?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      office_bearers: {
        Row: {
          created_at: string | null
          designation: string
          display_order: number | null
          id: string
          image_url: string | null
          institution: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          designation: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          designation?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          membership_id: string | null
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          membership_id?: string | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          membership_id?: string | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_tracking: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          membership_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          membership_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          membership_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_tracking_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          authors: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          doi: string | null
          id: string
          is_featured: boolean | null
          issue: string | null
          journal: string | null
          link: string | null
          pages: string | null
          pdf_file_url: string | null
          pdf_url: string | null
          price: number | null
          status: string | null
          title: string
          updated_at: string | null
          volume: string | null
          year: number | null
        }
        Insert: {
          authors?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          doi?: string | null
          id?: string
          is_featured?: boolean | null
          issue?: string | null
          journal?: string | null
          link?: string | null
          pages?: string | null
          pdf_file_url?: string | null
          pdf_url?: string | null
          price?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          volume?: string | null
          year?: number | null
        }
        Update: {
          authors?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          doi?: string | null
          id?: string
          is_featured?: boolean | null
          issue?: string | null
          journal?: string | null
          link?: string | null
          pages?: string | null
          pdf_file_url?: string | null
          pdf_url?: string | null
          price?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          volume?: string | null
          year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          designation: string | null
          email: string | null
          full_name: string | null
          id: string
          institution: string | null
          phone: string | null
          role: string
          specialization: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          phone?: string | null
          role: string
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          phone?: string | null
          role?: string
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deactivate_expired_memberships: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_member_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
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
