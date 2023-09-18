import cheerio from 'cheerio';
import fs from 'fs';
import axios from 'axios';

const all_books = [];
const urls = [];

async function storeUrl() {
  let i = 1;
  while (i <= 50) {
    urls.push(`https://books.toscrape.com/catalogue/page-${i}.html`);
    i++;
  }
}

storeUrl();

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

const requests = urls.map((url) => fetchData(url));

Promise.all(requests).then((responses) => {
  responses.forEach((response, page) => {
    const $ = cheerio.load(response);
    const all_books_cards = $('.product_pod');

    all_books_cards.each((index, element) => {
      const structuredData = {
        page: page + 1,
        book_id: index,
        book_title: $(element).find('h3 a').attr('title'),
        book_price: $(element).find('.price_color').text(),
        book_stock: $(element).find('.availability').text().trim(),
        book_star: $(element).find('.star-rating').attr('class').replace('star-rating', '').trim(),
        book_link: 'https://books.toscrape.com/' + $(element).find('h3 a').attr('href'),
        book_image: 'https://books.toscrape.com/' + $(element).find('img').attr('src'),
      };
      all_books.push(structuredData);
    });
  });

  const jsonData = JSON.stringify(all_books);
  fs.writeFile('all_page_books_2.json', jsonData, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Data written to file');
    }
  });
}).catch((error) => {
  console.error('Error processing requests:', error);
});
