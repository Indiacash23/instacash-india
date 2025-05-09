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
    res.header("Access-Control-Allow-Origin", "https://instacash-india.webflow.io");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

const token = '20c3c8ff3b9adbeeabb3730677330760459d9a62d396ec2377949491a2725c72';
const collectionId = '681b28fcc8c82028a58b5955';

// ----------------------------------------------------------------------

app.post('/order', async (req, res) => {
  const formData = req.body;
  const phoneFull = formData.Phone_full.replace(/\s+/g, '');
  const options = {
    method: 'GET',
    url: `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.request(options);
    const items = response.data.items;
    const foundItem = items.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);
    if (foundItem) {
      const originalSum = parseFloat(foundItem.fieldData.sum || 0);
      const newSum = parseFloat(formData["Sum"] || 0);
      let currentSum = originalSum + newSum;
      if (currentSum > 150000) currentSum = 150000;
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
      const createItemOptions = {
        method: 'POST',
        url: `https://api.webflow.com/v2/collections/${collectionId}/items/live`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        data: {
          "isArchived": false,
          "isDraft": false,
          fieldData: {
            name: phoneFull,
            slug: phoneFull.replace(/\+/g, ''),
            "full-name": formData["First-Name"] + ' ' + formData["Last-Name"],
            "city": formData["City"],
            "language": formData["Language"],
            "sum": formData["Sum"],
            "the-request-has-been-processed": false,
            "messenger": formData["Messenger"],
            "status": "61da663c1046e1c2a962dd15679ce3b1",
          },
        },
      };
      axios.request(createItemOptions)
        .then(res2 => {
             res.status(200).json({ message: "Айтем успішно створено" });
          })
        .catch(err => {
          res.end();
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

  const options = {
    method: 'GET',
    url: `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.request(options);
    const items = response.data.items;
    const foundItem = items.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);
    if (foundItem) {
      return res.status(200).json({
        success: true,
        user: foundItem.fieldData['full-name'],
        sum: foundItem.fieldData.sum,
        status: foundItem.fieldData.status,
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

app.post('/m-save', async (req, res) => {
  const formData = req.body;
  const phoneFull = formData.phone.replace(/\s+/g, '');
  const statusText = formData.statusText;
  const isActive = formData.isActive;
  const options = {
    method: 'GET',
    url: `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.request(options);
    const items = response.data.items;
    const foundItem = items.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);
    if (foundItem) {
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
            name: phoneFull,
            slug: phoneFull.replace(/\+/g, ''),
            status: statusText,
            "the-request-has-been-processed": isActive,
          },
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

app.post('/m-delete', async (req, res) => {
  const formData = req.body;
  const phoneFull = formData.phone.replace(/\s+/g, '');

  const options = {
    method: 'GET',
    url: `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.request(options);
    const items = response.data.items;
    const foundItem = items.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);

    if (foundItem) {
      const updateItemOptions = {
        method: 'DELETE',
        // url: `https://api.webflow.com/v2/collections/${collectionId}/items/${foundItem.id}/live`,
        url: `https://api.webflow.com/v2/collections/${collectionId}/items/${foundItem.id}`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        }
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



// ----------------------------------------------------------------------

app.listen(PORT, () => console.log("Server on " + PORT))
