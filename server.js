const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '10mb' })); // รองรับ HTML ขนาดใหญ่
app.use('/invoice', express.static(path.join(__dirname, 'html')));

// ✨ เพิ่ม upload route
app.post('/upload', (req, res) => {
  const { filename, html } = req.body;
  if (!filename || !html) return res.status(400).send('Invalid input');

  const filePath = path.join(__dirname, 'html', filename);
  fs.writeFile(filePath, html, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send('Failed to save file');
    }
    res.send({ message: 'File saved', url: `/invoice/${filename}` });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
