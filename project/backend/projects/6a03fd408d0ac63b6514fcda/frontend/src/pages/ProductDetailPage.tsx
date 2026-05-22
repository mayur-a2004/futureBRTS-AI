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
    <header class="navbar">
        <nav>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Products</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="product-detail">
            <div class="product-image-gallery">
                <img src="product1.jpg" alt="Product Image 1">
                <img src="product2.jpg" alt="Product Image 2">
                <img src="product3.jpg" alt="Product Image 3">
            </div>
            <div class="product-info">
                <h2>Product Name</h2>
                <p>Product Description</p>
                <div class="size-color-options">
                    <label for="size">Size:</label>
                    <select id="size" name="size">
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                    <label for="color">Color:</label>
                    <select id="color" name="color">
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                    </select>
                </div>
                <div class="reviews">
                    <h3>Reviews</h3>
                    <ul>
                        <li>
                            <p>Review 1</p>
                            <p>Rating: 5/5</p>
                        </li>
                        <li>
                            <p>Review 2</p>
                            <p>Rating: 4/5</p>
                        </li>
                        <li>
                            <p>Review 3</p>
                            <p>Rating: 3/5</p>
                        </li>
                    </ul>
                </div>
                <div class="purchase-actions">
                    <button class="add-to-cart">Add to Cart</button>
                    <button class="buy-now">Buy Now</button>
                </div>
            </div>
        </section>
    </main>
    <script src="script.js"></script>
</body>
</html>