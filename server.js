
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
const dataFile = path.join(__dirname, 'data/hero.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([]));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.get('/api/hero', (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFile));
  res.json(data);
});

app.post('/api/admin/hero', upload.single('image'), (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFile));
  const newImage = {
    id: Date.now(),
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  };
  data.push(newImage);
  fs.writeFileSync(dataFile, JSON.stringify(data));
  res.json(newImage);
});

app.delete('/api/admin/hero/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let data = JSON.parse(fs.readFileSync(dataFile));
  const item = data.find(i => i.id === id);

  if (!item) return res.status(404).json({ error: "Not found" });

  const filePath = path.join(uploadsDir, item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  data = data.filter(i => i.id !== id);
  fs.writeFileSync(dataFile, JSON.stringify(data));
  res.json({ success: true });
});

app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => res.send("Backend running"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
