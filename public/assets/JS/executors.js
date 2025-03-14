document.addEventListener('DOMContentLoaded', () => {
    const app = new ExecutorApp();
    app.initialize();
});

class ExecutorApp {
    constructor() {
        this.SELECTORS = {
            cardsContainer: '.cards-container',
            searchInput: '#search',
            filters: {
                platform: '#platform-filter',
                level: '#level-filter',
                price: '#price-filter',
                support: '#support-filter',
                reset: '#reset-filters'
            },
            card: '.card',
            downloadBtn: '.download-btn',
            platformIcons: '.platforms i',
            featureIcons: '.features i',
            buttons: '.buttons a'
        };

        this.EVENTS = {
            DOM_CONTENT_LOADED: 'DOMContentLoaded',
            INPUT: 'input',
            CHANGE: 'change',
            CLICK: 'click',
            MOUSEOVER: 'mouseover',
            MOUSEOUT: 'mouseout'
        };

        this.FILTER_VALUES = {
            ALL: 'all'
        };

        this.filterState = {
            search: '',
            platform: this.FILTER_VALUES.ALL,
            level: this.FILTER_VALUES.ALL,
            price: this.FILTER_VALUES.ALL,
            support: this.FILTER_VALUES.ALL
        };

        this.observerOptions = {
            threshold: 0.1
        };
    }

    async initialize() {
        this.createLoadingState();
        await this.loadExecutors();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.addCopyFeature();
        this.addPlatformDetails();
        this.addGlitchEffects(); 
    }

    createLoadingState() {
        const container = document.querySelector(this.SELECTORS.cardsContainer);
        container.innerHTML = Array.from({ length: 8 }, () => this.getLoadingCardTemplate()).join('');
    }

    getLoadingCardTemplate() {
        return `
            <div class="card card-skeleton">
                <div class="skeleton-header">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-badge"></div>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton-level"></div>
                    <div class="skeleton-platforms"></div>
                    <div class="skeleton-features"></div>
                </div>
                <div class="skeleton-buttons">
                    <div class="skeleton-button"></div>
                    <div class="skeleton-button"></div>
                </div>
            </div>
        `;
    }

    async loadExecutors() {
        try {
            const response = await fetch('assets/data/executors.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.renderExecutors(data.executors);
        } catch (error) {
            console.error('Failed to load executors:', error);
            this.displayErrorState();
        }
    }

    renderExecutors(executors) {
        const container = document.querySelector(this.SELECTORS.cardsContainer);
        container.innerHTML = executors.map((executor, index) => this.createExecutorCard(executor, index)).join('');
        this.addCardAnimations();
    }

    createExecutorCard(executor, index) {
        const platforms = Object.keys(executor.devices).filter(platform => executor.devices[platform]).join(' ');
        const price = executor.details.paid ? 'paid' : 'free';
        const support = executor.details.supported ? 'supported' : 'unsupported';

        return `
            <div class="card" 
                 style="--card-index: ${index}"
                 data-platform="${platforms}"
                 data-level="${executor.details.level}"
                 data-price="${price}"
                 data-support="${support}">
                <div class="card-header">
                    <h3 class="glitch-on-hover">${executor.name}</h3>
                    <div class="feature-badges">
                        ${this.createFeatureIcons(executor.details)}
                    </div>
                </div>
                <div class="card-content">
                    <div class="info-section glitch-element">
                        <div class="level flicker-text">Level ${executor.details.level}</div>
                        <div class="status-badge ${support}">
                            <i class="fas fa-circle"></i>
                            <span class="glitch-on-hover">${support.charAt(0).toUpperCase() + support.slice(1)}</span>
                        </div>
                    </div>
                    <div class="platforms">
                        ${this.createPlatformIcons(executor.devices)}
                    </div>
                </div>
                <div class="buttons">
                    <a href="${executor.links.download}" target="_blank" class="download-btn glitch-on-hover">
                        <i class="fas fa-download"></i> Download
                    </a>
                    <a href="${executor.links.discordInvite}" target="_blank" class="discord-btn glitch-on-hover">
                        <i class="fab fa-discord"></i> Discord
                    </a>
                </div>
            </div>
        `;
    }

    displayErrorState() {
        const container = document.querySelector(this.SELECTORS.cardsContainer);
        container.innerHTML = `
            <div class="error-message">
                <h2 class="glitch-on-hover">Unable to load executors</h2>
                <p class="flicker-text">Please try refreshing the page</p>
            </div>
        `;
    }

    createFeatureIcons(details) {
        const features = [
            { condition: details.paid, icon: 'fa-credit-card', label: 'Paid' },
            { condition: details.key, icon: 'fa-key', label: 'Key' },
            { condition: details.community, icon: 'fa-users', label: 'Community' },
            { condition: details.external, icon: 'fa-external-link', label: 'External' }
        ];

        return features
            .filter(feature => feature.condition)
            .map(feature => `
                <i class="fa-solid ${feature.icon}" data-tooltip="${feature.label}"></i>
            `).join('');
    }

    createPlatformIcons(devices) {
        const platforms = [
            { name: 'Windows', icon: 'fa-windows', condition: devices.Windows },
            { name: 'Mac', icon: 'fa-apple', condition: devices.Mac },
            { name: 'Android', icon: 'fa-android', condition: devices.Android },
            { name: 'iOS', icon: 'fa-mobile-screen', condition: devices.iOS }
        ];

        return platforms.map(platform => `
            <i class="fa-brands ${platform.icon} ${platform.condition ? 'active' : 'inactive'}" 
               title="${platform.name}"></i>
        `).join('');
    }

    setupEventListeners() {
        document.querySelector(this.SELECTORS.searchInput)
            .addEventListener(this.EVENTS.INPUT, this.handleSearch.bind(this));

        Object.values(this.SELECTORS.filters).forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener(this.EVENTS.CHANGE, this.handleFilterChange.bind(this));
            }
        });

        document.querySelector(this.SELECTORS.filters.reset)
            .addEventListener(this.EVENTS.CLICK, this.resetFilters.bind(this));
    }

    handleSearch(event) {
        this.filterState.search = event.target.value.trim();
        this.applyFilters();
    }

    handleFilterChange(event) {
        const filterKey = event.target.id.split('-')[0];
        this.filterState[filterKey] = event.target.value;
        this.applyFilters();
    }

    resetFilters() {
        this.filterState = {
            search: '',
            platform: this.FILTER_VALUES.ALL,
            level: this.FILTER_VALUES.ALL,
            price: this.FILTER_VALUES.ALL,
            support: this.FILTER_VALUES.ALL
        };

        document.querySelector(this.SELECTORS.searchInput).value = '';
        document.querySelectorAll('select')
            .forEach(select => select.value = this.FILTER_VALUES.ALL);

        this.applyFilters();
    }

    applyFilters() {
        document.querySelectorAll(this.SELECTORS.card).forEach(card => {
            const isVisible = this.checkCardAgainstFilters(card);
            card.style.display = isVisible ? '' : 'none';
            card.style.opacity = isVisible ? '1' : '0';
            card.style.visibility = isVisible ? 'visible' : 'hidden';
        });
    }

    checkCardAgainstFilters(card) {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const platforms = card.dataset.platform.toLowerCase();
        const { level, price, support } = card.dataset;

        const { search, platform, level: filterLevel, price: filterPrice, support: filterSupport } = this.filterState;

        return (!search || title.includes(search.toLowerCase())) &&
               (platform === this.FILTER_VALUES.ALL || platforms.includes(platform)) &&
               (filterLevel === this.FILTER_VALUES.ALL || level === filterLevel) &&
               (filterPrice === this.FILTER_VALUES.ALL || price === filterPrice) &&
               (filterSupport === this.FILTER_VALUES.ALL || support === filterSupport);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.observerOptions
        );

        document.querySelectorAll(this.SELECTORS.card)
            .forEach(card => observer.observe(card));
    }

    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }

    addCardAnimations() {
        const cards = document.querySelectorAll(this.SELECTORS.card);
        cards.forEach((card, index) => {
            card.style.setProperty('--card-index', index);
            this.addFeatureIconAnimations(card);
            this.addButtonAnimations(card);
        });
    }

    addFeatureIconAnimations(card) {
        const features = card.querySelectorAll('.feature-badges i');
        features.forEach(icon => {
            icon.addEventListener(this.EVENTS.MOUSEOVER, () => {
                icon.style.transform = 'scale(1.2) rotate(8deg)';
            });

            icon.addEventListener(this.EVENTS.MOUSEOUT, () => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }

    addButtonAnimations(card) {
        const buttons = card.querySelectorAll(this.SELECTORS.buttons);
        buttons.forEach(button => {
            button.addEventListener(this.EVENTS.MOUSEOVER, () => {
                button.style.transform = 'translateY(-102px)';
            });

            button.addEventListener(this.EVENTS.MOUSEOUT, () => {
                button.style.transform = 'translateY(-100)';
            });
        });
    }

    addCopyFeature() {
        document.querySelectorAll(this.SELECTORS.downloadBtn).forEach(button => {
            button.addEventListener(this.EVENTS.CLICK, async (event) => {
                event.preventDefault();
                try {
                    await navigator.clipboard.writeText(button.href);
                    this.showCopyFeedback(button);
                } catch (error) {
                    console.error('Failed to copy text:', error);
                }
            });
        });
    }

    showCopyFeedback(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }, 2000);
    }

    addPlatformDetails() {
        document.querySelectorAll(this.SELECTORS.platformIcons).forEach(icon => {
            const platformName = icon.getAttribute('title');
            const isActive = icon.classList.contains('active');
            icon.setAttribute('data-tooltip', 
                `${platformName}: ${isActive ? 'Supported' : 'Not Supported'}`
            );
        });
    }

    addGlitchEffects() {

        const siteTitle = document.querySelector('header h1.neonText');
        if (siteTitle) {
            siteTitle.classList.add('glitch-on-hover');

            setInterval(() => {
                siteTitle.classList.add('active-glitch');
                setTimeout(() => {
                    siteTitle.classList.remove('active-glitch');
                }, 2000);
            }, 8000);
        }

        const glitchElements = document.querySelectorAll('.glitch-on-hover');
        setInterval(() => {
            const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
            if (randomElement) {
                randomElement.classList.add('active-glitch');
                setTimeout(() => {
                    randomElement.classList.remove('active-glitch');
                }, 1500);
            }
        }, 5000);
    }
}
