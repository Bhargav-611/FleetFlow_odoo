/**
 * Notification Controller
 * Handles email sending endpoints
 */

const emailService = require('../services/email.service');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const { ApiErrorFactory } = require('../utils/apiError');

/**
 * POST /api/notifications/email
 * Send generic email
 */
exports.sendEmail = async (req, res, next) => {
    try {
        const { to, subject, message } = req.body;

        // Validation
        if (!to || !subject || !message) {
            throw ApiErrorFactory.badRequest(
                'to, subject, and message are required'
            );
        }

        // Convert plain text to HTML
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                    .content { background: #f5f5f5; padding: 20px; }
                    .message { background: white; padding: 15px; border-radius: 4px; line-height: 1.6; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>${subject}</h2>
                    </div>
                    <div class="content">
                        <div class="message">
                            ${message.replace(/\n/g, '<br/>')}
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 FleetFlow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const result = await emailService.sendEmail({
            to,
            subject,
            html,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notifications/batch-email
 * Send email to multiple recipients
 */
exports.sendBatchEmail = async (req, res, next) => {
    try {
        const { recipients, subject, message } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            throw ApiErrorFactory.badRequest('recipients must be a non-empty array');
        }

        if (!subject || !message) {
            throw ApiErrorFactory.badRequest('subject and message are required');
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                    .content { background: #f5f5f5; padding: 20px; }
                    .message { background: white; padding: 15px; border-radius: 4px; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>${subject}</h2>
                    </div>
                    <div class="content">
                        <div class="message">
                            ${message.replace(/\n/g, '<br/>')}
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 FleetFlow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const result = await emailService.sendBatch(recipients, {
            subject,
            html,
        });

        res.status(200).json({
            success: true,
            data: {
                totalRecipients: recipients.length,
                successful: result.successful,
                failed: result.failed,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notifications/send-license-alerts
 * Send license expiry alerts to drivers with expiry < 7 days
 */
exports.sendLicenseExpiryAlerts = async (req, res, next) => {
    try {
        // Find drivers with license expiring within 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const drivers = await Driver.find({
            licenseExpiry: {
                $gte: new Date(),
                $lte: sevenDaysFromNow,
            },
            email: { $exists: true, $ne: '' },
        });

        if (drivers.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No drivers with expiring licenses found',
                count: 0,
            });
        }

        // Send emails
        const results = await Promise.allSettled(
            drivers.map(driver => emailService.sendLicenseExpiryAlert(driver))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        res.status(200).json({
            success: true,
            data: {
                totalDrivers: drivers.length,
                emailsSent: successful,
                emailsFailed: failed,
                driversNotified: drivers.map(d => ({
                    id: d._id,
                    name: d.name,
                    expiryDate: d.licenseExpiry,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notifications/send-maintenance-alerts
 * Send maintenance reminders for vehicles with maintenance due < 3 days
 */
exports.sendMaintenanceAlert = async (req, res, next) => {
    try {
        // Find vehicles with maintenance due soon
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const vehicles = await Vehicle.find({
            maintenanceDueDate: {
                $gte: new Date(),
                $lte: threeDaysFromNow,
            },
        });

        if (vehicles.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No vehicles with upcoming maintenance found',
                count: 0,
            });
        }

        // Send emails
        const results = await Promise.allSettled(
            vehicles.map(vehicle =>
                emailService.sendMaintenanceReminder(vehicle)
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        res.status(200).json({
            success: true,
            data: {
                totalVehicles: vehicles.length,
                emailsSent: successful,
                emailsFailed: failed,
                vehiclesNotified: vehicles.map(v => ({
                    id: v._id,
                    name: v.name,
                    licensePlate: v.licensePlate,
                    maintenanceDueDate: v.maintenanceDueDate,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notifications/send-trip-completion/:tripId
 * Send trip completion confirmation email
 */
exports.sendTripCompletionNotification = async (req, res, next) => {
    try {
        const { tripId } = req.params;

        // Fetch trip with relations
        const trip = await Trip.findById(tripId)
            .populate('driver')
            .populate('vehicle');

        if (!trip) {
            throw ApiErrorFactory.notFound('Trip');
        }

        if (trip.status !== 'Completed') {
            throw ApiErrorFactory.badRequest(
                'Trip must be in Completed status to send confirmation'
            );
        }

        if (!trip.driver.email) {
            throw ApiErrorFactory.badRequest('Driver email not found');
        }

        const result = await emailService.sendTripCompletionEmail(
            trip,
            trip.driver,
            trip.vehicle
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/notifications/health
 * Health check for email service
 */
exports.emailServiceHealth = (req, res) => {
    try {
        emailService.validateEnabled();

        res.status(200).json({
            success: true,
            service: 'SendGrid Email Service',
            status: 'operational',
            timestamp: new Date(),
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            service: 'SendGrid Email Service',
            status: 'unavailable',
            reason: error.message,
        });
    }
};
