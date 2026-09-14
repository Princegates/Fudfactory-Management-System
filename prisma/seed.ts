import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// `prisma migrate dev` auto-runs this seed script the first time it creates
// the database, so running `npm run db:seed` again afterward (or at any
// later point, to reset the demo data) re-runs it against a non-empty
// database. Everything below this point uses upsert(), but transactional
// records (orders, inventory, recipes, etc.) don't have a natural unique
// key to upsert on — so clear them first to keep this script safely
// re-runnable instead of failing on unique-constraint collisions.
async function resetDemoData() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.quotation.deleteMany(),
    prisma.productionItem.deleteMany(),
    prisma.productionOrder.deleteMany(),
    prisma.review.deleteMany(),
    prisma.loyaltyTransaction.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.delivery.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.recipeItem.deleteMany(),
    prisma.recipe.deleteMany(),
    prisma.inventoryTransaction.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.promotion.deleteMany(),
    prisma.expense.deleteMany(),
  ]);
}

async function main() {
  console.log("Seeding FudFactory demo data...");
  await resetDemoData();

  // --- Staff users (one per role) ---------------------------------------
  const staffPassword = await hash("Password123!");
  const staffAccounts = [
    { name: "Ama Owusu", email: "admin@fudfactory.gh", role: "SUPER_ADMIN" as const, department: "Management" },
    { name: "Kojo Mensah", email: "owner@fudfactory.gh", role: "OWNER_MANAGER" as const, department: "Management" },
    { name: "Efua Boateng", email: "cashier@fudfactory.gh", role: "CASHIER" as const, department: "Sales" },
    { name: "Yaw Asante", email: "inventory@fudfactory.gh", role: "INVENTORY_OFFICER" as const, department: "Inventory" },
    { name: "Abena Darko", email: "production@fudfactory.gh", role: "PRODUCTION_OFFICER" as const, department: "Kitchen" },
    { name: "Kwame Addo", email: "delivery@fudfactory.gh", role: "DELIVERY_OFFICER" as const, department: "Delivery" },
  ];
  for (const acct of staffAccounts) {
    await prisma.user.upsert({
      where: { email: acct.email },
      update: {},
      create: { ...acct, passwordHash: staffPassword },
    });
  }
  console.log(`Created ${staffAccounts.length} staff accounts (password: Password123!)`);

  // --- Categories ---------------------------------------------------------
  const categoryNames = [
    "Food Hampers",
    "Breakfast",
    "Starters & Finger Foods",
    "Soups & Stews",
    "Lunch",
    "Pastries",
    "Events",
    "Drinks",
  ];
  const categories: Record<string, string> = {};
  for (const [idx, name] of categoryNames.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), sortOrder: idx },
    });
    categories[name] = category.id;
  }

  // --- Suppliers ------------------------------------------------------------
  const supplier1 = await prisma.supplier.create({
    data: { name: "Accra Wholesale Foods", phone: "+233201112233", email: "sales@accrawholesale.gh", itemsSupplied: "Flour, Sugar, Cooking Oil" },
  });
  const supplier2 = await prisma.supplier.create({
    data: { name: "Kumasi Fresh Meats", phone: "+233244556677", email: "orders@kumasifresh.gh", itemsSupplied: "Meat, Chicken" },
  });

  // --- Raw material inventory ----------------------------------------------
  const rawMaterials: Record<string, { unit: string; cost: number; min: number; stock: number; supplierId?: string }> = {
    Flour: { unit: "g", cost: 0.008, min: 20000, stock: 50000, supplierId: supplier1.id },
    Sugar: { unit: "g", cost: 0.01, min: 10000, stock: 30000, supplierId: supplier1.id },
    Eggs: { unit: "pcs", cost: 1.5, min: 50, stock: 200 },
    Butter: { unit: "g", cost: 0.05, min: 5000, stock: 15000 },
    Milk: { unit: "ml", cost: 0.015, min: 5000, stock: 20000 },
    Meat: { unit: "g", cost: 0.06, min: 10000, stock: 25000, supplierId: supplier2.id },
    Chicken: { unit: "g", cost: 0.045, min: 10000, stock: 20000, supplierId: supplier2.id },
    "Cooking Oil": { unit: "ml", cost: 0.012, min: 8000, stock: 20000, supplierId: supplier1.id },
    Chocolate: { unit: "g", cost: 0.03, min: 5000, stock: 12000 },
    Cream: { unit: "ml", cost: 0.02, min: 3000, stock: 8000 },
    Potato: { unit: "g", cost: 0.007, min: 8000, stock: 15000 },
    Onion: { unit: "g", cost: 0.006, min: 3000, stock: 8000 },
    Margarine: { unit: "g", cost: 0.02, min: 4000, stock: 10000 },
  };
  const ingredientIds: Record<string, string> = {};
  for (const [name, cfg] of Object.entries(rawMaterials)) {
    const item = await prisma.inventoryItem.create({
      data: {
        sku: `RM-${slugify(name).toUpperCase()}`,
        name,
        itemType: "RAW_MATERIAL",
        unit: cfg.unit,
        costPerUnit: cfg.cost,
        minStock: cfg.min,
        currentStock: cfg.stock,
        supplierId: cfg.supplierId,
      },
    });
    ingredientIds[name] = item.id;
  }

  // --- Products --------------------------------------------------------------
  // Real breakfast packages and lunch menu, transcribed from FudFactory's own
  // Instagram menu flyers — replaces the earlier placeholder Breakfast/Lunch
  // demo items with the business's actual offerings and prices.
  const productDefs: { name: string; category: string; price: number; featured: boolean; description?: string }[] = [
    { name: "Family Food Hamper", category: "Food Hampers", price: 250, featured: true },
    { name: "Meat Pie", category: "Starters & Finger Foods", price: 8, featured: true },
    { name: "Chicken Pie", category: "Starters & Finger Foods", price: 9, featured: true },
    { name: "Groundnut Soup with Fufu", category: "Soups & Stews", price: 45, featured: false },
    { name: "Doughnut", category: "Pastries", price: 4, featured: true },
    { name: "Chocolate Cake (Slice)", category: "Pastries", price: 15, featured: true },
    { name: "Vanilla Birthday Cake", category: "Events", price: 180, featured: false },
    { name: "Sobolo (Hibiscus Drink)", category: "Drinks", price: 6, featured: false },

    // Breakfast Surprise Packages
    {
      name: "Uno Package",
      category: "Breakfast",
      price: 300,
      featured: false,
      description: "English pancakes, mini pies, waffles, fruit, sausage, baked beans, scrambled eggs and juice.",
    },
    {
      name: "Simple Package",
      category: "Breakfast",
      price: 450,
      featured: false,
      description: "English pancakes, waffles, scrambled eggs, sausage, fruits, juice, baked beans and crispy chicken breast.",
    },
    {
      name: "Sweet Sunrise",
      category: "Breakfast",
      price: 500,
      featured: true,
      description: "English pancakes, waffles, scrambled eggs, sausage, yoghurt with healthy toppings, baked beans, juice and crispy chicken breast.",
    },
    {
      name: "Family Bite",
      category: "Breakfast",
      price: 900,
      featured: false,
      description: "English pancakes, waffles, scrambled eggs, sausage, yoghurt with healthy toppings, juices, baked beans, crispy chicken breast and sandwich.",
    },

    // Lunch Price List — Jollof
    { name: "Jollof & Classic Beef Steak", category: "Lunch", price: 300, featured: false },
    { name: "Jollof & Lamb Chops", category: "Lunch", price: 320, featured: false },
    { name: "Jollof & Goat", category: "Lunch", price: 160, featured: false },
    { name: "Jollof & Prawns", category: "Lunch", price: 300, featured: false },
    { name: "Jollof & Chicken", category: "Lunch", price: 110, featured: true },
    { name: "Jollof & Chicken Lollipop", category: "Lunch", price: 150, featured: false },
    { name: "Jollof & Fish Fillet", category: "Lunch", price: 250, featured: false },
    { name: "Jollof & Red Fish", category: "Lunch", price: 130, featured: false },
    { name: "Jollof & Turkey", category: "Lunch", price: 140, featured: false },
    { name: "Jollof & Grilled Tilapia", category: "Lunch", price: 150, featured: false },
    { name: "Jollof & Gizzard", category: "Lunch", price: 100, featured: false },
    { name: "Jollof & Peppered Snails", category: "Lunch", price: 250, featured: false },
    { name: "Assorted Jollof", category: "Lunch", price: 150, featured: false },
    { name: "Assorted Jollof & Shrimps", category: "Lunch", price: 200, featured: false },
    { name: "Seafood Jollof", category: "Lunch", price: 250, featured: false },
    { name: "Local Jollof", category: "Lunch", price: 120, featured: false },

    // Lunch Price List — Fried Rice
    { name: "Fried Rice & Peppered Goat", category: "Lunch", price: 160, featured: false },
    { name: "Fried Rice & Chicken Lollipop", category: "Lunch", price: 150, featured: false },
    { name: "Fried Rice & Grilled/Fried Chicken", category: "Lunch", price: 110, featured: false },
    { name: "Fried Rice & Shrimps", category: "Lunch", price: 160, featured: false },
    { name: "Fried Rice & Turkey", category: "Lunch", price: 140, featured: false },
    { name: "Assorted Fried Rice", category: "Lunch", price: 150, featured: false },
    { name: "Assorted Fried Rice & Shrimps", category: "Lunch", price: 200, featured: false },

    // Lunch Price List — Check Check
    { name: "Check Check & Chicken", category: "Lunch", price: 100, featured: false },
    { name: "Check Check & Goat", category: "Lunch", price: 160, featured: false },
    { name: "Check Check & Pork", category: "Lunch", price: 140, featured: false },
    { name: "Check Check & Turkey", category: "Lunch", price: 140, featured: false },
    { name: "Check Check & Fish", category: "Lunch", price: 140, featured: false },
    { name: "Check Check & Shrimps", category: "Lunch", price: 160, featured: false },

    // Lunch Price List — Spaghetti
    { name: "Meat Veg. Spaghetti", category: "Lunch", price: 130, featured: false },
    { name: "Chicken Veg. Spaghetti", category: "Lunch", price: 130, featured: false },
    { name: "Assorted Spaghetti", category: "Lunch", price: 150, featured: false },
    { name: "Seafood Spaghetti", category: "Lunch", price: 250, featured: false },
    { name: "FudFactory Shrimp Spaghetti", category: "Lunch", price: 200, featured: false },
    { name: "Shrimp Creamy Pasta", category: "Lunch", price: 300, featured: false },

    // Lunch Price List — Plain Rice
    { name: "Plain Rice & Kontomire Stew", category: "Lunch", price: 130, featured: false },
    { name: "Plain Rice, Coleslaw & Goat Stew", category: "Lunch", price: 160, featured: false },
    { name: "Plain Rice & Chicken Stew", category: "Lunch", price: 110, featured: false },
    { name: "Peppered Rice with Chicken", category: "Lunch", price: 110, featured: false },
    { name: "Plain Rice & Vegetable Stew", category: "Lunch", price: 150, featured: false },
    { name: "Plain Rice & Egg Stew", category: "Lunch", price: 140, featured: false },

    // Lunch Price List — Locals
    { name: "Yam/Plantain & Palava Sauce", category: "Lunch", price: 130, featured: false },
    { name: "Yam & Egg Stew", category: "Lunch", price: 140, featured: false },
    { name: "Yam & Garden Eggs Stew", category: "Lunch", price: 150, featured: false },
    { name: "Beans Stew & Riped Plantain", category: "Lunch", price: 100, featured: false },
    { name: "Beans Stew, Rice & Plantain", category: "Lunch", price: 150, featured: false },
    { name: "Fufu & Goat Light Soup", category: "Lunch", price: 160, featured: false },
    { name: "Fufu & Chicken/Wings Light Soup", category: "Lunch", price: 150, featured: false },
    { name: "Mpotompoto", category: "Lunch", price: 100, featured: false },
    { name: "Etor", category: "Lunch", price: 100, featured: false },
    { name: "Angwamu", category: "Lunch", price: 100, featured: false },
    { name: "Waakye", category: "Lunch", price: 100, featured: true },
    { name: "Banku & Grilled/Fried Tilapia", category: "Lunch", price: 150, featured: false },
    { name: "Banku & Okro Stew", category: "Lunch", price: 130, featured: false },
    { name: "Banku & Seafood Okro", category: "Lunch", price: 300, featured: false },
    { name: "Garifoto", category: "Lunch", price: 100, featured: false },
    { name: "Beach Yam", category: "Lunch", price: 100, featured: false },
    { name: "Kenkey & Fish", category: "Lunch", price: 100, featured: false },
    { name: "Acheke & Tilapia", category: "Lunch", price: 150, featured: false },
    { name: "Native Rice", category: "Lunch", price: 150, featured: false },
  ];
  const productIds: Record<string, string> = {};
  for (const def of productDefs) {
    const product = await prisma.product.create({
      data: {
        name: def.name,
        slug: slugify(def.name),
        categoryId: categories[def.category],
        price: def.price,
        isFeatured: def.featured,
        description: def.description ?? `Freshly made ${def.name.toLowerCase()} from the FudFactory kitchen.`,
      },
    });
    productIds[def.name] = product.id;
  }

  // --- Finished-goods inventory tracking for a few products -------------------
  const finishedGoods = [
    { product: "Meat Pie", stock: 40, min: 20 },
    { product: "Chicken Pie", stock: 15, min: 20 }, // intentionally low to demo alerts
    { product: "Doughnut", stock: 60, min: 30 },
  ];
  for (const fg of finishedGoods) {
    await prisma.inventoryItem.create({
      data: {
        sku: `FG-${slugify(fg.product).toUpperCase()}`,
        name: fg.product,
        itemType: "FINISHED_PRODUCT",
        unit: "pcs",
        costPerUnit: 0,
        currentStock: fg.stock,
        minStock: fg.min,
        productId: productIds[fg.product],
      },
    });
  }

  // --- Recipes (SRS example: Meat Pie = flour 100g, meat 50g, potato 30g, onion 10g, margarine 20g) ---
  const meatPieRecipe = await prisma.recipe.create({
    data: {
      productId: productIds["Meat Pie"],
      name: "Classic Meat Pie",
      yieldQuantity: 1,
      laborCost: 0.5,
      packagingCost: 0.3,
      overheadCost: 0.2,
      items: {
        create: [
          { ingredientId: ingredientIds["Flour"], quantityPerYield: 100 },
          { ingredientId: ingredientIds["Meat"], quantityPerYield: 50 },
          { ingredientId: ingredientIds["Potato"], quantityPerYield: 30 },
          { ingredientId: ingredientIds["Onion"], quantityPerYield: 10 },
          { ingredientId: ingredientIds["Margarine"], quantityPerYield: 20 },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      productId: productIds["Doughnut"],
      name: "Glazed Doughnut",
      yieldQuantity: 1,
      laborCost: 0.2,
      packagingCost: 0.1,
      overheadCost: 0.1,
      items: {
        create: [
          { ingredientId: ingredientIds["Flour"], quantityPerYield: 60 },
          { ingredientId: ingredientIds["Sugar"], quantityPerYield: 15 },
          { ingredientId: ingredientIds["Eggs"], quantityPerYield: 0.2 },
          { ingredientId: ingredientIds["Milk"], quantityPerYield: 20 },
          { ingredientId: ingredientIds["Cooking Oil"], quantityPerYield: 30 },
        ],
      },
    },
  });

  // --- Customers ---------------------------------------------------------------
  const customerPassword = await hash("Password123!");
  const customer1 = await prisma.customer.create({
    data: {
      name: "Adjoa Mensimah",
      phone: "+233501234567",
      email: "adjoa@example.com",
      passwordHash: customerPassword,
      address: "12 Osu Street, Accra",
      segment: "VIP",
      loyaltyPoints: 340,
      totalPurchases: 2450,
    },
  });
  const customer2 = await prisma.customer.create({
    data: {
      name: "Kwabena Owusu",
      phone: "+233559876543",
      email: "kwabena@example.com",
      address: "45 Ring Road, Kumasi",
      segment: "REGULAR",
      loyaltyPoints: 60,
      totalPurchases: 610,
    },
  });

  // --- A completed online order with items, payment, review --------------------
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-000101",
      channel: "ONLINE",
      customerId: customer1.id,
      status: "COMPLETED",
      fulfillmentType: "DELIVERY",
      deliveryAddress: customer1.address!,
      subtotal: 46,
      discountAmount: 0,
      deliveryFee: 15,
      totalAmount: 61,
      paymentStatus: "SUCCESSFUL",
      items: {
        create: [
          { productId: productIds["Meat Pie"], productName: "Meat Pie", unitPrice: 8, quantity: 3, subtotal: 24 },
          { productId: productIds["Chocolate Cake (Slice)"], productName: "Chocolate Cake (Slice)", unitPrice: 15, quantity: 1, subtotal: 15 },
          { productId: productIds["Doughnut"], productName: "Doughnut", unitPrice: 4, quantity: 1.75, subtotal: 7 },
        ],
      },
      payments: { create: [{ amount: 61, method: "MOBILE_MONEY", status: "SUCCESSFUL", paidAt: new Date(), customerId: customer1.id }] },
    },
  });
  await prisma.review.create({
    data: { customerId: customer1.id, orderId: order1.id, rating: 5, comment: "Best meat pies in Accra! Always fresh.", isApproved: true },
  });

  // --- A POS sale (walk-in, completed) ------------------------------------------
  await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-000102",
      channel: "POS",
      status: "COMPLETED",
      fulfillmentType: "PICKUP",
      subtotal: 18,
      totalAmount: 18,
      paymentStatus: "SUCCESSFUL",
      items: {
        create: [{ productId: productIds["Doughnut"], productName: "Doughnut", unitPrice: 4, quantity: 2, subtotal: 8 },
                 { productId: productIds["Meat Pie"], productName: "Meat Pie", unitPrice: 8, quantity: 1.25, subtotal: 10 }],
      },
      payments: { create: [{ amount: 18, method: "CASH", status: "SUCCESSFUL", paidAt: new Date() }] },
    },
  });

  // --- A pending online order (in progress) --------------------------------------
  await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-000103",
      channel: "ONLINE",
      customerId: customer2.id,
      status: "PREPARING",
      fulfillmentType: "PICKUP",
      subtotal: 110,
      totalAmount: 110,
      paymentStatus: "PENDING",
      items: { create: [{ productId: productIds["Jollof & Chicken"], productName: "Jollof & Chicken", unitPrice: 110, quantity: 1, subtotal: 110 }] },
      payments: { create: [{ amount: 110, method: "CASH", status: "PENDING", customerId: customer2.id }] },
    },
  });

  // --- Promotion -----------------------------------------------------------------
  await prisma.promotion.create({
    data: {
      name: "Welcome 10% Off",
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      startDate: new Date(),
      description: "10% off your first online order.",
    },
  });

  // --- Expenses --------------------------------------------------------------------
  await prisma.expense.createMany({
    data: [
      { category: "Ingredients", description: "Weekly flour & sugar restock", amount: 850, expenseDate: new Date() },
      { category: "Electricity", description: "Monthly bill", amount: 320, expenseDate: new Date() },
      { category: "Packaging", description: "Boxes and bags", amount: 150, expenseDate: new Date() },
    ],
  });

  console.log("Seed complete. Demo recipe id:", meatPieRecipe.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
