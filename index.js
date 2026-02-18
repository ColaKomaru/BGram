const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let fingerStates = { E: false, R: false, T: false, Y: false };

// Принимаем данные от браузера
app.post('/update', (req, res) => {
    fingerStates = req.body;
    res.json({ status: "success" });
});

// Отдаем данные в Roblox
app.get('/get_keys', (req, res) => {
    res.json(fingerStates);
});

app.listen(3000, () => {
    console.log("🚀 Сервер запущен! Открой вкладку Webview");
});
