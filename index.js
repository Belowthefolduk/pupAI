const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    const data = await page.evaluate(() => {
      const getText = (selector) => Array.from(document.querySelectorAll(selector)).map(el => el.innerText.trim()).filter(Boolean);
      const getAttr = (selector, attr) => Array.from(document.querySelectorAll(selector)).map(el => el.getAttribute(attr)).filter(Boolean);

      return {
        pageTitle: document.title,
        metaDescription: document.querySelector("meta[name='description']")?.getAttribute('content') || '',
        headings: {
          h1: getText('h1'),
          h2: getText('h2'),
          h3: getText('h3'),
        },
        products: Array.from(document.querySelectorAll('[class*="product"]')).map(product => ({
          title: product.querySelector('h2, h3')?.innerText || '',
          price: product.innerText.match(/[$£€]\s?\d+[.,]?\d*/) ? product.innerText.match(/[$£€]\s?\d+[.,]?\d*/)[0] : '',
          description: product.querySelector('p')?.innerText || '',
        })),
        images: getAttr('img', 'alt')
      };
    });

    await browser.close();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
