<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(90deg, #4B0082, #8A2BE2, #00FFFF);
            font-family: 'Inter', sans-serif;
            color: white;
            margin: 0;
            padding: 0;
        }
        .navbar {
            position: sticky;
            top: 0;
            backdrop-filter: blur(20px);
            background-color: rgba(15, 23, 42, 0.7);
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
        }
        .navbar a {
            color: white;
            text-decoration: none;
            margin-left: 20px;
            transition: transform 0.2s;
        }
        .navbar a:hover {
            transform: scale(1.05);
        }
        .container {
            display: flex;
            flex-wrap: wrap;
            padding: 20px;
            justify-content: center;
            gap: 20px;
        }
        .card {
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            width: 300px;
            transition: transform 0.2s;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        .card:hover {
            transform: scale(1.05);
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(5px);
            justify-content: center;
            align-items: center;
            z-index: 20;
        }
        .modal-content {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(20px);
            animation: fadeInUp 0.3s;
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
        .button {
            background-color: #4B0082;
            border: none;
            color: white;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="logo">MaiaHomes</div>
        <div class="links">
            <a href="#">Home</a>
            <a href="#">Products</a>
            <a href="#">Cart</a>
        </div>
    </div>
    <div class="container" id="product-list">
        <div class="card" onclick="openModal('Product 1 Details')">
            <h3>Product 1</h3>
            <p>Description of Product 1.</p>
            <button class="button">View</button>
        </div>
        <div class="card" onclick="openModal('Product 2 Details')">
            <h3>Product 2</h3>
            <p>Description of Product 2.</p>
            <button class="button">View</button>
        </div>
        <div class="card" onclick="openModal('Product 3 Details')">
            <h3>Product 3</h3>
            <p>Description of Product 3.</p>
            <button class="button">View</button>
        </div>
    </div>
    <div class="modal" id="modal">
        <div class="modal-content">
            <span id="modal-text"></span>
            <button onclick="closeModal()" class="button">Close</button>
        </div>
    </div>
    <script>
        function openModal(content) {
            document.getElementById('modal-text').innerText = content;
            document.getElementById('modal').style.display = 'flex';
        }
        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }
    </script>
</body>
</html>