import express from "express";
import axios from "axios";
const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://instacash-india.webflow.io");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const token = '5d5ea34aa57a25caf974a351dbfd275538dcbbd2277a94b839d8e67e164f34cd';
const collectionId = '681e1e483b0faaf2ec1eeea7';


app.post('/order', async (req, res) => {
  const formData = req.body;
  const phoneFull = formData.Phone_full.replace(/\s+/g, '');
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  };

  const limit = 100;
  let offset = 0;
  let allItems = [];

  function generate8DigitNumber() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  async function generateUnique8DigitNumber(existingItems) {
    let uniqueNumber;
    let isUnique = false;
    while (!isUnique) {
      uniqueNumber = generate8DigitNumber();
      isUnique = !existingItems.some(
        item => item.fieldData["unique-id"] === uniqueNumber
      );
    }
    return uniqueNumber;
  }

  try {
    while (true) {
      const response = await axios.get(
        `https://api.webflow.com/v2/collections/${collectionId}/items?limit=${limit}&offset=${offset}`,
        { headers }
      );
      const items = response.data.items || [];
      allItems = allItems.concat(items);
      if (items.length < limit) break;
      offset += limit;
    }
    const foundItem = allItems.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);

    if (foundItem) {
      const originalSum = parseFloat(foundItem.fieldData.sum || 0);
      const newSum = parseFloat(formData["Sum"] || 0);
      let currentSum = originalSum + newSum;
      if (currentSum > 100000) currentSum = 100000;

      const updateItemOptions = {
        method: 'PATCH',
        url: `https://api.webflow.com/v2/collections/${collectionId}/items/${foundItem.id}/live`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        data: {
          isArchived: false,
          isDraft: false,
          fieldData: {
            name: foundItem.fieldData.name,
            slug: foundItem.fieldData.slug,
            sum: currentSum,
          },
        },
      };

      const updateResponse = await axios.request(updateItemOptions);

      return res.status(200).json({
        updatedSum: currentSum,
      });
    } else {
      const uniqueId = await generateUnique8DigitNumber(allItems);
      const createItemOptions = {
        method: 'POST',
        url: `https://api.webflow.com/v2/collections/${collectionId}/items/live`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        data: {
          isArchived: false,
          isDraft: false,
          fieldData: {
            name: phoneFull,
            slug: phoneFull.replace(/\+/g, ''),
            "full-name": formData["First-Name"] + ' ' + formData["Last-Name"],
            city: formData["City"],
            language: formData["Language"],
            sum: formData["Sum"],
            "the-request-has-been-processed": false,
            messenger: formData["Messenger"],
            "phone-number-or-nickname-in-messenger": formData["Nick"],
            status: "61da663c1046e1c2a962dd15679ce3b1",
            "customer-id": uniqueId,
            period: formData["Period"],
          },
        },
      };

      axios.request(createItemOptions)
        .then(() => {
          res.status(200).json({ customerId: uniqueId });
        })
        .catch(err => {
          console.error('Помилка створення айтема:', err.response?.data || err.message);
          res.status(500).json({ error: "Помилка створення айтема" });
        });
    }
  } catch (error) {
    console.error('Помилка при зверненні до Webflow API:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Помилка сервера при пошуку номера' });
  }
});


app.post('/log-in', async (req, res) => {
  const formData = req.body;
  const phoneFull = formData.Phone_full.replace(/\s+/g, '');

  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  };

  const limit = 100;
  let offset = 0;
  let allItems = [];

  try {
    while (true) {
      const response = await axios.get(
        `https://api.webflow.com/v2/collections/${collectionId}/items?limit=${limit}&offset=${offset}`,
        { headers }
      );
      const items = response.data.items || [];
      allItems = allItems.concat(items);
      if (items.length < limit) break;
      offset += limit;
    }
    const foundItem = allItems.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);

    if (foundItem) {
      return res.status(200).json({
        success: true,
        user: foundItem.fieldData['full-name'],
        sum: foundItem.fieldData.sum,
        status: foundItem.fieldData.status,
        date: foundItem.createdOn,
        customerId: foundItem.fieldData['customer-id'],
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }
  } catch (error) {
    console.error('Помилка при зверненні до Webflow API:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Помилка сервера при пошуку номера' });
  }
});

app.post('/save', (req, res) => {
  const formData = req.body;
  const phoneFull = formData.phone.replace(/\s+/g, '');
  const statusText = formData.statusText;
  const isActive = formData.isActive;
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  };
  const limit = 100;
  let offset = 0;
  let allItems = [];
  try {
    while (true) {
      const response = await axios.get(
        `https://api.webflow.com/v2/collections/${collectionId}/items?limit=${limit}&offset=${offset}`,
        { headers }
      );
      const items = response.data.items || [];
      allItems = allItems.concat(items);
      if (items.length < limit) break;
      offset += limit;
    }
    const foundItem = allItems.find(
      item => item.fieldData?.name?.replace(/\s+/g, '') === phoneFull
    );

    if (foundItem) {
      const updateOptions = {
        method: 'PATCH',
        url: `https://api.webflow.com/v2/collections/${collectionId}/items/${foundItem.id}/live`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        data: {
          isArchived: false,
          isDraft: false,
          fieldData: {
            name: phoneFull,
            slug: phoneFull.replace(/\+/g, ''),
            status: statusText,
            'the-request-has-been-processed': isActive,
          },
        },
      };
      await axios.request(updateOptions);
      return res.status(200).json({ message: 'Дані успішно оновлено' });
    } else {
      return res.status(404).json({ message: 'Елемент не знайдений' });
    }
  } catch (error) {
    console.error('Помилка при взаємодії з Webflow API:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Виникла помилка при обробці запиту' });
  }
});

app.post('/m-delete', async (req, res) => {
  const formData = req.body;
  const phoneFull = formData.phone.replace(/\s+/g, '');

  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  };

  const limit = 100;
  let offset = 0;
  let allItems = [];

  try {
    while (true) {
      const response = await axios.get(
        `https://api.webflow.com/v2/collections/${collectionId}/items?limit=${limit}&offset=${offset}`,
        { headers }
      );
      const items = response.data.items || [];
      allItems = allItems.concat(items);
      if (items.length < limit) break;
      offset += limit;
    }

    const foundItem = allItems.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);

    if (foundItem) {
      const updateItemOptions = {
        method: 'DELETE',
        url: `https://api.webflow.com/v2/collections/${collectionId}/items/${foundItem.id}/live`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      };

      await axios.request(updateItemOptions);
      return res.status(200).json({
        message: 'Дані успішно оновлено',
      });
    } else {
      return res.status(404).json({
        message: 'Елемент не знайдений',
      });
    }
  } catch (error) {
    console.error('Помилка при взаємодії з Webflow API:', error.message);
    return res.status(500).json({ error: 'Виникла помилка при обробці запиту' });
  }
});

app.listen(PORT, () => console.log("Server on " + PORT))
