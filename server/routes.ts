import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated, isAdminOrPersonnel } from "./replitAuth";
import {
  insertCategorySchema,
  insertProductSchema,
  insertDeliveryRegionSchema,
  insertCampingLocationSchema,
  insertDeliverySlotSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertSettingSchema,
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Get current user
  app.get("/api/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const dbUser = await storage.getUser(user.claims.sub);
      
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(dbUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== CATEGORY ENDPOINTS =====
  
  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single category
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create category (admin only)
  app.post("/api/categories", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update category (admin only)
  app.patch("/api/categories/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.omit({ id: true, createdAt: true, updatedAt: true }).partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete category (admin only)
  app.delete("/api/categories/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== PRODUCT ENDPOINTS =====
  
  // Get all products (with optional category filter)
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const products = await storage.getProducts(categoryId ? { categoryId } : undefined);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get featured products
  app.get("/api/products/featured/list", async (_req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create product (admin only)
  app.post("/api/products", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertProductSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update product (admin only)
  app.patch("/api/products/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertProductSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete product (admin only)
  app.delete("/api/products/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== DELIVERY REGION ENDPOINTS =====
  
  // Get all delivery regions
  app.get("/api/delivery-regions", async (_req, res) => {
    try {
      const regions = await storage.getDeliveryRegions();
      res.json(regions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create delivery region (admin only)
  app.post("/api/delivery-regions", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertDeliveryRegionSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const region = await storage.createDeliveryRegion(validatedData);
      res.status(201).json(region);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update delivery region (admin only)
  app.patch("/api/delivery-regions/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertDeliveryRegionSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial().parse(req.body);
      const region = await storage.updateDeliveryRegion(req.params.id, validatedData);
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }
      res.json(region);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete delivery region (admin only)
  app.delete("/api/delivery-regions/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const success = await storage.deleteDeliveryRegion(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Region not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== CAMPING LOCATION ENDPOINTS =====
  
  // Get all camping locations (with optional region filter)
  app.get("/api/camping-locations", async (req, res) => {
    try {
      const regionId = req.query.regionId as string | undefined;
      const locations = await storage.getCampingLocations(regionId ? { regionId } : undefined);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create camping location (admin only)
  app.post("/api/camping-locations", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertCampingLocationSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const location = await storage.createCampingLocation(validatedData);
      res.status(201).json(location);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update camping location (admin only)
  app.patch("/api/camping-locations/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertCampingLocationSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial().parse(req.body);
      const location = await storage.updateCampingLocation(req.params.id, validatedData);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete camping location (admin only)
  app.delete("/api/camping-locations/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const success = await storage.deleteCampingLocation(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== DELIVERY SLOT ENDPOINTS =====
  
  // Get all delivery slots (with optional region filter)
  app.get("/api/delivery-slots", async (req, res) => {
    try {
      const regionId = req.query.regionId as string | undefined;
      const slots = await storage.getDeliverySlots(regionId ? { regionId } : undefined);
      res.json(slots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create delivery slot (admin only)
  app.post("/api/delivery-slots", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertDeliverySlotSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const slot = await storage.createDeliverySlot(validatedData);
      res.status(201).json(slot);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update delivery slot (admin only)
  app.patch("/api/delivery-slots/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertDeliverySlotSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial().parse(req.body);
      const slot = await storage.updateDeliverySlot(req.params.id, validatedData);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
      res.json(slot);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete delivery slot (admin only)
  app.delete("/api/delivery-slots/:id", isAdminOrPersonnel, async (req, res) => {
    try {
      const success = await storage.deleteDeliverySlot(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Slot not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== ORDER ENDPOINTS =====
  
  // Get all orders (user's own orders for customers, all orders for admin)
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const dbUser = await storage.getUser(user.claims.sub);
      
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }

      let orders;
      if (dbUser.role === 'admin' || dbUser.role === 'personnel') {
        orders = await storage.getOrders();
      } else {
        orders = await storage.getOrders({ userId: dbUser.id });
      }
      
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all orders (admin only endpoint)
  app.get("/api/admin/orders", isAdminOrPersonnel, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single order
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user owns this order or is admin
      const user = req.user as any;
      const dbUser = await storage.getUser(user.claims.sub);
      
      if (!dbUser || (order.userId !== dbUser.id && dbUser.role !== 'admin' && dbUser.role !== 'personnel')) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create order
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const dbUser = await storage.getUser(user.claims.sub);
      
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertOrderSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse({
        ...req.body,
        userId: dbUser.id,
      });
      
      const order = await storage.createOrder(validatedData);
      
      // Create order items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const validatedItem = insertOrderItemSchema.omit({ id: true, createdAt: true }).parse({
            ...item,
            orderId: order.id,
          });
          await storage.createOrderItem(validatedItem);
        }
      }
      
      res.status(201).json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update order status (admin only)
  app.patch("/api/orders/:id/status", isAdminOrPersonnel, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== DASHBOARD ENDPOINTS =====
  
  // Get dashboard stats (admin only)
  app.get("/api/admin/dashboard-stats", isAdminOrPersonnel, async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== SETTINGS ENDPOINTS =====
  
  // Get setting
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Set setting (admin only)
  app.post("/api/settings", isAdminOrPersonnel, async (req, res) => {
    try {
      const validatedData = insertSettingSchema.omit({ createdAt: true, updatedAt: true }).parse(req.body);
      const setting = await storage.setSetting(validatedData);
      res.json(setting);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: error.message });
    }
  });
}
