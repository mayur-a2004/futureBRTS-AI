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
    <nav class="navbar">
      <div class="logo">MaiaHomes</div>
      <ul class="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Products</a></li>
        <li><a href="#">Cart</a></li>
      </ul>
    </nav>
    <main class="main-content">
      <section class="hero-section">
        <h1 class="hero-title">Welcome to MaiaHomes</h1>
        <p class="hero-description">Explore our collection of high-quality products</p>
        <button class="hero-cta">Shop Now</button>
      </section>
      <section class="product-section">
        <h2 class="product-title">Featured Products</h2>
        <div class="product-grid">
          <div class="product-card">
            <img src="product1.jpg" alt="Product 1">
            <h3 class="product-name">Product 1</h3>
            <p class="product-price">$19.99</p>
          </div>
          <div class="product-card">
            <img src="product2.jpg" alt="Product 2">
            <h3 class="product-name">Product 2</h3>
            <p class="product-price">$29.99</p>
          </div>
          <div class="product-card">
            <img src="product3.jpg" alt="Product 3">
            <h3 class="product-name">Product 3</h3>
            <p class="product-price">$39.99</p>
          </div>
        </div>
      </section>
      <section class="stat-card-section">
        <h2 class="stat-card-title">Statistics</h2>
        <div class="stat-card-grid">
          <div class="stat-card">
            <h3 class="stat-card-title">Orders</h3>
            <p class="stat-card-value">1000</p>
          </div>
          <div class="stat-card">
            <h3 class="stat-card-title">Revenue</h3>
            <p class="stat-card-value">$10,000</p>
          </div>
          <div class="stat-card">
            <h3 class="stat-card-title">Customers</h3>
            <p class="stat-card-value">500</p>
          </div>
        </div>
      </section>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>