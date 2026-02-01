PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pin_codes_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`pin` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`usedAt` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_pin_codes_table`("id", "email", "pin", "expiresAt", "usedAt", "attempts", "createdAt") SELECT "id", "email", "pin", "expiresAt", "usedAt", "attempts", "createdAt" FROM `pin_codes_table`;--> statement-breakpoint
DROP TABLE `pin_codes_table`;--> statement-breakpoint
ALTER TABLE `__new_pin_codes_table` RENAME TO `pin_codes_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;