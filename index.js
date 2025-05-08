import express from "express";
import axios from "axios";
const PORT = process.env.PORT || 5500;
const app = express();
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://www.gadgetar.com.ua");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });
app.post("/find-products", async (req, res) => {
  const { skus_n } = req.body;
  const headers = {
    accept: "application/json",
    authorization: "Bearer d11f82236d18264c45d33fda2857f04c96e14771134529aac94c9fb491b5dbcb",
  };
  let allProducts = [];
  let offset = 0;
  const limit = 100;
  try {
    while (true) {
      const response = await axios.get(
        `https://api.webflow.com/v2/sites/66fd1c590193b201914b0d7c/products?offset=${offset}`,
        { headers }
      );
      const products = response.data.items;
      allProducts = allProducts.concat(products);
      if (products.length < limit) break;
      offset += limit;
    }
    const matchingProducts = [];
    for (const product of allProducts) {
      const relevantSkus = [];
      for (const sku of product.skus) {
        if (skus_n.includes(sku.fieldData.sku)) {
          const inventoryResponse = await axios.get(
            `https://api.webflow.com/v2/collections/66fd1c590193b201914b0dea/items/${sku.id}/inventory`,
            { headers }
          );
          const quantity = inventoryResponse.data.quantity;
          relevantSkus.push({
            name: sku.fieldData.name,
            slug: sku.fieldData.slug,
            price: sku.fieldData.price.value,
            sku: sku.fieldData.sku,
            id: sku.id,
            product: sku.fieldData.product,
            img: sku.fieldData['main-image'].url,
            quantity: quantity,
          });
        }
      }
      if (relevantSkus.length > 0) {
        matchingProducts.push({
          tag: product.product.fieldData['teg-2'],
          oprice: product.product.fieldData['stara-cina'],
          skus: relevantSkus,
        });
      }
    }
    res.json(matchingProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});
app.post("/comp-products", async (req, res) => {
  const { skus_n } = req.body;
  const headers = {
    accept: "application/json",
    authorization: "Bearer d11f82236d18264c45d33fda2857f04c96e14771134529aac94c9fb491b5dbcb",
  };
  let allProducts = [];
  let offset = 0;
  const limit = 100;
  try {
    while (true) {
      const response = await axios.get(
        `https://api.webflow.com/v2/sites/66fd1c590193b201914b0d7c/products?offset=${offset}`,
        { headers }
      );
      const products = response.data.items;
      allProducts = allProducts.concat(products);
      if (products.length < limit) break;
      offset += limit;
    }
    const matchingProducts = [];
    for (const product of allProducts) {
      const relevantSkus = [];

      for (const sku of product.skus) {
        if (skus_n.includes(sku.fieldData.sku)) {
          const inventoryResponse = await axios.get(
            `https://api.webflow.com/v2/collections/66fd1c590193b201914b0dea/items/${sku.id}/inventory`,
            { headers }
          );
          const quantity = inventoryResponse.data.quantity;
          relevantSkus.push({
            name: sku.fieldData.name,
            slug: sku.fieldData.slug,
            price: sku.fieldData.price.value,
            sku: sku.fieldData.sku,
            id: sku.id,
            product: sku.fieldData.product,
            img: sku.fieldData['main-image'].url,
            quantity: quantity,
          });
        }
      }
      if (relevantSkus.length > 0) {
        matchingProducts.push({
          tag: product.product.fieldData['teg-2'],
          oprice: product.product.fieldData['stara-cina'],
          char: product.product.fieldData['harakteristiki-tovaru'],
          skus: relevantSkus,
        });
      }
    }
    res.json(matchingProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ----------------

app.get("/all-products", async (req, res) => {
  const headers = {
    accept: "application/json",
    authorization: "Bearer d11f82236d18264c45d33fda2857f04c96e14771134529aac94c9fb491b5dbcb",
  };
  let allProducts = [];
  let allCategories = [];
  let offset = 0;
  const limit = 100;
  try {
    while (true) {
      const response = await axios.get(
        `https://api.webflow.com/v2/sites/66fd1c590193b201914b0d7c/products?offset=${offset}`,
        { headers }
      );
      const products = response.data.items;
      const filteredProducts = products.filter((item) => !item.product.isArchived);
      const selectedFields = filteredProducts.map((item) => {
        return item.skus.map((sku) => ({
          name: sku.fieldData.name,
          slug: sku.fieldData.slug,
          sku: sku.fieldData.sku || sku.id,
        }));
      }).flat();
      allProducts = allProducts.concat(selectedFields);
      if (products.length < limit) break;
      offset += limit;
    }
    offset = 0;
    while (true) {
      const categoriesResponse = await axios.get(
        `https://api.webflow.com/v2/collections/66fd1c590193b201914b0da7/items/live?offset=${offset}`,
        { headers }
      );
      const categories = categoriesResponse.data.items;
      allCategories = allCategories.concat(
        categories.map((category) => ({
          name: category.fieldData.name,
          slug: category.fieldData.slug,
        }))
      );
      if (categories.length < limit) break;
      offset += limit;
    }
    res.status(200).json({
      products: allProducts,
      categories: allCategories,
    });
  } catch (error) {
    console.error("Помилка отримання даних із Webflow:", error.message);
    res.status(500).json({ error: "Не вдалося отримати дані." });
  }
});

// ----------------

app.listen(PORT, () => console.log("Server on " + PORT))
