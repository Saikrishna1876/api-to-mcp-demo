ALTER TABLE "attachment_master" RENAME TO "attachment";--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "row_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "module_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "file_path" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "updated_at";