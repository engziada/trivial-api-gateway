CREATE TABLE `apis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(64) NOT NULL,
	`endpoint` varchar(256) NOT NULL,
	`method` varchar(10) NOT NULL DEFAULT 'POST',
	`exampleInput` text,
	`exampleOutput` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apis_id` PRIMARY KEY(`id`),
	CONSTRAINT `apis_slug_unique` UNIQUE(`slug`)
);
