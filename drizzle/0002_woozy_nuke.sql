CREATE TABLE `api_tier_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tierId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_tier_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`displayName` varchar(64) NOT NULL,
	`dailyRateLimit` int NOT NULL,
	`monthlyRateLimit` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_tiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_tiers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tierId` int NOT NULL,
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `api_tier_access` ADD CONSTRAINT `api_tier_access_tierId_subscription_tiers_id_fk` FOREIGN KEY (`tierId`) REFERENCES `subscription_tiers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD CONSTRAINT `user_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD CONSTRAINT `user_subscriptions_tierId_subscription_tiers_id_fk` FOREIGN KEY (`tierId`) REFERENCES `subscription_tiers`(`id`) ON DELETE no action ON UPDATE no action;