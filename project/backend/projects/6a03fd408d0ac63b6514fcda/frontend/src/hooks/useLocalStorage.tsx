<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MaiaHomes E-Commerce</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        body {
            background: #0F172A;
            color: #ffffff;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }
        .navbar {
            position: sticky;
            top: 0;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        .nav-link {
            color: white;
            margin: 0 15px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .nav-link:hover {
            transform: scale(1.05);
        }
        .container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 2rem;
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.5);
            animation: fadeInUp 0.5s ease-in-out;
        }
        .card:hover {
            transform: scale(1.05);
        }
        .product-image {
            width: 100%;
            height: 200px;
            border-radius: 10px;
            object-fit: cover;
        }
        .product-title {
            font-size: 1.5rem;
            font-weight: 800;
            margin: 1rem 0;
        }
        .product-price {
            font-size: 1.2rem;
            font-weight: 600;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="logo">MaiaHomes</div>
        <div>
            <a href="#" class="nav-link">Home</a>
            <a href="#" class="nav-link">Products</a>
            <a href="#" class="nav-link">Cart</a>
        </div>
    </nav>
    <div class="container" id="product-list"></div>
    <script>
        const mockData = [
            { id: 1, title: "Stylish Sofa", price: 299.99, image: "sofa.jpg" },
            { id: 2, title: "Elegant Dining Table", price: 199.99, image: "table.jpg" },
            { id: 3, title: "Modern Chair", price: 99.99, image: "chair.jpg" },
            { id: 4, title: "Cozy Bed", price: 399.99, image: "bed.jpg" }
        ];
        document.addEventListener("DOMContentLoaded", () => {
            const productList = document.getElementById("product-list");
            mockData.forEach(product => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <img src="${product.image}" class="product-image" alt="${product.title}">
                    <h2 class="product-title">${product.title}</h2>
                    <p class="product-price">$${product.price}</p>
                `;
                productList.appendChild(card);
            });
        });
    </script>
</body>
</html>