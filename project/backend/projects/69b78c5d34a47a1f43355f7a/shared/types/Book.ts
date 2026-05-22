```typescript
// shared/types/Book.ts

/**
 * Represents a book with its properties and behaviors.
 */
export interface Book {
  /**
   * Unique identifier for the book.
   */
  id: string;

  /**
   * Title of the book.
   */
  title: string;

  /**
   * Author of the book.
   */
  author: string;

  /**
   * Publication date of the book.
   */
  publicationDate: Date;

  /**
   * Genre of the book (e.g., fiction, non-fiction, romance, etc.).
   */
  genre: string;

  /**
   * Description of the book.
   */
  description: string;

  /**
   * Price of the book.
   */
  price: number;

  /**
   * ISBN (International Standard Book Number) of the book.
   */
  isbn: string;

  /**
   * Number of pages in the book.
   */
  pages: number;

  /**
   * Book cover image URL.
   */
  coverImage: string;

  /**
   * Book format (e.g., hardcover, paperback, e-book, etc.).
   */
  format: string;

  /**
   * Publisher of the book.
   */
  publisher: string;

  /**
   * Publication city of the book.
   */
  publicationCity: string;

  /**
   * Publication country of the book.
   */
  publicationCountry: string;
}

/**
 * Represents a book with its properties and behaviors, including methods.
 */
export class BookClass implements Book {
  public id: string;
  public title: string;
  public author: string;
  public publicationDate: Date;
  public genre: string;
  public description: string;
  public price: number;
  public isbn: string;
  public pages: number;
  public coverImage: string;
  public format: string;
  public publisher: string;
  public publicationCity: string;
  public publicationCountry: string;

  /**
   * Constructor to initialize a new book object.
   * @param id Unique identifier for the book.
   * @param title Title of the book.
   * @param author Author of the book.
   * @param publicationDate Publication date of the book.
   * @param genre Genre of the book (e.g., fiction, non-fiction, romance, etc.).
   * @param description Description of the book.
   * @param price Price of the book.
   * @param isbn ISBN (International Standard Book Number) of the book.
   * @param pages Number of pages in the book.
   * @param coverImage Book cover image URL.
   * @param format Book format (e.g., hardcover, paperback, e-book, etc.).
   * @param publisher Publisher of the book.
   * @param publicationCity Publication city of the book.
   * @param publicationCountry Publication country of the book.
   */
  constructor(
    id: string,
    title: string,
    author: string,
    publicationDate: Date,
    genre: string,
    description: string,
    price: number,
    isbn: string,
    pages: number,
    coverImage: string,
    format: string,
    publisher: string,
    publicationCity: string,
    publicationCountry: string
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.publicationDate = publicationDate;
    this.genre = genre;
    this.description = description;
    this.price = price;
    this.isbn = isbn;
    this.pages = pages;
    this.coverImage = coverImage;
    this.format = format;
    this.publisher = publisher;
    this.publicationCity = publicationCity;
    this.publicationCountry = publicationCountry;
  }

  /**
   * Returns a formatted string representation of the book.
   * @returns A formatted string representation of the book.
   */
  public toString(): string {
    return `Book: ${this.title} by ${this.author}, published on ${this.publicationDate.toISOString()}`;
  }

  /**
   * Returns a JSON representation of the book.
   * @returns A JSON representation of the book.
   */
  public toJSON(): string {
    return JSON.stringify(this);
  }
}
```

### Example Usage

```typescript
// Create a new book object
const book = new BookClass(
  "1234567890",
  "The Great Gatsby",
  "F. Scott Fitzgerald",
  new Date("1925-04-10"),
  "Fiction",
  "Set in the jazz age on Long Island, the novel is narrated by Nick Carraway, a young man from the Midwest who moves to Long Island's West Egg to work in the bond business.",
  15.99,
  "9780743273565",
  180,
  "https://example.com/book-cover.jpg",
  "Paperback",
  "Charles Scribner's Sons",
  "New York",
  "USA"
);

// Log the book's string representation
console.log(book.toString());

// Log the book's JSON representation
console.log(book.toJSON());
```

### MongoDB Schema

To store books in a MongoDB database, you can use the following schema:

```javascript
// books.collection.js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  id: String,
  title: String,
  author: String,
  publicationDate: Date,
  genre: String,
  description: String,
  price: Number,
  isbn: String,
  pages: Number,
  coverImage: String,
  format: String,
  publisher: String,
  publicationCity: String,
  publicationCountry: String,
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
```

### Frontend Example (HTML, CSS, and JS)

To display a book's information on the frontend, you can use the following HTML, CSS, and JS code:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Details</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="book-details">
    <h1 id="title"></h1>
    <p id="author"></p>
    <p id="publication-date"></p>
    <p id="genre"></p>
    <p id="description"></p>
    <p id="price"></p>
    <p id="isbn"></p>
    <p id="pages"></p>
    <img id="cover-image" src="" alt="Book Cover">
  </div>

  <script src="script.js"></script>
</body>
</html>
```

```css
/* styles.css */
.book-details {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

#cover-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}
```

```javascript
// script.js
const bookDetails = document.querySelector(".book-details");
const titleElement = document.getElementById("title");
const authorElement = document.getElementById("author");
const publicationDateElement = document.getElementById("publication-date");
const genreElement = document.getElementById("genre");
const descriptionElement = document.getElementById("description");
const priceElement = document.getElementById("price");
const isbnElement = document.getElementById("isbn");
const pagesElement = document.getElementById("pages");
const coverImageElement = document.getElementById("cover-image");

// Fetch book data from API or database
fetch("/api/books/1234567890")
  .then(response => response.json())
  .then(book => {
    titleElement.textContent = book.title;
    authorElement.textContent = book.author;
    publicationDateElement.textContent = book.publicationDate;
    genreElement.textContent = book.genre;
    descriptionElement.textContent = book.description;
    priceElement.textContent = book.price;
    isbnElement.textContent = book.isbn;
    pagesElement.textContent = book.pages;
    coverImageElement.src = book.coverImage;
  })
  .catch(error => console.error(error));
```

Note that this is a simplified example and you may need to modify it to fit your specific use case. Additionally, you will need to create a backend API or database to store and retrieve book data.