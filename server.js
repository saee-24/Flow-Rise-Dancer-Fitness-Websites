// ==================== DEPENDENCIES ====================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// ==================== INITIALIZE APP ====================
const app = express();

// ==================== MIDDLEWARE ====================
// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Stricter rate limit for booking endpoint
const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 bookings per hour
    message: 'Too many bookings from this IP, please try again later.'
});

// ==================== SAMPLE DATA ====================
// In production, this would be in a database
const bookings = [];
const products = [
    {
        id: 1,
        name: 'Yoga Mat Premium',
        price: 45.99,
        description: 'Professional-grade yoga mat with extra thickness and grip',
        category: 'equipment'
    },
    {
        id: 2,
        name: 'Dancer Resistance Bands Set',
        price: 29.99,
        description: 'Complete set of 5 resistance bands for strength training',
        category: 'equipment'
    },
    {
        id: 3,
        name: 'Hydration Bottle - 1L',
        price: 24.99,
        description: 'Eco-friendly insulated water bottle to stay hydrated',
        category: 'accessories'
    },
    {
        id: 4,
        name: 'Flow Rise Training Shoes',
        price: 89.99,
        description: 'Specially designed cross-training shoes for dancers',
        category: 'footwear'
    },
    {
        id: 5,
        name: 'Deep Recovery Oil',
        price: 34.99,
        description: 'Therapeutic massage oil for muscle recovery and relaxation',
        category: 'wellness'
    }
];

const trainers = [
    {
        id: 1,
        name: 'Sarah Patel',
        specialty: 'Yoga & Flexibility',
        experience: 12,
        rating: 4.9,
        image: '🧘‍♀️'
    },
    {
        id: 2,
        name: 'Marcus Chen',
        specialty: 'Strength Training',
        experience: 10,
        rating: 4.8,
        image: '💪'
    },
    {
        id: 3,
        name: 'Emily Reed',
        specialty: 'Injury Prevention',
        experience: 15,
        rating: 4.95,
        image: '🛡️'
    },
    {
        id: 4,
        name: 'James Davis',
        specialty: 'Performance Coaching',
        experience: 8,
        rating: 4.7,
        image: '🏃'
    }
];

const sessions = [
    {
        id: 1,
        name: 'Dancer Yoga',
        description: 'Specialized yoga classes designed specifically for dancers',
        duration: 60,
        level: ['beginner', 'intermediate', 'advanced'],
        price: 65
    },
    {
        id: 2,
        name: 'Injury Prevention',
        description: 'Comprehensive injury prevention program',
        duration: 75,
        level: ['beginner', 'intermediate', 'advanced'],
        price: 75
    },
    {
        id: 3,
        name: 'Strength Training',
        description: 'Specialized strength training for dancers',
        duration: 90,
        level: ['intermediate', 'advanced'],
        price: 85
    },
    {
        id: 4,
        name: 'Advanced Conditioning',
        description: 'Intensive conditioning for professional dancers',
        duration: 120,
        level: ['advanced'],
        price: 105
    }
];

// ==================== HELPER FUNCTIONS ====================
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePhoneNumber = (phone) => {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone);
};

const generateBookingId = () => {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 9);
};

// ==================== ROUTES ====================

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Flow Rise API is running',
        timestamp: new Date().toISOString()
    });
});

// ==================== SESSIONS ROUTES ====================
app.get('/api/sessions', (req, res) => {
    try {
        res.json({
            success: true,
            data: sessions,
            count: sessions.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions',
            error: error.message
        });
    }
});

app.get('/api/sessions/:id', (req, res) => {
    try {
        const session = sessions.find(s => s.id === parseInt(req.params.id));
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching session',
            error: error.message
        });
    }
});

// ==================== TRAINERS ROUTES ====================
app.get('/api/trainers', (req, res) => {
    try {
        res.json({
            success: true,
            data: trainers,
            count: trainers.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trainers',
            error: error.message
        });
    }
});

app.get('/api/trainers/:id', (req, res) => {
    try {
        const trainer = trainers.find(t => t.id === parseInt(req.params.id));
        
        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Trainer not found'
            });
        }

        res.json({
            success: true,
            data: trainer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trainer',
            error: error.message
        });
    }
});

// ==================== PRODUCTS ROUTES ====================
app.get('/api/products', (req, res) => {
    try {
        const category = req.query.category;
        let filteredProducts = products;

        if (category) {
            filteredProducts = products.filter(p => p.category === category);
        }

        res.json({
            success: true,
            data: filteredProducts,
            count: filteredProducts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const product = products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// ==================== BOOKING ROUTES ====================
app.post('/api/bookings', bookingLimiter, (req, res) => {
    try {
        const { name, email, phone, sessionType, date, time, trainer, experience, message } = req.body;

        // Validation
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid name provided'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        if (!validatePhoneNumber(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number'
            });
        }

        if (!sessionType || !date || !time || !trainer || !experience) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Create booking
        const booking = {
            id: generateBookingId(),
            name,
            email,
            phone,
            sessionType,
            date,
            time,
            trainer,
            experience,
            message,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            paymentStatus: 'pending'
        };

        bookings.push(booking);

        res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: booking
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
});

app.get('/api/bookings', (req, res) => {
    try {
        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

app.get('/api/bookings/:id', (req, res) => {
    try {
        const booking = bookings.find(b => b.id === req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
});

app.put('/api/bookings/:id', (req, res) => {
    try {
        const booking = bookings.find(b => b.id === req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking fields
        Object.assign(booking, req.body);
        booking.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
});

app.delete('/api/bookings/:id', (req, res) => {
    try {
        const index = bookings.findIndex(b => b.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const deletedBooking = bookings.splice(index, 1);

        res.json({
            success: true,
            message: 'Booking deleted successfully',
            data: deletedBooking[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting booking',
            error: error.message
        });
    }
});

// ==================== NEWSLETTER ROUTES ====================
app.post('/api/newsletter/subscribe', (req, res) => {
    try {
        const { email } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        res.json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            email
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error subscribing to newsletter',
            error: error.message
        });
    }
});

// ==================== CONTACT ROUTES ====================
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // In production, send email here
        console.log('Contact form submission:', { name, email, subject, message });

        res.json({
            success: true,
            message: 'Message received. We will get back to you soon!',
            data: { name, email, subject, message, receivedAt: new Date().toISOString() }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing contact form',
            error: error.message
        });
    }
});

// ==================== SEARCH ROUTE ====================
app.get('/api/search', (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const results = {
            sessions: sessions.filter(s => 
                s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.description.toLowerCase().includes(query.toLowerCase())
            ),
            products: products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase())
            ),
            trainers: trainers.filter(t => 
                t.name.toLowerCase().includes(query.toLowerCase()) ||
                t.specialty.toLowerCase().includes(query.toLowerCase())
            )
        };

        res.json({
            success: true,
            data: results,
            query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching',
            error: error.message
        });
    }
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║     🌸 Flow Rise API Server Started    ║
    ║     Server: http://localhost:${PORT}     ║
    ║     Environment: ${process.env.NODE_ENV || 'development'}          ║
    ╚════════════════════════════════════════╝
    `);
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
