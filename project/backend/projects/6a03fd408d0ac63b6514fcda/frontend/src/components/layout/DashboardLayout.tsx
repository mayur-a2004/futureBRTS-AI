<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maia Homes Ecommerce Website</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="dashboard-layout-wrapper">
        <div class="sidebar">
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Products</a></li>
                <li><a href="#">Cart</a></li>
            </ul>
        </div>
        <div class="header">
            <h1>Maia Homes Ecommerce Website</h1>
            <button class="nav-button">Menu</button>
        </div>
        <div class="main-content">
            <!-- Product Listing -->
            <div class="product-listing">
                <h2>Product Listing</h2>
                <div class="product-grid">
                    <!-- Product Grid Items will be generated dynamically using JavaScript -->
                </div>
            </div>
            <!-- Product Details -->
            <div class="product-details">
                <h2>Product Details</h2>
                <div class="product-details-container">
                    <!-- Product Details will be generated dynamically using JavaScript -->
                </div>
            </div>
            <!-- Shopping Cart -->
            <div class="shopping-cart">
                <h2>Shopping Cart</h2>
                <div class="cart-items">
                    <!-- Cart Items will be generated dynamically using JavaScript -->
                </div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>