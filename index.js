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

app.post("/order", async (req, res) => {
  const formData = req.body; // Дані з форми

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

    const existingItem = items.find(item => item['fields']['name'] === formData['phone_full']);

    if (existingItem) {
      return res.status(200).json({ exists: true, message: 'Елемент з таким номером вже існує' });
    } else {
      return res.status(200).json({ exists: false, message: 'Елементу з таким номером не знайдено' });
    }
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Сталася помилка при виконанні запиту' });
  }
});



// ----------------

app.listen(PORT, () => console.log("Server on " + PORT))
