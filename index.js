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

app.post('/order', async (req, res) => {
  const formData = req.body;
  const phoneFull = formData.phone_full;

  const options = {
    method: 'GET',
    url: `https://api.webflow.com/v2/collections/${collectionId}/items`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.request(options);
    const items = response.data.items;

    const foundItem = items.find(item => item.fieldData.name === phoneFull);

    if (foundItem) {
      return res.status(200).json({ found: true, data: foundItem });
    } else {
      return res.status(200).json({ found: false, message: 'Номер не знайдено' });
    }
  } catch (error) {
    console.error('Помилка при перевірці номера:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Помилка сервера при перевірці номера' });
  }
});



// ----------------

app.listen(PORT, () => console.log("Server on " + PORT))
