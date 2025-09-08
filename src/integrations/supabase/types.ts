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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      condominios: {
        Row: {
          cep: string
          cidade: string
          created_at: string
          endereco: string
          id: string
          nome: string
          sindico_cpf: string | null
          sindico_id: string | null
          sindico_nome: string | null
          sindico_senha: string | null
          sindico_telefone: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep: string
          cidade: string
          created_at?: string
          endereco: string
          id?: string
          nome: string
          sindico_cpf?: string | null
          sindico_id?: string | null
          sindico_nome?: string | null
          sindico_senha?: string | null
          sindico_telefone?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string
          cidade?: string
          created_at?: string
          endereco?: string
          id?: string
          nome?: string
          sindico_cpf?: string | null
          sindico_id?: string | null
          sindico_nome?: string | null
          sindico_senha?: string | null
          sindico_telefone?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "condominios_sindico_id_fkey"
            columns: ["sindico_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas: {
        Row: {
          codigo_retirada: string
          condominio_id: string | null
          created_at: string
          data_entrega: string
          data_retirada: string | null
          descricao_retirada: string | null
          foto_url: string | null
          funcionario_id: string
          id: string
          mensagem_enviada: boolean
          morador_id: string
          observacoes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          codigo_retirada: string
          condominio_id?: string | null
          created_at?: string
          data_entrega?: string
          data_retirada?: string | null
          descricao_retirada?: string | null
          foto_url?: string | null
          funcionario_id: string
          id?: string
          mensagem_enviada?: boolean
          morador_id: string
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          codigo_retirada?: string
          condominio_id?: string | null
          created_at?: string
          data_entrega?: string
          data_retirada?: string | null
          descricao_retirada?: string | null
          foto_url?: string | null
          funcionario_id?: string
          id?: string
          mensagem_enviada?: boolean
          morador_id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_morador_id_fkey"
            columns: ["morador_id"]
            isOneToOne: false
            referencedRelation: "moradores"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          ativo: boolean
          cargo: string
          condominio_id: string
          cpf: string
          created_at: string
          id: string
          nome: string
          senha: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string
          condominio_id: string
          cpf: string
          created_at?: string
          id?: string
          nome: string
          senha: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: string
          condominio_id?: string
          cpf?: string
          created_at?: string
          id?: string
          nome?: string
          senha?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      moradores: {
        Row: {
          apartamento: string
          ativo: boolean
          bloco: string | null
          condominio_id: string
          created_at: string
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          apartamento: string
          ativo?: boolean
          bloco?: string | null
          condominio_id: string
          created_at?: string
          id?: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          apartamento?: string
          ativo?: boolean
          bloco?: string | null
          condominio_id?: string
          created_at?: string
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moradores_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      super_administradores: {
        Row: {
          ativo: boolean
          cpf: string
          created_at: string
          id: string
          nome: string
          senha: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cpf: string
          created_at?: string
          id?: string
          nome: string
          senha: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cpf?: string
          created_at?: string
          id?: string
          nome?: string
          senha?: string
          updated_at?: string
        }
        Relationships: []
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
