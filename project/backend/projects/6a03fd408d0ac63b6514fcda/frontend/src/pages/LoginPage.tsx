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
        <header class="glassmorphic-navbar">
            <nav>
                <ul>
                    <li><a href="#" class="nav-link">Home</a></li>
                    <li><a href="#" class="nav-link">Products</a></li>
                    <li><a href="#" class="nav-link">About</a></li>
                    <li><a href="#" class="nav-link">Contact</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <section class="hero-section">
                <h1 class="hero-title">Welcome to MaiaHomes</h1>
                <p class="hero-description">Explore our collection of premium products</p>
                <button class="hero-cta">Shop Now</button>
            </section>
            <section class="product-listing-section">
                <h2 class="section-title">Product Listing</h2>
                <div class="product-grid">
                    <!-- product cards will be generated here -->
                </div>
            </section>
            <section class="product-details-section">
                <h2 class="section-title">Product Details</h2>
                <div class="product-details-container">
                    <!-- product details will be displayed here -->
                </div>
            </section>
            <section class="shopping-cart-section">
                <h2 class="section-title">Shopping Cart</h2>
                <div class="shopping-cart-container">
                    <!-- shopping cart will be displayed here -->
                </div>
            </section>
            <section class="login-section">
                <h2 class="section-title">Login</h2>
                <div class="login-container">
                    <form class="login-form">
                        <input type="email" placeholder="Email" class="login-input">
                        <input type="password" placeholder="Password" class="login-input">
                        <button class="login-btn">Login</button>
                    </form>
                </div>
            </section>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>