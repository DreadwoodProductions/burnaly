import { checkAuth } from './services/auth';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LoginForm } from './components/Auth/LoginForm';
import { Notification } from './components/Common/Notification';
import { Loader } from './components/Common/Loader';
import './styles/main.css';

class App {
    constructor() {
        this.init();
    }

    init() {
        this.renderApp();
        checkAuth() ? this.showDashboard() : this.showLogin();
    }

    renderApp() {
        document.body.innerHTML = `
            ${Loader()}
            ${Notification()}
            <div id="loginContainer"></div>
            <div id="dashboardContainer"></div>
        `;
    }

    showDashboard() {
        const dashboardContainer = document.getElementById('dashboardContainer');
        const loginContainer = document.getElementById('loginContainer');
        
        dashboardContainer.innerHTML = Dashboard();
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        
        this.initializeDashboard();
    }

    showLogin() {
        const dashboardContainer = document.getElementById('dashboardContainer');
        const loginContainer = document.getElementById('loginContainer');
        
        loginContainer.innerHTML = LoginForm();
        dashboardContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    }

    initializeDashboard() {
        // Initialize charts and start data polling
        initCharts();
        startDataPolling();
    }
}

// Initialize the application
new App();
