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
          <li><a href="#home">Home</a></li>
          <li><a href="#products">Products</a></li>
          <li><a href="#cart">Cart</a></li>
        </ul>
      </nav>
    </header>
    <main class="main">
      <section class="hero">
        <h1 class="hero-title">Welcome to MaiaHomes</h1>
        <p class="hero-description">Explore our collection of premium products</p>
        <button class="hero-cta">Shop Now</button>
      </section>
      <section class="products" id="products">
        <h2 class="section-title">Products</h2>
        <div class="product-grid">
          <!-- Product cards will be generated here -->
        </div>
      </section>
      <section class="cart" id="cart">
        <h2 class="section-title">Cart</h2>
        <div class="cart-items">
          <!-- Cart items will be generated here -->
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