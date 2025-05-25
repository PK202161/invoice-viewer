const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' })); // รองรับ HTML ขนาดใหญ่
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // รองรับ form data
// Static files พร้อม URL decoding สำหรับภาษาไทย
app.use('/invoice', (req, res, next) => {
  // Decode URL เพื่อจัดการภาษาไทย
  req.url = decodeURIComponent(req.url);
  next();
}, express.static(path.join(__dirname, 'html')));

// สร้างโฟลเดอร์ html หากไม่มี
const htmlDir = path.join(__dirname, 'html');
if (!fs.existsSync(htmlDir)) {
  fs.mkdirSync(htmlDir, { recursive: true });
}

// ✨ Upload endpoint สำหรับรับ HTML จาก n8n
app.post('/upload', (req, res) => {
  try {
    const { filename, html } = req.body;
    
    if (!filename || !html) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'filename และ html จำเป็นต้องมี' 
      });
    }

    // ใช้ชื่อไฟล์ตามที่ส่งมา รองรับภาษาไทย
    const cleanFilename = filename
      .replace(/[<>:"/\\|?*]/g, '')  // ลบเฉพาะอักขระที่ระบบไฟล์ไม่อนุญาต
      .trim();
    
    const filePath = path.join(htmlDir, cleanFilename);
    
    // บันทึกไฟล์
    fs.writeFile(filePath, html, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ 
          error: 'Failed to save file',
          details: err.message 
        });
      }
      
      console.log(`File saved: ${cleanFilename}`);
      
      // สร้าง URL ที่ encode ภาษาไทยเพื่อใช้ใน browser
      const encodedFilename = encodeURIComponent(cleanFilename);
      const fileUrl = `${req.protocol}://${req.get('host')}/invoice/${encodedFilename}`;
      
      res.json({ 
        message: 'File saved successfully',
        filename: cleanFilename,
        url: fileUrl
      });
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
  res.send('Server is running. Use /upload to upload HTML files.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/upload`);
  console.log(`Static files: http://localhost:${PORT}/invoice/`);
});
