```javascript
// script.js

// Importing necessary libraries and modules
import $ from 'jquery';
import './styles.css';

// Global variables
let currentPage = 1;
let totalPages = 1;
let itemsPerPage = 10;
let searchData = {};

// Function to handle page load
$(document).ready(function() {
    // Initialize the page
    initPage();

    // Bind event listeners
    bindEventListeners();
});

// Function to initialize the page
function initPage() {
    // Get the total number of pages from the server
    $.ajax({
        type: 'GET',
        url: '/api/get-total-pages',
        success: function(data) {
            totalPages = data.totalPages;
            updatePagination();
        }
    });

    // Get the items for the current page from the server
    $.ajax({
        type: 'GET',
        url: '/api/get-items',
        data: {
            page: currentPage,
            itemsPerPage: itemsPerPage
        },
        success: function(data) {
            updateItems(data.items);
        }
    });
}

// Function to bind event listeners
function bindEventListeners() {
    // Bind event listener for pagination
    $('.pagination').on('click', 'li', function() {
        let pageNumber = $(this).data('page');
        if (pageNumber !== currentPage) {
            currentPage = pageNumber;
            updateItemsForPage();
        }
    });

    // Bind event listener for search
    $('#search-form').submit(function(event) {
        event.preventDefault();
        searchData = {
            query: $('#search-input').val()
        };
        updateItemsForSearch();
    });

    // Bind event listener for item click
    $(document).on('click', '.item', function() {
        let itemId = $(this).data('id');
        // Handle item click
        console.log('Item clicked:', itemId);
    });
}

// Function to update pagination
function updatePagination() {
    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<li data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</li>`;
    }
    $('.pagination').html(paginationHtml);
}

// Function to update items for the current page
function updateItemsForPage() {
    $.ajax({
        type: 'GET',
        url: '/api/get-items',
        data: {
            page: currentPage,
            itemsPerPage: itemsPerPage
        },
        success: function(data) {
            updateItems(data.items);
        }
    });
}

// Function to update items for search
function updateItemsForSearch() {
    $.ajax({
        type: 'GET',
        url: '/api/search-items',
        data: searchData,
        success: function(data) {
            updateItems(data.items);
        }
    });
}

// Function to update items
function updateItems(items) {
    let itemsHtml = '';
    items.forEach(function(item) {
        itemsHtml += `
            <div class="item" data-id="${item.id}">
                <h2>${item.name}</h2>
                <p>${item.description}</p>
            </div>
        `;
    });
    $('#items-container').html(itemsHtml);
}

// Function to handle server errors
function handleServerError(error) {
    console.error('Server error:', error);
    // Handle server error
}

// Function to handle client errors
function handleClientError(error) {
    console.error('Client error:', error);
    // Handle client error
}
```

```php
// api.php

// Importing necessary libraries and modules
require_once 'database.php';

// Function to get the total number of pages
function getTotalPages() {
    $itemsPerPage = 10;
    $totalItems = getTotalItems();
    $totalPages = ceil($totalItems / $itemsPerPage);
    return $totalPages;
}

// Function to get the total number of items
function getTotalItems() {
    $query = "SELECT COUNT(*) as total FROM items";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_assoc($result);
    return $row['total'];
}

// Function to get items for a page
function getItemsForPage($page, $itemsPerPage) {
    $offset = ($page - 1) * $itemsPerPage;
    $query = "SELECT * FROM items LIMIT $offset, $itemsPerPage";
    $result = mysqli_query($conn, $query);
    $items = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    return $items;
}

// Function to search items
function searchItems($query) {
    $query = "SELECT * FROM items WHERE name LIKE '%$query%'";
    $result = mysqli_query($conn, $query);
    $items = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    return $items;
}

// API endpoints
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['get-total-pages'])) {
        $totalPages = getTotalPages();
        echo json_encode(array('totalPages' => $totalPages));
    } elseif (isset($_GET['get-items'])) {
        $page = $_GET['page'];
        $itemsPerPage = $_GET['itemsPerPage'];
        $items = getItemsForPage($page, $itemsPerPage);
        echo json_encode(array('items' => $items));
    } elseif (isset($_GET['search-items'])) {
        $query = $_GET['query'];
        $items = searchItems($query);
        echo json_encode(array('items' => $items));
    }
}

// Close the database connection
mysqli_close($conn);
```

```sql
-- database.sql

CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description TEXT
);

INSERT INTO items (name, description) VALUES
('Item 1', 'This is item 1'),
('Item 2', 'This is item 2'),
('Item 3', 'This is item 3'),
('Item 4', 'This is item 4'),
('Item 5', 'This is item 5');
```

```html
<!-- index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Items</h1>
    <form id="search-form">
        <input type="text" id="search-input" placeholder="Search items">
        <button type="submit">Search</button>
    </form>
    <div id="items-container"></div>
    <ul class="pagination"></ul>

    <script src="script.js"></script>
</body>
</html>
```

```css
/* styles.css */

body {
    font-family: Arial, sans-serif;
}

#items-container {
    margin-bottom: 20px;
}

.item {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.pagination {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
}

.pagination li {
    margin-right: 10px;
}

.pagination li.active {
    background-color: #337ab7;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
}

.pagination li:hover {
    background-color: #337ab7;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
}
```