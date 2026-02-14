const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const cors = require('cors');

const app = express();
app.use(cors());

// Простое хранилище в памяти (Кэш)
const cache = new Map();

app.get('/convert', async (req, res) => {
    const { url, size = 50 } = req.query;

    if (!url) return res.status(400).json({ error: 'Ссылка не указана' });

    // Проверяем, нет ли этой картинки в кэше
    const cacheKey = `${url}_${size}`;
    if (cache.has(cacheKey)) {
        console.log('Отдаю из кэша:', url);
        return res.json(cache.get(cacheKey));
    }

    try {
        console.log('Обрабатываю новую картинку:', url);
        const img = await loadImage(url);
        
        // Ограничиваем размер до 100x100 для стабильности Roblox
        const targetSize = Math.min(parseInt(size), 100);
        const canvas = createCanvas(targetSize, targetSize);
        const ctx = canvas.getContext('2d');

        // Кроп в квадрат
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

        const pixels = ctx.getImageData(0, 0, targetSize, targetSize).data;
        const result = [];

        for (let y = 0; y < targetSize; y++) {
            for (let x = 0; x < targetSize; x++) {
                const i = (y * targetSize + x) * 4;
                if (pixels[i + 3] < 128) continue; // Пропуск прозрачности

                result.push([
                    +(x / targetSize).toFixed(4), // X (0-1)
                    +(y / targetSize).toFixed(4), // Y (0-1)
                    pixels[i],     // R
                    pixels[i + 1], // G
                    pixels[i + 2]  // B
                ]);
            }
        }

        // Сохраняем в кэш (храним последние 50 картинок)
        if (cache.size > 50) cache.delete(cache.keys().next().value);
        cache.set(cacheKey, result);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
    }
});

app.listen(process.env.PORT || 3000);
