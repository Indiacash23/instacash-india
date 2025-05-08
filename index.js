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
  const phoneFull = formData.Phone_full.replace(/\s+/g, ''); // Видаляємо всі пробіли

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

    // Знайти елемент за номером телефону, видаляючи пробіли з номера в колекції
    const foundItem = items.find(item => item.fieldData.name.replace(/\s+/g, '') === phoneFull);

    if (foundItem) {
      return res.status(200).json({
        found: true,
        message: 'Елемент знайдено',
        data: foundItem,
        allItems: items, // Додаємо всі елементи до відповіді
      });
    } else {
      // Якщо елемент не знайдено, створимо новий
      const createOptions = {
        method: 'POST',
        url: `https://api.webflow.com/v2/collections/${collectionId}/items`,
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
        },
        data: {
          fields: {
            "name": phoneFull, // Номер телефону
            "full-name": formData["First-Name"] + ' ' + formData["Last-Name"], // Повне ім'я
            "city": formData["City"], // Місто
            "language": formData["Language"], // Мова
            "sum": formData["Sum"], // Сума
            "the-request-has-been-processed": false, // Примітка про обробку
            "messenger": formData["Messenger"],
            "status": "61da663c1046e1c2a962dd15679ce3b1",
            
            // Інші поля з formData, якщо необхідно
          }
        }
      };

      try {
        const createResponse = await axios.request(createOptions);
        return res.status(200).json({
          found: false,
          message: 'Елемент не знайдено, створено новий',
          data: createResponse.data, // Повертаємо дані нового елемента
          formData: formData,
          allItems: items, // Додаємо всі елементи до відповіді
        });
      } catch (createError) {
        console.error('Помилка при створенні нового елемента:', createError.response?.data || createError.message);
        return res.status(500).json({ error: 'Помилка при створенні нового елемента', formData: formData });
      }
    }
  } catch (error) {
    console.error('Помилка при зверненні до Webflow API:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Помилка сервера при пошуку номера' });
  }
});






// ----------------------------------------------------------------------

app.listen(PORT, () => console.log("Server on " + PORT))
