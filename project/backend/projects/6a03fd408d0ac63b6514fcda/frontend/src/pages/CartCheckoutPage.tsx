<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maiahomes Ecommerce</title>
    <link href="https://fonts.googleapis.com/css?family=Inter|Poppins&display=swap" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(90deg, #0F172A, #4c5d96, #9b5eab);
            color: white;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
        }
        .navbar {
            position: sticky;
            top: 0;
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            display: flex;
            justify-content: space-around;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        .glass-card {
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
            padding: 20px;
            margin: 10px;
            transition: transform 0.3s ease;
        }
        .glass-card:hover {
            transform: scale(1.05);
        }
        .product-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 10px;
            padding: 20px;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .fade-in {
            animation: fadeInUp 0.5s;
        }
        h1, h2 {
            font-weight: 800;
        }
        p {
            font-weight: 400;
        }
        .cart {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div>Maiahomes</div>
        <div>Products</div>
        <div>Cart</div>
        <div>Account</div>
    </nav>
    <div class="product-list">
        <div class="glass-card fade-in">
            <h2>Product 1</h2>
            <p>Description of Product 1</p>
            <button>Add to Cart</button>
        </div>
        <div class="glass-card fade-in">
            <h2>Product 2</h2>
            <p>Description of Product 2</p>
            <button>Add to Cart</button>
        </div>
        <div class="glass-card fade-in">
            <h2>Product 3</h2>
            <p>Description of Product 3</p>
            <button>Add to Cart</button>
        </div>
        <div class="glass-card fade-in">
            <h2>Product 4</h2>
            <p>Description of Product 4</p>
            <button>Add to Cart</button>
        </div>
    </div>
    <div class="cart">
        <h2>Your Shopping Cart</h2>
        <p>No items in your cart.</p>
        <button>Proceed to Checkout</button>
    </div>
    <script>
        const products = [
            { id: 1, name: "Product 1", description: "Description of Product 1" },
            { id: 2, name: "Product 2", description: "Description of Product 2" },
            { id: 3, name: "Product 3", description: "Description of Product 3" },
            { id: 4, name: "Product 4", description: "Description of Product 4" }
        ];
        
        const productList = document.querySelector('.product-list');
        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('glass-card', 'fade-in');
            card.innerHTML = `
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            productList.appendChild(card);
        });

        const shoppingCart = [];
        function addToCart(id) {
            const product = products.find(p => p.id === id);
            shoppingCart.push(product);
            alert(`${product.name} added to cart`);
        }
    </script>
</body>
</html>