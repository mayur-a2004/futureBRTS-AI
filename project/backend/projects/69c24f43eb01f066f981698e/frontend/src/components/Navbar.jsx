<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Library Website</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    <nav class="flex justify-between bg-blue-500 text-white py-4">
        <div class="flex items-center">
            <img src="logo.png" alt="Logo" class="h-12 w-12 mr-4">
            <span class="text-2xl font-bold">Online Library</span>
        </div>
        <ul class="hidden md:flex items-center">
            <li class="mr-6">
                <a href="#" class="hover:text-gray-300">Home</a>
            </li>
            <li class="mr-6">
                <a href="#" class="hover:text-gray-300">Books</a>
            </li>
            <li class="mr-6">
                <a href="#" class="hover:text-gray-300">Authors</a>
            </li>
        </ul>
        <div class="flex items-center">
            <button id="auth-toggle" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                Login
            </button>
            <div id="auth-menu" class="hidden absolute bg-white text-black py-2 px-4 rounded shadow-md">
                <a href="#" class="block py-2 hover:bg-gray-200">Login</a>
                <a href="#" class="block py-2 hover:bg-gray-200">Register</a>
            </div>
        </div>
        <button id="mobile-menu-toggle" class="md:hidden flex justify-center w-8 h-8 bg-blue-700 hover:bg-blue-800 text-white rounded">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </nav>
    <div id="mobile-menu" class="hidden absolute bg-white text-black py-2 px-4 rounded shadow-md top-16 left-0 w-full">
        <ul>
            <li class="py-2">
                <a href="#" class="hover:bg-gray-200">Home</a>
            </li>
            <li class="py-2">
                <a href="#" class="hover:bg-gray-200">Books</a>
            </li>
            <li class="py-2">
                <a href="#" class="hover:bg-gray-200">Authors</a>
            </li>
        </ul>
        <div class="py-2">
            <button id="auth-toggle-mobile" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                Login
            </button>
            <div id="auth-menu-mobile" class="hidden absolute bg-white text-black py-2 px-4 rounded shadow-md">
                <a href="#" class="block py-2 hover:bg-gray-200">Login</a>
                <a href="#" class="block py-2 hover:bg-gray-200">Register</a>
            </div>
        </div>
    </div>

    <script>
        const authToggle = document.getElementById('auth-toggle');
        const authMenu = document.getElementById('auth-menu');
        const authToggleMobile = document.getElementById('auth-toggle-mobile');
        const authMenuMobile = document.getElementById('auth-menu-mobile');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        authToggle.addEventListener('click', () => {
            authMenu.classList.toggle('hidden');
        });

        authToggleMobile.addEventListener('click', () => {
            authMenuMobile.classList.toggle('hidden');
        });

        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        window.addEventListener('click', (e) => {
            if (!authMenu.contains(e.target) && !authToggle.contains(e.target)) {
                authMenu.classList.add('hidden');
            }
            if (!authMenuMobile.contains(e.target) && !authToggleMobile.contains(e.target)) {
                authMenuMobile.classList.add('hidden');
            }
            if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    </script>
</body>
</html>