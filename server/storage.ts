import {
  users,
  categories,
  products,
  deliveryRegions,
  campingLocations,
  deliverySlots,
  orders,
  orderItems,
  stockMovements,
  settings,
  auditLogs,
  type User,
  type InsertUser,
  type UpsertUser,
  type UpdateUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type DeliveryRegion,
  type InsertDeliveryRegion,
  type CampingLocation,
  type InsertCampingLocation,
  type DeliverySlot,
  type InsertDeliverySlot,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type StockMovement,
  type InsertStockMovement,
  type Setting,
  type InsertSetting,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, ilike } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: UpdateUser): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Product operations
  getProducts(filters?: { categoryId?: string }): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string, limit?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Delivery region operations
  getDeliveryRegions(): Promise<DeliveryRegion[]>;
  getDeliveryRegion(id: string): Promise<DeliveryRegion | undefined>;
  createDeliveryRegion(region: InsertDeliveryRegion): Promise<DeliveryRegion>;
  updateDeliveryRegion(id: string, region: Partial<InsertDeliveryRegion>): Promise<DeliveryRegion | undefined>;
  deleteDeliveryRegion(id: string): Promise<boolean>;

  // Camping location operations
  getCampingLocations(filters?: { regionId?: string }): Promise<CampingLocation[]>;
  getCampingLocation(id: string): Promise<CampingLocation | undefined>;
  createCampingLocation(location: InsertCampingLocation): Promise<CampingLocation>;
  updateCampingLocation(id: string, location: Partial<InsertCampingLocation>): Promise<CampingLocation | undefined>;
  deleteCampingLocation(id: string): Promise<boolean>;

  // Delivery slot operations
  getDeliverySlots(filters?: { regionId?: string }): Promise<DeliverySlot[]>;
  getDeliverySlot(id: string): Promise<DeliverySlot | undefined>;
  createDeliverySlot(slot: InsertDeliverySlot): Promise<DeliverySlot>;
  updateDeliverySlot(id: string, slot: Partial<InsertDeliverySlot>): Promise<DeliverySlot | undefined>;
  deleteDeliverySlot(id: string): Promise<boolean>;

  // Order operations
  getOrders(filters?: { userId?: string }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Order item operations
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Stock movement operations
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  updateProductStock(productId: string, quantityChange: number): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<any>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.sortOrder, categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Product operations
  async getProducts(filters?: { categoryId?: string }): Promise<Product[]> {
    if (filters?.categoryId) {
      return db.select().from(products).where(eq(products.categoryId, filters.categoryId)).orderBy(products.name);
    }
    return db.select().from(products).orderBy(products.name);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isFeatured, true)).orderBy(products.name);
  }

  async searchProducts(query: string, limit: number = 5): Promise<Product[]> {
    if (query.length < 3) {
      return [];
    }
    return db
      .select()
      .from(products)
      .where(and(
        ilike(products.name, `%${query}%`),
        eq(products.isActive, true)
      ))
      .orderBy(products.name)
      .limit(limit);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Delivery region operations
  async getDeliveryRegions(): Promise<DeliveryRegion[]> {
    return db.select().from(deliveryRegions).orderBy(deliveryRegions.name);
  }

  async getDeliveryRegion(id: string): Promise<DeliveryRegion | undefined> {
    const [region] = await db.select().from(deliveryRegions).where(eq(deliveryRegions.id, id));
    return region;
  }

  async createDeliveryRegion(region: InsertDeliveryRegion): Promise<DeliveryRegion> {
    const [newRegion] = await db.insert(deliveryRegions).values(region).returning();
    return newRegion;
  }

  async updateDeliveryRegion(id: string, region: Partial<InsertDeliveryRegion>): Promise<DeliveryRegion | undefined> {
    const [updated] = await db
      .update(deliveryRegions)
      .set({ ...region, updatedAt: new Date() })
      .where(eq(deliveryRegions.id, id))
      .returning();
    return updated;
  }

  async deleteDeliveryRegion(id: string): Promise<boolean> {
    const result = await db.delete(deliveryRegions).where(eq(deliveryRegions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Camping location operations
  async getCampingLocations(filters?: { regionId?: string }): Promise<CampingLocation[]> {
    if (filters?.regionId) {
      return db.select().from(campingLocations).where(eq(campingLocations.regionId, filters.regionId)).orderBy(campingLocations.name);
    }
    return db.select().from(campingLocations).orderBy(campingLocations.name);
  }

  async getCampingLocation(id: string): Promise<CampingLocation | undefined> {
    const [location] = await db.select().from(campingLocations).where(eq(campingLocations.id, id));
    return location;
  }

  async createCampingLocation(location: InsertCampingLocation): Promise<CampingLocation> {
    const [newLocation] = await db.insert(campingLocations).values(location).returning();
    return newLocation;
  }

  async updateCampingLocation(id: string, location: Partial<InsertCampingLocation>): Promise<CampingLocation | undefined> {
    const [updated] = await db
      .update(campingLocations)
      .set({ ...location, updatedAt: new Date() })
      .where(eq(campingLocations.id, id))
      .returning();
    return updated;
  }

  async deleteCampingLocation(id: string): Promise<boolean> {
    const result = await db.delete(campingLocations).where(eq(campingLocations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Delivery slot operations
  async getDeliverySlots(filters?: { regionId?: string }): Promise<DeliverySlot[]> {
    if (filters?.regionId) {
      return db.select().from(deliverySlots).where(eq(deliverySlots.regionId, filters.regionId)).orderBy(deliverySlots.startTime);
    }
    return db.select().from(deliverySlots).orderBy(deliverySlots.startTime);
  }

  async getDeliverySlot(id: string): Promise<DeliverySlot | undefined> {
    const [slot] = await db.select().from(deliverySlots).where(eq(deliverySlots.id, id));
    return slot;
  }

  async createDeliverySlot(slot: InsertDeliverySlot): Promise<DeliverySlot> {
    const [newSlot] = await db.insert(deliverySlots).values(slot).returning();
    return newSlot;
  }

  async updateDeliverySlot(id: string, slot: Partial<InsertDeliverySlot>): Promise<DeliverySlot | undefined> {
    const [updated] = await db
      .update(deliverySlots)
      .set({ ...slot, updatedAt: new Date() })
      .where(eq(deliverySlots.id, id))
      .returning();
    return updated;
  }

  async deleteDeliverySlot(id: string): Promise<boolean> {
    const result = await db.delete(deliverySlots).where(eq(deliverySlots.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Order operations
  async getOrders(filters?: { userId?: string }): Promise<Order[]> {
    if (filters?.userId) {
      return db.select().from(orders).where(eq(orders.userId, filters.userId)).orderBy(desc(orders.createdAt));
    }
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Order item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }

  // Stock movement operations
  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [newMovement] = await db.insert(stockMovements).values(movement).returning();
    return newMovement;
  }

  async updateProductStock(productId: string, quantityChange: number): Promise<void> {
    await db
      .update(products)
      .set({
        stock: sql`${products.stock} + ${quantityChange}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total stats
    const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const totalRevenue = await db.select({ sum: sql<number>`coalesce(sum(${orders.totalAmountInCents}), 0)` }).from(orders);

    // Today stats
    const todayOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, todayStart));
    const todayRevenue = await db.select({ sum: sql<number>`coalesce(sum(${orders.totalAmountInCents}), 0)` }).from(orders).where(gte(orders.createdAt, todayStart));

    // Week stats
    const weekOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, weekStart));
    const weekRevenue = await db.select({ sum: sql<number>`coalesce(sum(${orders.totalAmountInCents}), 0)` }).from(orders).where(gte(orders.createdAt, weekStart));

    // Top products
    const topProducts = await db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        totalSold: sql<number>`sum(${orderItems.quantity})`,
        revenue: sql<number>`sum(${orderItems.subtotalInCents})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId, orderItems.productName)
      .orderBy(desc(sql`sum(${orderItems.subtotalInCents})`))
      .limit(5);

    return {
      totalOrders: Number(totalOrders[0]?.count || 0),
      totalRevenue: Number(totalRevenue[0]?.sum || 0),
      todayOrders: Number(todayOrders[0]?.count || 0),
      todayRevenue: Number(todayRevenue[0]?.sum || 0),
      weekOrders: Number(weekOrders[0]?.count || 0),
      weekRevenue: Number(weekRevenue[0]?.sum || 0),
      topProducts: topProducts.map(p => ({
        productId: p.productId,
        productName: p.productName,
        totalSold: Number(p.totalSold),
        revenue: Number(p.revenue),
      })),
    };
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    const [newSetting] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: setting.value,
          description: setting.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newSetting;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
