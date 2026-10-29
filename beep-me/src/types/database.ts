/**
 * Database types for the Supabase client. Hand-maintained to mirror
 * supabase/migrations. Once the project is linked, regenerate with:
 *   supabase gen types typescript --linked > src/types/database.ts
 * and this file is replaced by the generated output (same shape).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BeepStatus = 'open' | 'full' | 'completed' | 'cancelled';
export type SeatRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type ReportReason =
  | 'no_show'
  | 'unsafe_driving'
  | 'harassment'
  | 'scam'
  | 'inappropriate_content'
  | 'other';
export type ReportStatus = 'open' | 'reviewed' | 'actioned' | 'dismissed';
export type TripType = 'local' | 'long';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'paid_out';

export type Database = {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          city: string;
          state: string;
          email_domains: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          short_name: string;
          city: string;
          state: string;
          email_domains: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['universities']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          university_id: string | null;
          edu_verified: boolean;
          avatar_url: string | null;
          bio: string | null;
          average_rating: number | null;
          rating_count: number;
          rides_given: number;
          rides_taken: number;
          onboarding_completed_at: string | null;
          stripe_customer_id: string | null;
          has_payment_method: boolean;
          stripe_account_id: string | null;
          payouts_enabled: boolean;
          plus_active: boolean;
          plus_expires_at: string | null;
          accepted_terms_version: string | null;
          accepted_terms_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          university_id?: string | null;
          edu_verified?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          average_rating?: number | null;
          rating_count?: number;
          rides_given?: number;
          rides_taken?: number;
          onboarding_completed_at?: string | null;
          stripe_customer_id?: string | null;
          has_payment_method?: boolean;
          stripe_account_id?: string | null;
          payouts_enabled?: boolean;
          plus_active?: boolean;
          plus_expires_at?: string | null;
          accepted_terms_version?: string | null;
          accepted_terms_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'profiles_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          },
        ];
      };
      blocks: {
        Row: { blocker_id: string; blocked_id: string; created_at: string };
        Insert: { blocker_id: string; blocked_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['blocks']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'blocks_blocker_id_fkey';
            columns: ['blocker_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blocks_blocked_id_fkey';
            columns: ['blocked_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      beeps: {
        Row: {
          id: string;
          driver_id: string;
          university_id: string;
          origin: string;
          destination: string;
          departure_at: string;
          seats_total: number;
          seats_taken: number;
          price_per_seat_cents: number;
          note: string | null;
          status: BeepStatus;
          trip_type: TripType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          university_id: string;
          origin: string;
          destination: string;
          departure_at: string;
          seats_total: number;
          seats_taken?: number;
          price_per_seat_cents: number;
          note?: string | null;
          status?: BeepStatus;
          trip_type?: TripType;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['beeps']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'beeps_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'beeps_university_id_fkey';
            columns: ['university_id'];
            isOneToOne: false;
            referencedRelation: 'universities';
            referencedColumns: ['id'];
          },
        ];
      };
      seat_requests: {
        Row: {
          id: string;
          beep_id: string;
          rider_id: string;
          seats_requested: number;
          status: SeatRequestStatus;
          last_message_at: string | null;
          last_message_preview: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          beep_id: string;
          rider_id: string;
          seats_requested: number;
          status?: SeatRequestStatus;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['seat_requests']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'seat_requests_beep_id_fkey';
            columns: ['beep_id'];
            isOneToOne: false;
            referencedRelation: 'beeps';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'seat_requests_rider_id_fkey';
            columns: ['rider_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          seat_request_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          seat_request_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'messages_seat_request_id_fkey';
            columns: ['seat_request_id'];
            isOneToOne: false;
            referencedRelation: 'seat_requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          beep_id: string;
          reviewer_id: string;
          reviewee_id: string;
          stars: number;
          text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          beep_id: string;
          reviewer_id: string;
          reviewee_id: string;
          stars: number;
          text?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'reviews_beep_id_fkey';
            columns: ['beep_id'];
            isOneToOne: false;
            referencedRelation: 'beeps';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_reviewee_id_fkey';
            columns: ['reviewee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          seat_request_id: string;
          rider_id: string;
          driver_id: string;
          seat_subtotal_cents: number;
          booking_fee_cents: number;
          amount_cents: number;
          platform_fee_cents: number;
          driver_payout_cents: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          stripe_transfer_id: string | null;
          stripe_refund_id: string | null;
          status: PaymentStatus;
          failure_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seat_request_id: string;
          rider_id: string;
          driver_id: string;
          seat_subtotal_cents: number;
          booking_fee_cents?: number;
          amount_cents: number;
          platform_fee_cents: number;
          driver_payout_cents: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          stripe_transfer_id?: string | null;
          stripe_refund_id?: string | null;
          status?: PaymentStatus;
          failure_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'payments_seat_request_id_fkey';
            columns: ['seat_request_id'];
            isOneToOne: true;
            referencedRelation: 'seat_requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_rider_id_fkey';
            columns: ['rider_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_beep_id: string | null;
          reason: ReportReason;
          details: string | null;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_beep_id?: string | null;
          reason: ReportReason;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reported_beep_id_fkey';
            columns: ['reported_beep_id'];
            isOneToOne: false;
            referencedRelation: 'beeps';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      university_for_email: { Args: { email: string }; Returns: string | null };
      current_university_id: { Args: Record<string, never>; Returns: string | null };
      is_edu_verified: { Args: Record<string, never>; Returns: boolean };
      is_blocked_either_way: { Args: { other_user: string }; Returns: boolean };
    };
    Enums: {
      beep_status: BeepStatus;
      seat_request_status: SeatRequestStatus;
      report_reason: ReportReason;
      report_status: ReportStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type University = Tables<'universities'>;
export type Beep = Tables<'beeps'>;
export type SeatRequest = Tables<'seat_requests'>;
export type Message = Tables<'messages'>;
export type Review = Tables<'reviews'>;
export type Report = Tables<'reports'>;
export type Payment = Tables<'payments'>;
