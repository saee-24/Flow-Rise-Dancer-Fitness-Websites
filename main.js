// ==================== UTILITY FUNCTIONS ====================
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// ==================== NAVIGATION FUNCTIONALITY ====================
class Navigation {
    constructor() {
        this.menuToggle = document.getElementById('menuToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navbar = document.querySelector('.navbar');
        this.init();
    }

    init() {
        // Toggle menu on button click
        this.menuToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu when a link is clicked
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Navbar scroll effect
        window.addEventListener('scroll', throttle(() => this.onScroll(), 100));

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.menuToggle.classList.remove('active');
    }

    onScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
}

// ==================== SCROLL TO TOP FUNCTIONALITY ====================
class ScrollToTop {
    constructor() {
        this.button = document.createElement('button');
        this.button.classList.add('scroll-to-top');
        this.button.innerHTML = '↑';
        document.body.appendChild(this.button);
        this.init();
    }

    init() {
        window.addEventListener('scroll', throttle(() => this.toggleVisibility(), 100));
        this.button.addEventListener('click', () => this.scrollToTop());
    }

    toggleVisibility() {
        if (window.scrollY > 300) {
            this.button.classList.add('show');
        } else {
            this.button.classList.remove('show');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ==================== BOOKING FORM FUNCTIONALITY ====================
class BookingForm {
    constructor() {
        this.form = document.getElementById('bookingForm');
        this.init();
    }

    init() {
        if (!this.form) {
            return;
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupDateLimits();
    }

    handleSubmit(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            sessionType: document.getElementById('session-type').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            trainer: document.getElementById('trainer').value,
            experience: document.querySelector('input[name="experience"]:checked')?.value,
            message: document.getElementById('message').value
        };

        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        // Simulate booking submission
        this.submitBooking(formData);
    }

    validateForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            this.showError('Please enter a valid name');
            return false;
        }

        if (!this.validateEmail(data.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (!data.phone || data.phone.trim().length < 10) {
            this.showError('Please enter a valid phone number');
            return false;
        }

        if (!data.sessionType) {
            this.showError('Please select a session type');
            return false;
        }

        if (!data.date) {
            this.showError('Please select a date');
            return false;
        }

        if (!data.time) {
            this.showError('Please select a time');
            return false;
        }

        if (!data.trainer) {
            this.showError('Please select a trainer');
            return false;
        }

        if (!data.experience) {
            this.showError('Please select your experience level');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    setupDateLimits() {
        const dateInput = document.getElementById('date');
        const today = new Date();
        today.setDate(today.getDate());
        
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 90);

        dateInput.min = this.formatDate(today);
        dateInput.max = this.formatDate(maxDate);
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    submitBooking(data) {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            text-align: center;
            max-width: 500px;
            animation: slideIn 0.5s ease;
        `;

        successMsg.innerHTML = `
            <h2>✓ Booking Confirmed!</h2>
            <p style="margin: 1rem 0; opacity: 0.95;">
                Thank you, <strong>${data.name}</strong>!<br>
                A confirmation email has been sent to <strong>${data.email}</strong>
            </p>
            <p style="font-size: 0.9rem; opacity: 0.9;">
                Session: ${this.getSessionLabel(data.sessionType)}<br>
                Date: ${data.date} at ${data.time}<br>
                Trainer: ${this.getTrainerName(data.trainer)}
            </p>
            <button style="
                margin-top: 1.5rem;
                padding: 10px 25px;
                background: white;
                color: #8b5cf6;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onclick="this.parentElement.remove()">Close</button>
        `;

        document.body.appendChild(successMsg);

        // Reset form
        this.form.reset();

        // Log booking data (in real app, send to server)
        console.log('Booking Data:', data);
    }

    showError(message) {
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.5s ease;
        `;

        errorMsg.textContent = message;
        document.body.appendChild(errorMsg);

        setTimeout(() => {
            errorMsg.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => errorMsg.remove(), 500);
        }, 3000);
    }

    getSessionLabel(value) {
        const labels = {
            'dancer-yoga': 'Dancer Yoga',
            'injury-prevention': 'Injury Prevention',
            'strength-training': 'Strength Training',
            'conditioning': 'Advanced Conditioning'
        };
        return labels[value] || value;
    }

    getTrainerName(value) {
        const names = {
            'sarah-patel': 'Sarah Patel - Yoga Specialist',
            'marcus-chen': 'Marcus Chen - Strength Coach',
            'emily-reed': 'Emily Reed - Injury Prevention',
            'james-davis': 'James Davis - Performance Coach'
        };
        return names[value] || value;
    }
}

// ==================== SHOPPING CART FUNCTIONALITY ====================
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
    }

    addToCart(productName) {
        this.cart.push({
            id: Date.now(),
            name: productName,
            timestamp: new Date()
        });

        this.saveCart();
        this.showNotification(`${productName} added to cart successfully`);
    }

    saveCart() {
        localStorage.setItem('flowRiseCart', JSON.stringify(this.cart));
    }

    loadCart() {
        const saved = localStorage.getItem('flowRiseCart');
        return saved ? JSON.parse(saved) : [];
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideIn 0.5s ease;
            font-weight: 600;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
}

// ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
class AnimationObserver {
    constructor() {
        this.observedElements = document.querySelectorAll(
            '.session-card, .blog-card, .product-card, .testimonial-card'
        );
        this.init();
    }

    init() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.observedElements.forEach(element => {
            element.style.opacity = '0';
            observer.observe(element);
        });
    }
}

// ==================== SMOOTH SCROLLING ====================
class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleClick(e) {
        const href = e.currentTarget.getAttribute('href');
        
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ==================== PASSWORD & SECURITY ====================
class SecurityManager {
    constructor() {
        this.init();
    }

    init() {
        this.preventXSS();
        this.addCSPHeaders();
    }

    preventXSS() {
        // This would typically be done server-side
        // Sanitize any user input
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = this.sanitizeInput(e.target.value);
            });
        });
    }

    sanitizeInput(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    addCSPHeaders() {
        // Note: CSP headers should be set server-side
        // This is just a reminder of best practices
        console.log('CSP headers should be configured on the server');
    }
}

// ==================== PERFORMANCE MONITORING ====================
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            window.addEventListener('load', () => {
                this.measurePerformance();
            });
        }
    }

    measurePerformance() {
        if (window.performance && window.performance.timing) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page Load Time:', pageLoadTime, 'ms');
        }
    }
}

// ==================== MAIN INITIALIZATION ====================
function initializeApp() {
    // Initialize all modules
    const navigation = new Navigation();
    const scrollToTop = new ScrollToTop();
    const bookingForm = new BookingForm();
    const shoppingCart = new ShoppingCart();
    const animationObserver = new AnimationObserver();
    const smoothScroll = new SmoothScroll();
    const securityManager = new SecurityManager();
    const performanceMonitor = new PerformanceMonitor();

    // Attach add-to-cart behavior to product buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const productName = button.dataset.product;
            shoppingCart.addToCart(productName);
        });
    });

    console.log('🌸 Flow Rise App Initialized Successfully!');
}

// ==================== DOM READY ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ==================== SERVICE WORKER REGISTRATION ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here for PWA functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ==================== CUSTOM ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(style);
