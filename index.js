const axios = require('axios');

const token = '20c3c8ff3b9adbeeabb3730677330760459d9a62d396ec2377949491a2725c72';
const collectionId = '681b28fcc8c82028a58b5955';

app.post('/order', async (req, res) => {
  const phoneFull = req.body.phone_full;

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

    // Знайти елемент за номером телефону
    const foundItem = items.find(item => item.fieldData.name === phoneFull);

    if (foundItem) {
      return res.status(200).json({
        found: true,
        message: 'Елемент знайдено',
        data: foundItem,
      });
    } else {
      return res.status(200).json({
        found: false,
        message: 'Елемент з таким номером не знайдено',
      });
    }
  } catch (error) {
    console.error('Помилка при зверненні до Webflow API:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Помилка сервера при пошуку номера' });
  }
});
