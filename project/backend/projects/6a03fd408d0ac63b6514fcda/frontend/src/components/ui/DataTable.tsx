<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maiahomes Ecommerce Website</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&Poppins:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <nav class="navbar">
            <div class="logo">Maiahomes</div>
            <ul class="nav-links">
                <li><a href="#">Home</a></li>
                <li><a href="#">Products</a></li>
                <li><a href="#">Cart</a></li>
            </ul>
        </nav>
        <div class="product-listing">
            <h1>Product Listing</h1>
            <table id="product-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody id="product-table-body">
                </tbody>
            </table>
            <div class="pagination">
                <button id="prev-page">Prev</button>
                <button id="next-page">Next</button>
            </div>
        </div>
        <div class="product-details">
            <h1>Product Details</h1>
            <div id="product-details-container">
            </div>
        </div>
        <div class="shopping-cart">
            <h1>Shopping Cart</h1>
            <table id="cart-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody id="cart-table-body">
                </tbody>
            </table>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>