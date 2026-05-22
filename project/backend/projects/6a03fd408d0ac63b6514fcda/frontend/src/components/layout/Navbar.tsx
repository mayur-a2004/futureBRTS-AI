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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <nav class="navbar">
            <div class="logo">Maia Homes</div>
            <ul class="nav-links">
                <li><a href="#home" class="nav-link">Home</a></li>
                <li><a href="#products" class="nav-link">Products</a></li>
                <li><a href="#cart" class="nav-link">Cart</a></li>
            </ul>
        </nav>
        <section id="home" class="home-section">
            <h1 class="section-title">Welcome to Maia Homes</h1>
            <p class="section-description">Explore our collection of premium home decor and furniture</p>
            <button class="explore-button">Explore Now</button>
        </section>
        <section id="products" class="products-section">
            <h1 class="section-title">Our Products</h1>
            <div class="products-grid">
                <!-- products will be rendered here -->
            </div>
        </section>
        <section id="cart" class="cart-section">
            <h1 class="section-title">Your Cart</h1>
            <div class="cart-grid">
                <!-- cart items will be rendered here -->
            </div>
        </section>
    </div>
    <script src="script.js"></script>
</body>
</html>