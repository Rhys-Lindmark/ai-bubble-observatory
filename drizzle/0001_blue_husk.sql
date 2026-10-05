CREATE TABLE `forecast_records` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`issued_at` text NOT NULL,
	`target_month` text NOT NULL,
	`model_version` text NOT NULL
);
