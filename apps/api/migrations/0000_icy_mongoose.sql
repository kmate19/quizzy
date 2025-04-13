CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."language_support" AS ENUM('official', 'partial', 'none');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('quiz', 'comment', 'message', 'auth_status', 'alter_db');--> statement-breakpoint
CREATE TYPE "public"."quiz_type" AS ENUM('normal', 'twochoice');--> statement-breakpoint
CREATE TYPE "public"."quiz_status" AS ENUM('draft', 'published', 'requires_review', 'private', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."token_type" AS ENUM('email', 'refresh', 'forgot_password');--> statement-breakpoint
CREATE TYPE "public"."auth_status" AS ENUM('pending', 'active', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'away');--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "friendships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"friend_id" uuid NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "can_not_friend_self" CHECK ("friendships"."user_id" <> "friendships"."friend_id")
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "languages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(24) NOT NULL,
	"iso_code" varchar(2) NOT NULL,
	"icon" varchar(24) NOT NULL,
	"support" "language_support" DEFAULT 'none' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "languages_name_unique" UNIQUE("name"),
	CONSTRAINT "languages_iso_code_unique" UNIQUE("iso_code"),
	CONSTRAINT "languages_icon_unique" UNIQUE("icon")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "quiz_cards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_cards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"quiz_id" uuid NOT NULL,
	"type" "quiz_type" NOT NULL,
	"question" varchar(255) NOT NULL,
	"answers" varchar(255)[] NOT NULL,
	"picture" text NOT NULL,
	"correct_answer_index" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_languages" (
	"quiz_id" uuid NOT NULL,
	"language_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_tags" (
	"quiz_id" uuid NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(24) NOT NULL,
	"description" varchar(255) NOT NULL,
	"status" "quiz_status" NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"plays" integer DEFAULT 0 NOT NULL,
	"banner" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quizzes_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "resource_access_control" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resource_access_control_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"role_id" integer,
	"user_id" uuid,
	"resource_type" "resource_type" NOT NULL,
	"permissons" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"quiz_id" uuid NOT NULL,
	"rating" real NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL,
	"comment" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_resources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "role_resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"role_id" integer NOT NULL,
	"resource_access_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles_permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "api_key_resources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "api_key_resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"api_key_id" integer NOT NULL,
	"resource_access_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_api_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_api_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id_by_user" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"key" varchar(255) NOT NULL,
	"description" varchar(255),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_resources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"resource_access_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"token_type" "token_type" NOT NULL,
	"data" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_stats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"plays" integer DEFAULT 0 NOT NULL,
	"first_places" integer DEFAULT 0 NOT NULL,
	"second_places" integer DEFAULT 0 NOT NULL,
	"third_places" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"wrong_answers" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(16) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"activity_status" "user_status" DEFAULT 'inactive' NOT NULL,
	"profile_picture" text,
	"auth_status" "auth_status" DEFAULT 'pending' NOT NULL,
	"firstTimeLogin" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_cards" ADD CONSTRAINT "quiz_cards_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_languages" ADD CONSTRAINT "quiz_languages_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_languages" ADD CONSTRAINT "quiz_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_tags" ADD CONSTRAINT "quiz_tags_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_tags" ADD CONSTRAINT "quiz_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_access_control" ADD CONSTRAINT "resource_access_control_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_access_control" ADD CONSTRAINT "resource_access_control_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_resources" ADD CONSTRAINT "role_resources_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_resources" ADD CONSTRAINT "role_resources_resource_access_id_resource_access_control_id_fk" FOREIGN KEY ("resource_access_id") REFERENCES "public"."resource_access_control"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_resources" ADD CONSTRAINT "api_key_resources_api_key_id_user_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."user_api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_resources" ADD CONSTRAINT "api_key_resources_resource_access_id_resource_access_control_id_fk" FOREIGN KEY ("resource_access_id") REFERENCES "public"."resource_access_control"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_resources" ADD CONSTRAINT "user_resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_resources" ADD CONSTRAINT "user_resources_resource_access_id_resource_access_control_id_fk" FOREIGN KEY ("resource_access_id") REFERENCES "public"."resource_access_control"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friendships_user_id_index" ON "friendships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "friendships_friend_id_index" ON "friendships" USING btree ("friend_id");--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_user_id_friend_id_index" ON "friendships" USING btree ("user_id","friend_id");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_name_index" ON "languages" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_iso_code_index" ON "languages" USING btree ("iso_code");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_icon_index" ON "languages" USING btree ("icon");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_name_index" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "quiz_cards_quiz_id_index" ON "quiz_cards" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "quiz_cards_question_index" ON "quiz_cards" USING btree ("question");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_languages_quiz_id_language_id_index" ON "quiz_languages" USING btree ("quiz_id","language_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_tags_quiz_id_tag_id_index" ON "quiz_tags" USING btree ("quiz_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quizzes_title_index" ON "quizzes" USING btree ("title");--> statement-breakpoint
CREATE INDEX "resource_access_control_user_id_index" ON "resource_access_control" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resource_access_control_role_id_index" ON "resource_access_control" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "resource_access_control_permissons_index" ON "resource_access_control" USING btree ("permissons");--> statement-breakpoint
CREATE INDEX "reviews_user_id_index" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_quiz_id_index" ON "reviews" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "role_resources_role_id_index" ON "role_resources" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_resources_resource_access_id_index" ON "role_resources" USING btree ("resource_access_id");--> statement-breakpoint
CREATE INDEX "roles_permissions_role_id_index" ON "roles_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "roles_permissions_permission_id_index" ON "roles_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_index" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_index" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "api_key_resources_api_key_id_index" ON "api_key_resources" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "api_key_resources_resource_access_id_index" ON "api_key_resources" USING btree ("resource_access_id");--> statement-breakpoint
CREATE INDEX "user_api_keys_description_index" ON "user_api_keys" USING btree ("description");--> statement-breakpoint
CREATE INDEX "user_resources_user_id_index" ON "user_resources" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_resources_resource_access_id_index" ON "user_resources" USING btree ("resource_access_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_id_role_id_index" ON "user_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_tokens_token_index" ON "user_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_stats_user_id_index" ON "user_stats" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_index" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_email_index" ON "users" USING btree ("username","email");