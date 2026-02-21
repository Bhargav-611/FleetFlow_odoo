/**
 * Notification Routes
 * API endpoints for email notifications
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth');

/**
 * POST /api/notifications/email
 * Send generic email
 * Access: Authenticated users (managers preferred)
 */
router.post('/email', protect, notificationController.sendEmail);

/**
 * POST /api/notifications/batch-email
 * Send email to multiple recipients
 * Access: Managers/Dispatchers only
 */
router.post(
    '/batch-email',
    protect,
    authorize('fleet_manager', 'dispatcher'),
    notificationController.sendBatchEmail
);

/**
 * POST /api/notifications/send-license-alerts
 * Send license expiry reminders to drivers with expiry < 7 days
 * Access: Safety Officers and Fleet Managers
 * Can be called manually or via cron job
 */
router.post(
    '/send-license-alerts',
    protect,
    authorize('fleet_manager', 'safety_officer'),
    notificationController.sendLicenseExpiryAlerts
);

/**
 * POST /api/notifications/send-maintenance-alerts
 * Send maintenance reminders for vehicles with maintenance due < 3 days
 * Access: Fleet Managers
 * Can be called manually or via cron job
 */
router.post(
    '/send-maintenance-alerts',
    protect,
    authorize('fleet_manager'),
    notificationController.sendMaintenanceAlert
);

/**
 * POST /api/notifications/send-trip-completion/:tripId
 * Send trip completion confirmation email to driver
 * Access: Managers/Dispatchers who completed the trip
 */
router.post(
    '/send-trip-completion/:tripId',
    protect,
    authorize('fleet_manager', 'dispatcher'),
    notificationController.sendTripCompletionNotification
);

/**
 * GET /api/notifications/health
 * Health check for SendGrid connectivity
 */
router.get('/health', notificationController.emailServiceHealth);

module.exports = router;
