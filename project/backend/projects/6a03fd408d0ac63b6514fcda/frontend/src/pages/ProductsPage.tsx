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
    <div class="product-catalog">
      <h1 class="catalog-title">Product Catalog</h1>
      <div class="filter-section">
        <label for="price-filter">Price Filter:</label>
        <select id="price-filter" name="price-filter">
          <option value="all">All</option>
          <option value="low-to-high">Low to High</option>
          <option value="high-to-low">High to Low</option>
        </select>
      </div>
      <div class="product-grid">
        <!-- Product grid will be populated here -->
      </div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>