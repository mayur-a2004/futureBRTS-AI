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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="header">
            <nav class="navbar">
                <div class="logo">MaiaHomes</div>
                <ul class="nav-links">
                    <li><a href="#home" class="nav-link">Home</a></li>
                    <li><a href="#products" class="nav-link">Products</a></li>
                    <li><a href="#cart" class="nav-link">Cart</a></li>
                </ul>
            </nav>
        </header>
        <main class="main">
            <section class="hero" id="home">
                <h1 class="hero-title">Welcome to MaiaHomes</h1>
                <p class="hero-description">Discover the best products for your home</p>
                <button class="hero-cta">Explore Now</button>
            </section>
            <section class="products" id="products">
                <h2 class="products-title">Our Products</h2>
                <div class="products-grid">
                    <div class="product-card">
                        <img src="product1.jpg" alt="Product 1" class="product-image">
                        <h3 class="product-title">Product 1</h3>
                        <p class="product-description">Description of product 1</p>
                        <button class="product-cta">Add to Cart</button>
                    </div>
                    <div class="product-card">
                        <img src="product2.jpg" alt="Product 2" class="product-image">
                        <h3 class="product-title">Product 2</h3>
                        <p class="product-description">Description of product 2</p>
                        <button class="product-cta">Add to Cart</button>
                    </div>
                    <div class="product-card">
                        <img src="product3.jpg" alt="Product 3" class="product-image">
                        <h3 class="product-title">Product 3</h3>
                        <p class="product-description">Description of product 3</p>
                        <button class="product-cta">Add to Cart</button>
                    </div>
                </div>
            </section>
            <section class="cart" id="cart">
                <h2 class="cart-title">Your Cart</h2>
                <div class="cart-grid">
                    <div class="cart-item">
                        <img src="product1.jpg" alt="Product 1" class="cart-image">
                        <h3 class="cart-title">Product 1</h3>
                        <p class="cart-description">Description of product 1</p>
                        <button class="cart-cta">Remove</button>
                    </div>
                    <div class="cart-item">
                        <img src="product2.jpg" alt="Product 2" class="cart-image">
                        <h3 class="cart-title">Product 2</h3>
                        <p class="cart-description">Description of product 2</p>
                        <button class="cart-cta">Remove</button>
                    </div>
                </div>
            </section>
        </main>
        <footer class="footer">
            <p class="footer-text">&copy; 2023 MaiaHomes</p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>