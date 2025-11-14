import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for authentication)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'personnel']);

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['preparing', 'on_delivery', 'delivered', 'cancelled']);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'bank_transfer']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('customer').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(), // Store price in cents to avoid floating point issues
  imageUrl: varchar("image_url"),
  stock: integer("stock").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Delivery regions table
export const deliveryRegions = pgTable("delivery_regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  minEtaMinutes: integer("min_eta_minutes").default(30).notNull(),
  maxEtaMinutes: integer("max_eta_minutes").default(120).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Camping locations table
export const campingLocations = pgTable("camping_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  regionId: varchar("region_id").notNull().references(() => deliveryRegions.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Delivery time slots table
export const deliverySlots = pgTable("delivery_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  regionId: varchar("region_id").notNull().references(() => deliveryRegions.id, { onDelete: 'cascade' }),
  startTime: varchar("start_time", { length: 5 }).notNull(), // Format: "HH:MM"
  endTime: varchar("end_time", { length: 5 }).notNull(), // Format: "HH:MM"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: orderStatusEnum("status").default('preparing').notNull(),
  totalAmountInCents: integer("total_amount_in_cents").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  
  // Delivery information
  regionId: varchar("region_id").references(() => deliveryRegions.id), // Nullable - Istanbul fixed
  campingLocationId: varchar("camping_location_id").references(() => campingLocations.id),
  customAddress: text("custom_address"), // Now used as delivery note
  deliverySlotId: varchar("delivery_slot_id").references(() => deliverySlots.id), // Nullable - dynamic time slots
  estimatedDeliveryTime: varchar("estimated_delivery_time", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar("product_id").notNull().references(() => products.id),
  
  // Snapshot of product at order time
  productName: varchar("product_name", { length: 255 }).notNull(),
  productPriceInCents: integer("product_price_in_cents").notNull(),
  
  quantity: integer("quantity").notNull(),
  subtotalInCents: integer("subtotal_in_cents").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stock movements table
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantityChange: integer("quantity_change").notNull(), // Positive for additions, negative for subtractions
  reason: varchar("reason", { length: 255 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table (JSON key-value store)
export const settings = pgTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit log table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id"),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  stockMovements: many(stockMovements),
}));

export const deliveryRegionsRelations = relations(deliveryRegions, ({ many }) => ({
  campingLocations: many(campingLocations),
  deliverySlots: many(deliverySlots),
  orders: many(orders),
}));

export const campingLocationsRelations = relations(campingLocations, ({ one, many }) => ({
  region: one(deliveryRegions, {
    fields: [campingLocations.regionId],
    references: [deliveryRegions.id],
  }),
  orders: many(orders),
}));

export const deliverySlotsRelations = relations(deliverySlots, ({ one, many }) => ({
  region: one(deliveryRegions, {
    fields: [deliverySlots.regionId],
    references: [deliveryRegions.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  region: one(deliveryRegions, {
    fields: [orders.regionId],
    references: [deliveryRegions.id],
  }),
  campingLocation: one(campingLocations, {
    fields: [orders.campingLocationId],
    references: [campingLocations.id],
  }),
  deliverySlot: one(deliverySlots, {
    fields: [orders.deliverySlotId],
    references: [deliverySlots.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  phone: z.string().regex(/^[0-9]{10}$/, "Telefon numarası 10 haneli olmalıdır (5xxxxxxxxx)"),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  role: true,
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "Ad gerekli").optional(),
  lastName: z.string().min(1, "Soyad gerekli").optional(),
  phone: z.string().regex(/^[0-9]{10}$/, "Telefon numarası 10 haneli olmalıdır (5xxxxxxxxx)").optional(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryRegionSchema = createInsertSchema(deliveryRegions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampingLocationSchema = createInsertSchema(campingLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliverySlotSchema = createInsertSchema(deliverySlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type DeliveryRegion = typeof deliveryRegions.$inferSelect;
export type InsertDeliveryRegion = z.infer<typeof insertDeliveryRegionSchema>;

export type CampingLocation = typeof campingLocations.$inferSelect;
export type InsertCampingLocation = z.infer<typeof insertCampingLocationSchema>;

export type DeliverySlot = typeof deliverySlots.$inferSelect;
export type InsertDeliverySlot = z.infer<typeof insertDeliverySlotSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Order status type
export type OrderStatus = 'preparing' | 'on_delivery' | 'delivered' | 'cancelled';

// Payment method type
export type PaymentMethod = 'cash' | 'bank_transfer';

// User role type
export type UserRole = 'customer' | 'admin' | 'personnel';
