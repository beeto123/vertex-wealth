CREATE TABLE "balances" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"current_balance" numeric(15, 2) DEFAULT '0.00',
	"total_deposited" numeric(15, 2) DEFAULT '0.00',
	"total_withdrawn" numeric(15, 2) DEFAULT '0.00',
	"total_interest_earned" numeric(15, 2) DEFAULT '0.00',
	"last_interest_calc" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"amount" numeric(15, 2) NOT NULL,
	"tx_hash" varchar(100) NOT NULL,
	"network" varchar(20) DEFAULT 'TRC-20',
	"status" varchar(20) DEFAULT 'pending',
	"admin_note" text,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "interest_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"base_amount" numeric(15, 2) NOT NULL,
	"interest_amount" numeric(15, 2) NOT NULL,
	"rate_applied" numeric(5, 2) NOT NULL,
	"credited_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'active',
	"kyc_status" varchar(20) DEFAULT 'pending',
	"kyc_document_url" text,
	"interest_rate" numeric(5, 2) DEFAULT '9.00',
	"is_admin" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"amount" numeric(15, 2) NOT NULL,
	"wallet_address" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"admin_message" text,
	"requested_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interest_transactions" ADD CONSTRAINT "interest_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;