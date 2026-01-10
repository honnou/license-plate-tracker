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
      groups: {
        Row: {
          id: string
          name: string
          code: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_by?: string
          created_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      license_plates: {
        Row: {
          id: string
          user_id: string
          group_id: string
          state: string
          photo_path: string
          is_vanity: boolean
          is_special: boolean
          special_type: string | null
          points: number
          spotted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          state: string
          photo_path: string
          is_vanity?: boolean
          is_special?: boolean
          special_type?: string | null
          points?: number
          spotted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          state?: string
          photo_path?: string
          is_vanity?: boolean
          is_special?: boolean
          special_type?: string | null
          points?: number
          spotted_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
        }
      }
    }
  }
}
