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
                    <a href="${executor.links.download}" target="_blank" class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </a>
                    <a href="${executor.links.discordInvite}" target="_blank" class="discord-btn">
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
            .map(feature => `<i class="fas ${feature.icon}" title="${feature.label}"></i>`)
            .join('');
    }

    createPlatformIcons(devices) {
        const platforms = [
            { platform: 'windows', icon: 'fab fa-windows', label: 'Windows' },
            { platform: 'mac', icon: 'fab fa-apple', label: 'Mac' },
            { platform: 'android', icon: 'fab fa-android', label: 'Android' },
            { platform: 'ios', icon: 'fab fa-app-store-ios', label: 'iOS' }
        ];

        return platforms
            .filter(platform => devices[platform.platform])
            .map(platform => `<i class="${platform.icon}" title="${platform.label}"></i>`)
            .join('');
    }

    setupEventListeners() {
        document.querySelector(this.SELECTORS.searchInput).addEventListener(this.EVENTS.INPUT, this.handleSearch.bind(this));
        Object.entries(this.SELECTORS.filters).forEach(([filter, selector]) => {
            if (filter !== 'reset') {
                document.querySelector(selector).addEventListener(this.EVENTS.CHANGE, (event) => {
                    this.handleFilterChange(filter, event);
                });
            } else {
                document.querySelector(selector).addEventListener(this.EVENTS.CLICK, this.resetFilters.bind(this));
            }
        });
    }

    handleSearch(event) {
        this.filterState.search = event.target.value.toLowerCase();
        this.applyFilters();
    }

    handleFilterChange(filter, event) {
        this.filterState[filter] = event.target.value;
        this.applyFilters();
    }

    resetFilters() {
        Object.values(this.SELECTORS.filters).forEach(selector => {
            if (selector !== this.SELECTORS.searchInput) {
                const element = document.querySelector(selector);
                if (element) {
                    element.value = this.FILTER_VALUES.ALL;
                }
            }
        });
        this.filterState = {
            search: '',
            platform: this.FILTER_VALUES.ALL,
            level: this.FILTER_VALUES.ALL,
            price: this.FILTER_VALUES.ALL,
            support: this.FILTER_VALUES.ALL
        };
        document.querySelector(this.SELECTORS.searchInput).value = '';
        this.applyFilters();
    }

    applyFilters() {
        const cards = Array.from(document.querySelectorAll(this.SELECTORS.card));
        cards.forEach(card => {
            const matchesSearch = card.textContent.toLowerCase().includes(this.filterState.search);
            const matchesPlatform = this.filterState.platform === this.FILTER_VALUES.ALL || card.dataset.platform.includes(this.filterState.platform);
            const matchesLevel = this.filterState.level === this.FILTER_VALUES.ALL || card.dataset.level === this.filterState.level;
            const matchesPrice = this.filterState.price === this.FILTER_VALUES.ALL || card.dataset.price === this.filterState.price;
            const matchesSupport = this.filterState.support === this.FILTER_VALUES.ALL || card.dataset.support === this.filterState.support;

            if (matchesSearch && matchesPlatform && matchesLevel && matchesPrice && matchesSupport) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    setupIntersectionObserver() {
        const cards = document.querySelectorAll(this.SELECTORS.card);
        const observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
        cards.forEach(card => observer.observe(card));
    }

    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }

    addCardAnimations() {
        const cards = document.querySelectorAll(this.SELECTORS.card);
        cards.forEach(this.animateCard.bind(this));
    }

    animateCard(card, index) {
        const delay = index * 0.1;
        card.style.animationDelay = `${delay}s`;
    }

    addCopyFeature() {
        document.body.addEventListener(this.EVENTS.CLICK, (event) => {
            if (event.target.classList.contains('fa-external-link')) {
                const link = event.target.closest('a');
                if (link) {
                    navigator.clipboard.writeText(link.href).then(() => {
                        console.log('Link copied to clipboard');
                    }).catch(err => {
                        console.error('Failed to copy link: ', err);
                    });
                }
            }
        });
    }

    addPlatformDetails() {
        document.body.addEventListener(this.EVENTS.MOUSEOVER, (event) => {
            if (event.target.matches(this.SELECTORS.platformIcons)) {
                const platform = event.target.title;
                console.log(`Platform: ${platform}`);
            }
        });
    }

    addGlitchEffects() {
        const title = document.querySelector('h1.neonText.glitch-on-hover');
        if (title) {
            setInterval(() => {
                title.classList.toggle('active-glitch');
            }, 5000);
        }

        const cards = document.querySelectorAll(this.SELECTORS.card);
        cards.forEach(card => {
            this.addButtonAnimations(card);
        });
    }

    addButtonAnimations(card) {
        const buttons = card.querySelectorAll('.buttons a');
        buttons.forEach(button => {

            button.addEventListener(this.EVENTS.MOUSEOVER, () => {

                button.classList.add('button-hover');
            });

            button.addEventListener(this.EVENTS.MOUSEOUT, () => {

                button.classList.remove('button-hover');
            });
        });
    }
}
