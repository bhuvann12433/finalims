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
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          mobile: string
          name: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mobile: string
          name: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mobile?: string
          name?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          expense_date: string
          id: string
          payment_mode: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          payment_mode?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          payment_mode?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      godowns: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string
          pincode: string | null
          state: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          pincode?: string | null
          state?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pincode?: string | null
          state?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          invoice_id: string
          item_id: string
          quantity: number
          tax_amount: number | null
          tax_percent: number | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id: string
          item_id: string
          quantity: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_amount: number
          unit_price: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          item_id?: string
          quantity?: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_due: number | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          created_at: string | null
          created_by: string | null
          discount_amount: number | null
          due_date: string | null
          godown_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          invoice_prefix: string | null
          notes: string | null
          party_id: string
          payment_received: number | null
          payment_status: string | null
          payment_terms: string | null
          signature_url: string | null
          subtotal: number | null
          tax_amount: number | null
          terms_conditions: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          balance_due?: number | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          due_date?: string | null
          godown_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          invoice_prefix?: string | null
          notes?: string | null
          party_id: string
          payment_received?: number | null
          payment_status?: string | null
          payment_terms?: string | null
          signature_url?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          balance_due?: number | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          due_date?: string | null
          godown_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_prefix?: string | null
          notes?: string | null
          party_id?: string
          payment_received?: number | null
          payment_status?: string | null
          payment_terms?: string | null
          signature_url?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_godown_id_fkey"
            columns: ["godown_id"]
            isOneToOne: false
            referencedRelation: "godowns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          enable_batching: boolean | null
          gst_rate: number | null
          hsn_code: string | null
          id: string
          item_code: string | null
          low_stock_threshold: number | null
          measuring_unit: string | null
          mrp: number | null
          name: string
          purchase_price: number | null
          sales_price: number | null
          type: string | null
          updated_at: string | null
          wholesale_price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          enable_batching?: boolean | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          item_code?: string | null
          low_stock_threshold?: number | null
          measuring_unit?: string | null
          mrp?: number | null
          name: string
          purchase_price?: number | null
          sales_price?: number | null
          type?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          enable_batching?: boolean | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          item_code?: string | null
          low_stock_threshold?: number | null
          measuring_unit?: string | null
          mrp?: number | null
          name?: string
          purchase_price?: number | null
          sales_price?: number | null
          type?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Relationships: []
      }
      parties: {
        Row: {
          balance: number | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_ifsc: string | null
          bank_name: string | null
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          billing_pincode: string | null
          billing_state: string | null
          created_at: string | null
          credit_limit: number | null
          dl_no: string | null
          email: string | null
          gstin: string | null
          id: string
          mobile: string | null
          name: string
          opening_balance: number | null
          pan: string | null
          party_category: string | null
          party_type: string
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_pincode: string | null
          shipping_state: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_pincode?: string | null
          billing_state?: string | null
          created_at?: string | null
          credit_limit?: number | null
          dl_no?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          mobile?: string | null
          name: string
          opening_balance?: number | null
          pan?: string | null
          party_category?: string | null
          party_type: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_pincode?: string | null
          shipping_state?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_pincode?: string | null
          billing_state?: string | null
          created_at?: string | null
          credit_limit?: number | null
          dl_no?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          mobile?: string | null
          name?: string
          opening_balance?: number | null
          pan?: string | null
          party_category?: string | null
          party_type?: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_pincode?: string | null
          shipping_state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiry_date: string | null
          godown_id: string
          id: string
          item_id: string
          manufacturing_date: string | null
          quantity: number | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          godown_id: string
          id?: string
          item_id: string
          manufacturing_date?: string | null
          quantity?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          godown_id?: string
          id?: string
          item_id?: string
          manufacturing_date?: string | null
          quantity?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_godown_id_fkey"
            columns: ["godown_id"]
            isOneToOne: false
            referencedRelation: "godowns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string | null
          party_id: string | null
          party_name: string | null
          payment_mode: string | null
          reference_number: string | null
          transaction_date: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          party_id?: string | null
          party_name?: string | null
          payment_mode?: string | null
          reference_number?: string | null
          transaction_date?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          party_id?: string | null
          party_name?: string | null
          payment_mode?: string | null
          reference_number?: string | null
          transaction_date?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
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
