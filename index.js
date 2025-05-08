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

app.post('/hello', (req, res) => {
  res.send('Hello world');
});

app.post("/order", (req, res) => {
  const formData = req.body;  // Дані, отримані з форми

  try {
    // Отримуємо всі елементи колекції
    const response = await fetch(`https://api.webflow.com/collections/${collectionId}/items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Не вдалося отримати елементи колекції' });
    }
    const data = await response.json();
    const items = data.items;
    const existingItem = items.find(item => item['fields']['name'] === formData['phone']);

    if (existingItem) {
      return res.status(200).json({ message: 'Елемент з таким номером телефону вже існує' });
    }
    const createResponse = await fetch(`https://api.webflow.com/collections/${collectionId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'name': formData['phone'],
          'full-name': formData['first-name'] + ' ' + formData['last-name'],
          'city': formData['city'],
          'language': formData['language'],
          'messenger': formData['messenger'],
          'sum': formData['sum'],
        },
      }),
    });

    if (!createResponse.ok) {
      return res.status(500).json({ error: 'Не вдалося створити новий елемент' });
    }
    const createData = await createResponse.json();
    res.status(200).json({ message: 'Новий елемент створено', data: createData });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Сталася помилка при виконанні запиту' });
  }
});


// ----------------

app.listen(PORT, () => console.log("Server on " + PORT))
