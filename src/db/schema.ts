import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Better Auth Tables
export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }),
	updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// Application Tables
export const bailleurs = sqliteTable("bailleurs", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id),
	nom: text("nom").notNull(),
	adresse: text("adresse").notNull(),
	email: text("email"),
	type: text("type", { enum: ["personne_physique", "societe"] }).notNull(),
	siret: text("siret"),
	telephone: text("telephone"),
	createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const locataires = sqliteTable("locataires", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id),
	nom: text("nom").notNull(),
	adresse: text("adresse").notNull(),
	email: text("email"),
	telephone: text("telephone"),
	createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const appartements = sqliteTable("appartements", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id),
	bailleurId: text("bailleur_id").notNull().references(() => bailleurs.id),
	adresse: text("adresse").notNull(),
	loyer: real("loyer").notNull(),
	charges: real("charges").notNull(),
	isColocation: integer("is_colocation", { mode: "boolean" }).default(false),
	loyerParLocataire: text("loyer_par_locataire", { mode: "json" }),
	locataireIds: text("locataire_ids", { mode: "json" }),
	createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const quittances = sqliteTable("quittances", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id),
	appartementId: text("appartement_id").notNull().references(() => appartements.id),
	numero: integer("numero").notNull(),
	mois: text("mois").notNull(),
	annee: integer("annee").notNull(),
	montantLoyer: real("montant_loyer").notNull(),
	montantCharges: real("montant_charges").notNull(),
	montantTotal: real("montant_total").notNull(),
	locataireData: text("locataire_data", { mode: "json" }),
	dateDebut: text("date_debut"),
	dateFin: text("date_fin"),
	datePaiement: text("date_paiement"),
	dateEmission: text("date_emission"),
	lieuEmission: text("lieu_emission"),
	modePaiement: text("mode_paiement"),
	createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const appartementLocataires = sqliteTable("appartement_locataires", {
	id: text("id").primaryKey(),
	appartementId: text("appartement_id").notNull().references(() => appartements.id),
	locataireId: text("locataire_id").notNull().references(() => locataires.id),
	dateEntree: text("date_entree").notNull(),
	dateSortie: text("date_sortie"),
	loyer: real("loyer"),
	charges: real("charges"),
});
