CREATE TABLE `cache_entries` (
	`key` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`day` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
