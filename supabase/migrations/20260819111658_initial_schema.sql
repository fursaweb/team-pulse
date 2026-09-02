


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."checkin_response_status" AS ENUM (
    'SAFE'
);


ALTER TYPE "public"."checkin_response_status" OWNER TO "postgres";


CREATE TYPE "public"."checkin_status" AS ENUM (
    'CREATED',
    'SENT',
    'REMINDER_SENT',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE "public"."checkin_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_channel" AS ENUM (
    'SLACK'
);


ALTER TYPE "public"."notification_channel" OWNER TO "postgres";


CREATE TYPE "public"."notification_status" AS ENUM (
    'SENT',
    'FAILED'
);


ALTER TYPE "public"."notification_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'CHECK_IN',
    'REMINDER'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."team_member_role" AS ENUM (
    'MEMBER',
    'COORDINATOR'
);


ALTER TYPE "public"."team_member_role" OWNER TO "postgres";


CREATE TYPE "public"."user_global_role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE "public"."user_global_role" OWNER TO "postgres";


CREATE TYPE "public"."user_language" AS ENUM (
    'uk',
    'en'
);


ALTER TYPE "public"."user_language" OWNER TO "postgres";


CREATE TYPE "public"."user_status" AS ENUM (
    'ACTIVE',
    'PENDING',
    'DISABLED'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."checkin_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "checkin_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."checkin_response_status" DEFAULT 'SAFE'::"public"."checkin_response_status" NOT NULL,
    "responded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."checkin_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "sent_at" timestamp with time zone,
    "reminder_scheduled_at" timestamp with time zone NOT NULL,
    "reminder_sent_at" timestamp with time zone,
    "status" "public"."checkin_status" DEFAULT 'CREATED'::"public"."checkin_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."checkins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "checkin_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "channel" "public"."notification_channel" DEFAULT 'SLACK'::"public"."notification_channel" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "status" "public"."notification_status" NOT NULL,
    "slack_channel_id" "text",
    "slack_message_ts" "text",
    "sent_at" timestamp with time zone,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."team_member_role" DEFAULT 'MEMBER'::"public"."team_member_role" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "timezone" "text" DEFAULT 'Europe/Kyiv'::"text" NOT NULL,
    "check_in_time" time without time zone DEFAULT '09:00:00'::time without time zone NOT NULL,
    "reminder_delay_hours" integer DEFAULT 2 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "slack_user_id" "text",
    "language" "public"."user_language" DEFAULT 'uk'::"public"."user_language" NOT NULL,
    "global_role" "public"."user_global_role" DEFAULT 'USER'::"public"."user_global_role" NOT NULL,
    "status" "public"."user_status" DEFAULT 'PENDING'::"public"."user_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."checkin_responses"
    ADD CONSTRAINT "checkin_responses_checkin_id_user_id_key" UNIQUE ("checkin_id", "user_id");



ALTER TABLE ONLY "public"."checkin_responses"
    ADD CONSTRAINT "checkin_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkins"
    ADD CONSTRAINT "checkins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkins"
    ADD CONSTRAINT "checkins_team_id_date_key" UNIQUE ("team_id", "date");



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_checkin_id_user_id_type_key" UNIQUE ("checkin_id", "user_id", "type");



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_slack_user_id_key" UNIQUE ("slack_user_id");



CREATE INDEX "idx_checkin_responses_checkin_id" ON "public"."checkin_responses" USING "btree" ("checkin_id");



CREATE INDEX "idx_checkin_responses_responded_at" ON "public"."checkin_responses" USING "btree" ("responded_at");



CREATE INDEX "idx_checkin_responses_status" ON "public"."checkin_responses" USING "btree" ("status");



CREATE INDEX "idx_checkin_responses_user_id" ON "public"."checkin_responses" USING "btree" ("user_id");



CREATE INDEX "idx_checkins_date" ON "public"."checkins" USING "btree" ("date");



CREATE INDEX "idx_checkins_reminder_scheduled_at" ON "public"."checkins" USING "btree" ("reminder_scheduled_at");



CREATE INDEX "idx_checkins_status" ON "public"."checkins" USING "btree" ("status");



CREATE INDEX "idx_checkins_team_id" ON "public"."checkins" USING "btree" ("team_id");



CREATE INDEX "idx_notification_logs_checkin_id" ON "public"."notification_logs" USING "btree" ("checkin_id");



CREATE INDEX "idx_notification_logs_created_at" ON "public"."notification_logs" USING "btree" ("created_at");



CREATE INDEX "idx_notification_logs_status" ON "public"."notification_logs" USING "btree" ("status");



CREATE INDEX "idx_notification_logs_type" ON "public"."notification_logs" USING "btree" ("type");



CREATE INDEX "idx_notification_logs_user_id" ON "public"."notification_logs" USING "btree" ("user_id");



CREATE INDEX "idx_team_members_active" ON "public"."team_members" USING "btree" ("active");



CREATE INDEX "idx_team_members_role" ON "public"."team_members" USING "btree" ("role");



CREATE INDEX "idx_team_members_team_id" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_user_id" ON "public"."team_members" USING "btree" ("user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_slack_user_id" ON "public"."users" USING "btree" ("slack_user_id");



CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status");



ALTER TABLE ONLY "public"."checkin_responses"
    ADD CONSTRAINT "checkin_responses_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "public"."checkins"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkin_responses"
    ADD CONSTRAINT "checkin_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkins"
    ADD CONSTRAINT "checkins_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "public"."checkins"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."checkin_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."checkins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































GRANT ALL ON TABLE "public"."checkin_responses" TO "anon";
GRANT ALL ON TABLE "public"."checkin_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."checkin_responses" TO "service_role";



GRANT ALL ON TABLE "public"."checkins" TO "anon";
GRANT ALL ON TABLE "public"."checkins" TO "authenticated";
GRANT ALL ON TABLE "public"."checkins" TO "service_role";



GRANT ALL ON TABLE "public"."notification_logs" TO "anon";
GRANT ALL ON TABLE "public"."notification_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_logs" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































