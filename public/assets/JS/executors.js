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
}
