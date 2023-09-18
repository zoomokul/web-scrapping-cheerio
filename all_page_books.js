import cheerio from 'cheerio';
import fs from 'fs';
import axios from "axios"

const all_books=[]
let urls = [
  "https://books.toscrape.com/catalogue/page-1.html",
  "https://books.toscrape.com/catalogue/page-2.html",
  "https://books.toscrape.com/catalogue/page-3.html",
];
/*
| Perform the HTTP get request via Axios
| It returns a Promise immediately,
| not the response
*/
const requests = urls.map((url) => axios.get(url));
/*
| For waiting the Promise is fulfilled
| with the Response, use the then() method.
| If the HTTP request received errors
| use catch() method
*/


axios.all(requests).then((responses) => {
  responses.forEach((response,page) => {
 
    // handle success
    //console.log(response.data);
    const $ = cheerio.load(response.data)
    
    const all_books_cards=$(".product_pod")
    
    all_books_cards.each((index,element)=>{
    	const structuredData={
        page:page+1,
        book_id:index,
        book_title:$(element).find("h3").find("a").attr("title"),
    		book_price:$(element).find(".price_color").text(),
    		book_stock:$(element).find(".availability").text().trim(),
        book_star:$(element).find(".image_container").next().attr("class").slice(12),
        book_link:"https://books.toscrape.com/"+$(element).find("h3").find("a").attr("href"),
        book_image:"https://books.toscrape.com/"+$(element).find("img").attr("src"),
        
    	}
    	all_books.push(structuredData)
     
    	
    })
  })
const jsonData = JSON.stringify(all_books); //Convert the array to JSON format
fs.writeFile('all_page_books.json', jsonData, () => {     //Using the fs.writeFile , it's used to write data in a file
  console.log('Data written to file'); //Display "Data written to file" in the call back function.
});

})
