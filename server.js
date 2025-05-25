// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// โฟลเดอร์ html จะเก็บไฟล์ใบเสนอราคาหรือใบแจ้งหนี้
app.use('/invoice', express.static(path.join(__dirname, 'html')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
