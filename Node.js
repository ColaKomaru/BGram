const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/convert', async (req, res) => {
    const imageUrl = req.query.url;
    const targetSize = parseInt(req.query.size) || 50;

    if (!imageUrl) return res.status(400).send({ error: 'Нужна ссылка на фото!' });

    try {
        // Загружаем изображение прямо на сервере
        const img = await loadImage(imageUrl);
        const canvas = createCanvas(targetSize, targetSize);
        const ctx = canvas.getContext('2d');

        // Квадратная обрезка (Кроп)
        let sX = 0, sY = 0, sSize = Math.min(img.width, img.height);
        if (img.width > img.height) sX = (img.width - img.height) / 2;
        else sY = (img.height - img.width) / 2;

        ctx.drawImage(img, sX, sY, sSize, sSize, 0, 0, targetSize, targetSize);

        const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
        const pixels = imageData.data;
        const result = [];

        for (let y = 0; y < targetSize; y++) {
            for (let x = 0; x < targetSize; x++) {
                const i = (y * targetSize + x) * 4;
                if (pixels[i + 3] < 128) continue; // Пропуск прозрачности

                result.push([
                    parseFloat((x / targetSize).toFixed(4)),
                    parseFloat((y / targetSize).toFixed(4)),
                    pixels[i], pixels[i + 1], pixels[i + 2]
                ]);
            }
        }

        // Возвращаем чистый JSON
        res.json(result);
    } catch (err) {
        res.status(500).send({ error: 'Ошибка обработки: ' + err.message });
    }
});

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
