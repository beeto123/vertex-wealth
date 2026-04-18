import { pgTable, uuid, varchar, decimal, timestamp, boolean, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("active"),
  kycStatus: varchar("kyc_status", { length: 20 }).default("pending"),
  kycDocumentUrl: text("kyc_document_url"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("9.00"),
  isAdmin: boolean("is_admin").default(false),
});

export const balances = pgTable("balances", {
  userId: uuid("user_id").primaryKey().references(() => users.id),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  totalDeposited: decimal("total_deposited", { precision: 15, scale: 2 }).default("0.00"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 15, scale: 2 }).default("0.00"),
  totalInterestEarned: decimal("total_interest_earned", { precision: 15, scale: 2 }).default("0.00"),
  lastInterestCalc: timestamp("last_interest_calc").defaultNow(),
});

export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  txHash: varchar("tx_hash", { length: 100 }).notNull(),
  network: varchar("network", { length: 20 }).default("TRC-20"),
  status: varchar("status", { length: 20 }).default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  adminMessage: text("admin_message"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const interestTransactions = pgTable("interest_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  baseAmount: decimal("base_amount", { precision: 15, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 15, scale: 2 }).notNull(),
  rateApplied: decimal("rate_applied", { precision: 5, scale: 2 }).notNull(),
  creditedAt: timestamp("credited_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});