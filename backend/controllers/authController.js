const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const createAuthToken = (user) => jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Login OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h2 style="color: #ccff00; background: #000; padding: 10px;">Personal Trainer Access</h2>
                <p>Your verification code is:</p>
                <h1 style="font-size: 40px; letter-spacing: 5px; color: #000;">${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
};

exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { id: userId, first_name, last_name, email, role: 'user' },
            token: createAuthToken({ id: userId, role: 'user' })
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role },
            token: createAuthToken(user)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: google_id, email, given_name, family_name } = payload;

        let user = await User.findByGoogleId(google_id);

        if (!user) {
            // Check if user exists with same email but no google_id
            user = await User.findByEmail(email);
            if (user) {
                // Update existing user with google_id
                await User.updateGoogleId(user.id, google_id);
                user.google_id = google_id;
            } else {
                // Create new user
                const userId = await User.create({
                    first_name: given_name,
                    last_name: family_name || '',
                    email,
                    google_id,
                    password: null
                });
                user = await User.findById(userId);
            }
        }

        // --- NEW OTP FLOW ---
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

        await User.updateOTP(user.id, otp, expiry);
        await sendOTPEmail(user.email, otp);

        res.json({
            success: true,
            message: 'OTP sent to your email',
            requiresOtp: true,
            userId: user.id
        });
        
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ success: false, message: 'Invalid Google token' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.verifyOTP(userId, otp);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful verification
        await User.clearOTP(userId);

        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role },
            token: createAuthToken(user)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.saveAddress = async (req, res) => {
    try {
        const { addressData } = req.body;
        await User.updateAddress(req.user.id, addressData);
        res.json({ success: true, message: 'Address saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
