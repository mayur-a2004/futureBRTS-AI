<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MaiaHomes Ecommerce Website</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="header">
            <nav class="navbar">
                <ul class="nav-links">
                    <li class="nav-link"><a href="#">Home</a></li>
                    <li class="nav-link"><a href="#">Products</a></li>
                    <li class="nav-link"><a href="#">Cart</a></li>
                </ul>
            </nav>
        </header>
        <main class="main">
            <section class="product-listing">
                <h2 class="section-title">Product Listing</h2>
                <div class="product-grid">
                    <!-- products will be rendered here -->
                </div>
            </section>
            <section class="product-details">
                <h2 class="section-title">Product Details</h2>
                <div class="product-details-container">
                    <!-- product details will be rendered here -->
                </div>
            </section>
            <section class="shopping-cart">
                <h2 class="section-title">Shopping Cart</h2>
                <div class="cart-container">
                    <!-- cart items will be rendered here -->
                </div>
            </section>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>