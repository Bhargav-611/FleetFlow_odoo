/**
 * Environment Configuration with Validation
 * Ensures all required environment variables are present
 */

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'PORT',
    'NODE_ENV',
    'CORS_ORIGIN'
];

// Optional but recommended for full features
const optionalEnvVars = [
    'OPENROUTE_API_KEY',
    'SENDGRID_API_KEY',
    'EMAIL_FROM'
];

// Validate required variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    throw new Error(
        `❌ Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please add these to your .env file`
    );
}

// Warn about optional variables
const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
if (missingOptional.length > 0) {
    console.warn(
        `⚠️  Missing optional environment variables: ${missingOptional.join(', ')}\n` +
        `Some features (maps, email) may not work without these. Add them to .env for full functionality.`
    );
}

// Export configuration object
module.exports = {
    // Database
    mongodb: {
        uri: process.env.MONGODB_URI,
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expire: process.env.JWT_EXPIRE || '7d',
    },

    // Server
    server: {
        port: process.env.PORT || 5000,
        env: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },

    // OpenRouteService (Maps & Routing)
    openroute: {
        apiKey: process.env.OPENROUTE_API_KEY,
        baseUrl: 'https://api.openrouteservice.org/v2',
        enabled: !!process.env.OPENROUTE_API_KEY,
    },

    // SendGrid (Email)
    sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.EMAIL_FROM || 'noreply@fleetflow.com',
        enabled: !!process.env.SENDGRID_API_KEY,
    },

    // Feature flags
    features: {
        mapsEnabled: !!process.env.OPENROUTE_API_KEY,
        emailEnabled: !!process.env.SENDGRID_API_KEY,
    },

    // Utility
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
