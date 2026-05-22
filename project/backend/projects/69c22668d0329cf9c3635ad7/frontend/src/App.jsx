#root {
    padding: 2em;
}

// script.js
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }

    addRoute(route, component) {
        this.routes[route] = component;
    }

    render(route) {
        const component = this.routes[route];
        if (component) {
            const root = document.getElementById('root');
            root.innerHTML = component.render();
        } else {
            const root = document.getElementById('root');
            root.innerHTML = '404 Not Found';
        }
    }
}

class HomeComponent {
    render() {
        return `
            <h1>Welcome to Online Library Management Website</h1>
            <p>This is the home page.</p>
        `;
    }
}

class DashboardComponent {
    render() {
        return `
            <h1>Dashboard</h1>
            <p>This is the dashboard page.</p>
        `;
    }
}

const router = new Router();
const homeComponent = new HomeComponent();
const dashboardComponent = new DashboardComponent();

router.addRoute('home', homeComponent);
router.addRoute('dashboard', dashboardComponent);

window.addEventListener('hashchange', () => {
    const route = window.location.hash.substring(1);
    router.render(route);
});

window.addEventListener('load', () => {
    const route = window.location.hash.substring(1);
    if (!route) {
        router.render('home');
    } else {
        router.render(route);
    }
});