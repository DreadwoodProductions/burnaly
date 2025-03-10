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
             buttons: '.buttons a',
             passcodeOverlay: '#passcode-overlay',
             passcodeForm: '#passcode-form',
             passcodeInput: '#passcode-input',
             passcodeSubmit: '#passcode-submit',
             passcodeError: '#passcode-error'
         };
  
         this.EVENTS = {
             DOM_CONTENT_LOADED: 'DOMContentLoaded',
             INPUT: 'input',
             CHANGE: 'change',
             CLICK: 'click',
             MOUSEOVER: 'mouseover',
             MOUSEOUT: 'mouseout',
             SUBMIT: 'submit'
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
  
         this.correctPasscode = 'na1213'; // Set your desired passcode here
     }
  
     async initialize() {
         this.createPasscodeOverlay();
         this.setupPasscodeEventListener();
         await this.checkPasscode();
     }
  
     createPasscodeOverlay() {
         const overlay = document.createElement('div');
         overlay.id = 'passcode-overlay';
         overlay.innerHTML = `
             <div class="passcode-container">
                 <h2>Enter Passcode</h2>
                 <form id="passcode-form">
                     <input type="password" id="passcode-input" placeholder="Enter passcode" required>
                     <button type="submit" id="passcode-submit">Submit</button>
                 </form>
                 <p id="passcode-error" style="color: red; display: none;">Incorrect passcode. Please try again.</p>
             </div>
         `;
         document.body.appendChild(overlay);
     }
  
     setupPasscodeEventListener() {
         const form = document.querySelector(this.SELECTORS.passcodeForm);
         form.addEventListener(this.EVENTS.SUBMIT, this.handlePasscodeSubmit.bind(this));
     }
  
     async checkPasscode() {
         const overlay = document.querySelector(this.SELECTORS.passcodeOverlay);
         overlay.style.display = 'flex';
         document.body.style.overflow = 'hidden';
     }
  
     handlePasscodeSubmit(event) {
         event.preventDefault();
         const input = document.querySelector(this.SELECTORS.passcodeInput);
         const error = document.querySelector(this.SELECTORS.passcodeError);
  
         if (input.value === this.correctPasscode) {
             const overlay = document.querySelector(this.SELECTORS.passcodeOverlay);
             overlay.style.display = 'none';
             document.body.style.overflow = 'auto';
             this.initializeApp();
         } else {
             error.style.display = 'block';
             input.value = '';
         }
     }
  
     async initializeApp() {
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
             if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
             }
             const data = await response.json();
             this.renderExecutors(data.executors);
         } catch (error) {
             console.error('Failed to load executors:', error);
             this.displayErrorState();
         }
     }
  
     displayErrorState() {
         const container = document.querySelector(this.SELECTORS.cardsContainer);
         container.innerHTML = `
             <div class="error-message">
                 <p>Unable to load executors. Please try again later.</p>
             </div>
         `;
     }
  
     setupEventListeners() {
         const { searchInput, filters } = this.SELECTORS;
         document.querySelector(searchInput).addEventListener(this.EVENTS.INPUT, this.handleSearch.bind(this));
         Object.values(filters).forEach(selector => {
             const element = document.querySelector(selector);
             if (element) {
                 element.addEventListener(this.EVENTS.CHANGE, this.handleFilterChange.bind(this));
             }
         });
         const resetButton = document.querySelector(filters.reset);
         if (resetButton) {
             resetButton.addEventListener(this.EVENTS.CLICK, this.resetFilters.bind(this));
         }
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
         const selectElements = document.querySelectorAll('select');
         selectElements.forEach(select => select.value = this.FILTER_VALUES.ALL);
  
         this.applyFilters();
     }
  
     applyFilters() {
         const cards = document.querySelectorAll(this.SELECTORS.card);
         cards.forEach(card => {
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
  
     renderExecutors(executors) {
         const container = document.querySelector(this.SELECTORS.cardsContainer);
         container.innerHTML = executors.map((executor, index) => this.createExecutorCard(executor, index)).join('');
         this.addCardAnimations();
     }
  
     createExecutorCard(executor, index) {
         const platforms = Object.keys(executor.devices).filter(platform => executor.devices[platform]).join(' ');
         const price = executor.details.paid ? 'paid' : 'free';
         const support = executor.details.supported ? 'supported' : 'unsupported';
         const featureIcons = this.createFeatureIcons(executor.details);
         const platformIcons = this.createPlatformIcons(executor.devices);
  
         return `
             <div class="card" 
                  style="--card-index: ${index}"
                  data-platform="${platforms}"
                  data-level="${executor.details.level}"
                  data-price="${price}"
                  data-support="${support}">
                 <div class="card-header">
                     <h3>${executor.name}</h3>
                     <div class="feature-badges">
                         ${featureIcons}
                     </div>
                 </div>
  
                 <div class="card-content">
                     <div class="info-section">
                         <div class="level">Level ${executor.details.level}</div>
                         <div class="status-badge ${support}">
                             <i class="fas fa-circle"></i>
                             ${support.charAt(0).toUpperCase() + support.slice(1)}
                         </div>
                     </div>
                     <div class="platforms">
                         ${platformIcons}
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
  
     createPlatformIcons(devices) {
         const platforms = [
             { name: 'Windows', icon: 'fa-windows', condition: devices.Windows },
             { name: 'Mac', icon: 'fa-apple', condition: devices.Mac },
             { name: 'Android', icon: 'fa-android', condition: devices.Android },
             { name: 'iOS', icon: 'fa-mobile-screen', condition: devices.iOS }
         ];
  
         return platforms.map(platform => `
             <i class="fa-brands ${platform.icon} ${platform.condition ? 'active' : 'inactive'}" title="${platform.name}"></i>
         `).join('');
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
                 <div class="feature-badge">
                     <i class="fa-solid ${feature.icon}" title="${feature.label}"></i>
                     <span>${feature.label}</span>
                 </div>
             `).join('');
     }
  
     setupIntersectionObserver() {
         const cards = document.querySelectorAll(this.SELECTORS.card);
         const observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
         cards.forEach(card => observer.observe(card));
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
                 button.style.transform = 'translateY(-2px)';
             });
  
             button.addEventListener(this.EVENTS.MOUSEOUT, () => {
                 button.style.transform = 'translateY(0)';
             });
         });
     }
  
     addCopyFeature() {
         const downloadButtons = document.querySelectorAll(this.SELECTORS.downloadBtn);
         downloadButtons.forEach(button => {
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
         const platformIcons = document.querySelectorAll(this.SELECTORS.platformIcons);
         platformIcons.forEach(icon => {
             const platformName = icon.getAttribute('title');
             const isActive = icon.classList.contains('active');
             icon.setAttribute('data-tooltip', `${platformName}: ${isActive ? 'Supported' : 'Not Supported'}`);
         });
     }
 }
