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
                <ul class="nav-links">
                    <li class="nav-link"><a href="#home">Home</a></li>
                    <li class="nav-link"><a href="#products">Products</a></li>
                    <li class="nav-link"><a href="#cart">Cart</a></li>
                    <li class="nav-link"><a href="#order-history">Order History</a></li>
                </ul>
            </nav>
        </header>
        <main class="main">
            <section class="home" id="home">
                <h1 class="heading">Welcome to MaiaHomes</h1>
                <p class="description">Explore our collection of beautiful homes</p>
                <button class="btn">Explore Now</button>
            </section>
            <section class="products" id="products">
                <h1 class="heading">Our Products</h1>
                <div class="product-grid">
                    <!-- product cards will be generated here -->
                </div>
            </section>
            <section class="cart" id="cart">
                <h1 class="heading">Your Cart</h1>
                <div class="cart-items">
                    <!-- cart items will be generated here -->
                </div>
            </section>
            <section class="order-history" id="order-history">
                <h1 class="heading">Order History</h1>
                <div class="order-grid">
                    <!-- order history will be generated here -->
                </div>
            </section>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>