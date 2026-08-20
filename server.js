const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('./backend/config/db');

const authRoutes = require('./backend/routes/authRoutes');
const appointmentRoutes = require('./backend/routes/appointmentRoutes');
const trainerRoutes = require('./backend/routes/trainerRoutes');
const planRoutes = require('./backend/routes/planRoutes');
const productRoutes = require('./backend/routes/productRoutes');
const adminRoutes = require('./backend/routes/adminRoutes');
const contactRoutes = require('./backend/routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);

// Stripe publishable keys are intended for browser use. Keeping this value in
// the environment lets test and production deployments use different keys.
app.get('/api/config/stripe-publishable-key', (req, res) => {
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
        return res.status(503).json({ error: 'Stripe is not configured' });
    }
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Stripe Checkout Route
app.post('/api/payment/create-checkout-session', async (req, res) => {
    try {
        const { items, customer_email } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty.' });
        }

        // Never trust a browser-supplied price. Look up every purchasable item
        // in MySQL before creating the Stripe session.
        const line_items = [];
        for (const item of items) {
            const quantity = Math.max(1, Math.min(100, Number.parseInt(item.qty, 10) || 1));
            const productId = Number.parseInt(item.productId, 10);
            const [rows] = Number.isInteger(productId) && productId > 0
                ? await db.execute('SELECT id, name, price, image_url FROM products WHERE id = ?', [productId])
                : await db.execute('SELECT id, name, price, image_url FROM products WHERE name = ? LIMIT 1', [item.name]);
            const product = rows[0];

            if (!product) {
                return res.status(400).json({ error: `Product is no longer available: ${item.name || 'unknown item'}` });
            }

            const imageUrl = product.image_url && product.image_url.startsWith('http') ? [product.image_url] : [];
            line_items.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: product.name,
                        images: imageUrl,
                    },
                    unit_amount: Math.round(Number(product.price) * 100),
                },
                quantity,
            });
        }

        const baseUrl = process.env.APP_URL || req.headers.origin;
        if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
            return res.status(500).json({ error: 'APP_URL is not configured.' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            customer_email: (customer_email && customer_email.includes('@')) ? customer_email : undefined,
            success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/checkout.html`,
        });

        res.json({ id: session.id });
    } catch (err) {
        console.error('Stripe Session Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:page', (req, res) => {
    let page = req.params.page;
    if (!page.endsWith('.html')) {
        page += '.html';
    }
    const filePath = path.join(__dirname, 'public', page);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Page not found');
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({
        success: false,
        message: 'Global server error: ' + err.message
    });
});

// Vercel imports the Express app as a serverless function.  Keep the local
// listener only for `node server.js` development, otherwise Vercel would try
// to bind a port inside the function runtime.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Visit http://localhost:${PORT} to view your website.`);
    });
}

module.exports = app;
