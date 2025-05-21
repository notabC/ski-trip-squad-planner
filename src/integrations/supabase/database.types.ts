
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          creator_id: string
          join_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          creator_id: string
          join_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          creator_id?: string
          join_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          created_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          name: string
          location: string
          description: string | null
          image: string | null
          price: number
          start_date: string
          end_date: string
          amenities: string[] | null
          difficulty: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          description?: string | null
          image?: string | null
          price: number
          start_date: string
          end_date: string
          amenities?: string[] | null
          difficulty: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          description?: string | null
          image?: string | null
          price?: number
          start_date?: string
          end_date?: string
          amenities?: string[] | null
          difficulty?: string
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          group_id: string
          selected_destination_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          selected_destination_id?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          selected_destination_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          status: string
          payment_status: string
          payment_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          status: string
          payment_status: string
          payment_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          status?: string
          payment_status?: string
          payment_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          destination_id: string
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination_id: string
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination_id?: string
          timestamp?: string
          created_at?: string
        }
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
  }
}
