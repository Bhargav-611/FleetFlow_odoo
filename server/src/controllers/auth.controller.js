const User = require('../models/User');
const Driver = require('../models/Driver');

// @desc    Register user
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await User.create({ name, email, password, role });
        
        // If registering as a driver, create a Driver record
        if (role === 'driver') {
            await Driver.create({
                name: user.name,
                email: user.email,
                userId: user._id,
                status: 'On Duty'
            });
        }
        
        const token = user.getSignedJwtToken();
        res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = user.getSignedJwtToken();
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current user
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Forgot password (simplified — returns reset token inline for demo)
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user with that email' });
        }
        // In production, send email with reset link
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: 'Password reset token generated', resetToken });
    } catch (err) {
        next(err);
    }
};

// @desc    Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        const crypto = require('crypto');
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = user.getSignedJwtToken();
        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
};
