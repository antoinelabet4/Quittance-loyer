CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `appartement_locataires` (
	`id` text PRIMARY KEY NOT NULL,
	`appartement_id` text NOT NULL,
	`locataire_id` text NOT NULL,
	`date_entree` text NOT NULL,
	`date_sortie` text,
	`loyer` real,
	`charges` real,
	FOREIGN KEY (`appartement_id`) REFERENCES `appartements`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`locataire_id`) REFERENCES `locataires`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `appartements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bailleur_id` text NOT NULL,
	`adresse` text NOT NULL,
	`loyer` real NOT NULL,
	`charges` real NOT NULL,
	`is_colocation` integer DEFAULT false,
	`loyer_par_locataire` text,
	`locataire_ids` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bailleur_id`) REFERENCES `bailleurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bailleurs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`nom` text NOT NULL,
	`adresse` text NOT NULL,
	`email` text,
	`type` text NOT NULL,
	`siret` text,
	`telephone` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `locataires` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`nom` text NOT NULL,
	`adresse` text NOT NULL,
	`email` text,
	`telephone` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quittances` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`appartement_id` text NOT NULL,
	`numero` integer NOT NULL,
	`mois` text NOT NULL,
	`annee` integer NOT NULL,
	`montant_loyer` real NOT NULL,
	`montant_charges` real NOT NULL,
	`montant_total` real NOT NULL,
	`locataire_data` text,
	`date_debut` text,
	`date_fin` text,
	`date_paiement` text,
	`date_emission` text,
	`lieu_emission` text,
	`mode_paiement` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`appartement_id`) REFERENCES `appartements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
