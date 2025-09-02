import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

//Usuários
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

//Tabela para armazenar processos arquivados
export const archivedProcessesTable = pgTable("archived_processes", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseNumber: text("case_number").notNull(),
  consumerName: text("consumer_name").notNull(),
  supplierName: text("supplier_name").notNull(),
  processFolderNumber: text("process_folder_number").notNull(),
  numberOfPages: integer("number_of_pages").notNull(),
  filingDate: timestamp("filing_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Logs de ações
export const logsTable = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Usuário que executou a ação
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onUpdate: "cascade" }),

  // Processo arquivado (pode ser null se o log for de outra ação no sistema)
  archivedProcessId: uuid("archived_process_id")
    .references(() => archivedProcessesTable.id, { onDelete: "set null" }),
});


