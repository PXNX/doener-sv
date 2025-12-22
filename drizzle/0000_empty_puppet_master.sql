CREATE TABLE "pending_edits" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_eva" integer NOT NULL,
	"user_id" text NOT NULL,
	"has_warm_sleep" boolean,
	"sleep_notes" text,
	"has_outlets" boolean,
	"outlet_notes" text,
	"has_toilets" boolean,
	"toilet_notes" text,
	"toilets_open_at_night" boolean,
	"is_open_24h" boolean,
	"opening_hours" text,
	"has_wifi" boolean,
	"wifi_has_limit" boolean,
	"wifi_notes" text,
	"additional_info" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"eva" integer PRIMARY KEY NOT NULL,
	"station_id_ger" integer,
	"name" varchar(255) NOT NULL,
	"city" varchar(255),
	"country" varchar(2) NOT NULL,
	"has_warm_sleep" boolean,
	"sleep_notes" text,
	"has_outlets" boolean,
	"outlet_notes" text,
	"has_toilets" boolean,
	"toilet_notes" text,
	"toilets_open_at_night" boolean,
	"is_open_24h" boolean,
	"opening_hours" varchar(100),
	"has_wifi" boolean,
	"wifi_has_limit" boolean,
	"wifi_notes" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"additional_info" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "pending_edits" ADD CONSTRAINT "pending_edits_station_eva_stations_eva_fk" FOREIGN KEY ("station_eva") REFERENCES "public"."stations"("eva") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_edits" ADD CONSTRAINT "pending_edits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_edits" ADD CONSTRAINT "pending_edits_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;