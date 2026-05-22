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
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#cart">Cart</a></li>
                <li><a href="#settings">Settings</a></li>
            </ul>
        </nav>
        <div class="main-content">
            <section id="home" class="section">
                <h1 class="section-title">Welcome to MaiaHomes</h1>
                <p class="section-description">Explore our collection of beautiful homes</p>
            </section>
            <section id="products" class="section">
                <h1 class="section-title">Products</h1>
                <div class="product-grid">
                    <!-- products will be rendered here -->
                </div>
            </section>
            <section id="cart" class="section">
                <h1 class="section-title">Cart</h1>
                <div class="cart-content">
                    <!-- cart content will be rendered here -->
                </div>
            </section>
            <section id="settings" class="section">
                <h1 class="section-title">Settings</h1>
                <div class="settings-tabs">
                    <button class="tab-button active" data-tab="profile">Profile</button>
                    <button class="tab-button" data-tab="security">Security</button>
                    <button class="tab-button" data-tab="preferences">Preferences</button>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" data-tab="profile">
                        <h2>Profile</h2>
                        <p>Profile settings</p>
                    </div>
                    <div class="tab-pane" data-tab="security">
                        <h2>Security</h2>
                        <p>Security settings</p>
                    </div>
                    <div class="tab-pane" data-tab="preferences">
                        <h2>Preferences</h2>
                        <p>Preferences settings</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>