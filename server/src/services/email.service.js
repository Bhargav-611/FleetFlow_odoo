/**
 * SendGrid Email Service
 * Handles email sending and templating
 */

const sgMail = require('@sendgrid/mail');
const config = require('../config/env');
const { ApiErrorFactory } = require('../utils/apiError');

class EmailService {
    constructor() {
        this.enabled = config.sendgrid.enabled;
        this.fromEmail = config.sendgrid.fromEmail;

        if (this.enabled) {
            sgMail.setApiKey(config.sendgrid.apiKey);
        }
    }

    /**
     * Validate if EmailService is enabled
     * @throws {ApiError} if SendGrid is not configured
     */
    validateEnabled() {
        if (!this.enabled) {
            throw ApiErrorFactory.serviceUnavailable('SendGrid (Email Service)');
        }
    }

    /**
     * Send generic email
     * @param {Object} options - { to, subject, html, text, cc, bcc }
     * @throws {ApiError} on failure
     */
    async sendEmail({ to, subject, html, text = '', cc = [], bcc = [] }) {
        try {
            this.validateEnabled();

            if (!to || !subject) {
                throw ApiErrorFactory.badRequest(
                    'Email requires "to" and "subject" fields'
                );
            }

            const msg = {
                to,
                from: this.fromEmail,
                subject,
                html: html || text,
                text,
                cc: cc.length > 0 ? cc : undefined,
                bcc: bcc.length > 0 ? bcc : undefined,
            };

            const result = await sgMail.send(msg);

            console.log(`✅ Email sent to ${to}: ${subject}`);

            return {
                success: true,
                to,
                subject,
                timestamp: new Date(),
                messageId: result[0].headers['x-message-id'],
            };
        } catch (error) {
            console.error(`❌ Email send failed:`, error.message);

            throw ApiErrorFactory.externalApiError(
                'SendGrid',
                error.response?.status || 500,
                error.message
            );
        }
    }

    /**
     * Send email to multiple recipients
     * @param {Array<string>} recipients - Array of email addresses
     * @param {Object} emailData - { subject, html }
     */
    async sendBatch(recipients, emailData) {
        try {
            this.validateEnabled();

            const results = await Promise.allSettled(
                recipients.map(to => this.sendEmail({ ...emailData, to }))
            );

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(
                `📧 Batch email sent: ${successful} successful, ${failed} failed`
            );

            return {
                successful,
                failed,
                results,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * EMAIL TEMPLATE: License Expiry Reminder
     */
    licenseExpiryTemplate(driverName, licenseNumber, expiryDate, daysRemaining) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                    .content { background: #f5f5f5; padding: 20px; }
                    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
                    .button { background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>⚠️ License Expiry Alert</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${driverName},</p>
                        <div class="alert">
                            <strong>Your driver's license is expiring soon!</strong>
                            <br/><br/>
                            <strong>License Number:</strong> ${licenseNumber}
                            <br/>
                            <strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}
                            <br/>
                            <strong>Days Remaining:</strong> <span style="color: #d32f2f; font-weight: bold;">${daysRemaining} days</span>
                        </div>
                        <p>Please renew your license before it expires to avoid disruptions in your ability to drive.</p>
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="https://fleetflow.example.com/drivers/profile" class="button">Update License Details</a>
                        </p>
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                            Please contact your fleet manager if you have any questions.
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 FleetFlow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Send license expiry reminder
     */
    async sendLicenseExpiryAlert(driver) {
        try {
            const expiryDate = new Date(driver.licenseExpiry);
            const today = new Date();
            const daysRemaining = Math.ceil(
                (expiryDate - today) / (1000 * 60 * 60 * 24)
            );

            const html = this.licenseExpiryTemplate(
                driver.name,
                driver.licenseNumber,
                driver.licenseExpiry,
                daysRemaining
            );

            return await this.sendEmail({
                to: driver.email,
                subject: `⚠️ Driver License Expiring in ${daysRemaining} Days`,
                html,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * EMAIL TEMPLATE: Maintenance Reminder
     */
    maintenanceReminderTemplate(vehicleName, licensePlate, dueDate, maintenanceType) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                    .content { background: #f5f5f5; padding: 20px; }
                    .alert { background: #fff8e1; border-left: 4px solid #ff9800; padding: 15px; margin: 15px 0; }
                    .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🔧 Maintenance Due Reminder</h2>
                    </div>
                    <div class="content">
                        <p>Dear Fleet Manager,</p>
                        <div class="alert">
                            <strong>Vehicle maintenance is due soon!</strong>
                            <br/><br/>
                            <strong>Vehicle:</strong> ${vehicleName}
                            <br/>
                            <strong>License Plate:</strong> ${licensePlate}
                            <br/>
                            <strong>Maintenance Type:</strong> ${maintenanceType}
                            <br/>
                            <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}
                        </div>
                        <p>Please schedule maintenance for this vehicle to ensure optimal performance and safety.</p>
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="https://fleetflow.example.com/maintenance" class="button">Schedule Maintenance</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 FleetFlow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Send maintenance reminder
     */
    async sendMaintenanceReminder(vehicle, maintenanceType = 'Scheduled Service') {
        try {
            const managerEmail = 'manager@fleetflow.com'; // TODO: Get from config or DB

            const html = this.maintenanceReminderTemplate(
                vehicle.name,
                vehicle.licensePlate,
                vehicle.maintenanceDueDate,
                maintenanceType
            );

            return await this.sendEmail({
                to: managerEmail,
                subject: `🔧 Maintenance Due: ${vehicle.name} (${vehicle.licensePlate})`,
                html,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * EMAIL TEMPLATE: Trip Completed
     */
    tripCompletedTemplate(tripData, driverName, vehicleName) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                    .content { background: #f5f5f5; padding: 20px; }
                    .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .detail-row:last-child { border-bottom: none; }
                    .label { font-weight: bold; color: #666; }
                    .value { color: #333; }
                    .button { background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>✅ Trip Completed Successfully</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${driverName},</p>
                        <p>Your trip has been completed successfully. Here are the details:</p>
                        
                        <div class="details">
                            <div class="detail-row">
                                <span class="label">Trip ID:</span>
                                <span class="value">${tripData._id}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Vehicle:</span>
                                <span class="value">${vehicleName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Route:</span>
                                <span class="value">${tripData.origin} → ${tripData.destination}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Distance:</span>
                                <span class="value">${tripData.distance} km</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Cargo Weight:</span>
                                <span class="value">${tripData.cargoWeight} kg</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Revenue:</span>
                                <span class="value">₹${tripData.revenue}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Completion Time:</span>
                                <span class="value">${new Date(tripData.completedAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <p style="text-align: center; margin-top: 30px;">
                            <a href="https://fleetflow.example.com/trips/${tripData._id}" class="button">View Trip Details</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 FleetFlow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Send trip completion confirmation
     */
    async sendTripCompletionEmail(trip, driver, vehicle) {
        try {
            const html = this.tripCompletedTemplate(trip, driver.name, vehicle.name);

            return await this.sendEmail({
                to: driver.email,
                subject: `✅ Trip #${trip._id} Completed - ${trip.origin} to ${trip.destination}`,
                html,
                cc: ['manager@fleetflow.com'], // TODO: Make configurable
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * EMAIL TEMPLATE: Trip Cancelled
     */
    tripCancelledTemplate(tripData, reason = 'Not specified') {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                    .content { background: #f5f5f5; padding: 20px; }
                    .alert { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
                    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>❌ Trip Cancelled</h2>
                    </div>
                    <div class="content">
                        <p>Trip has been cancelled:</p>
                        <div class="alert">
                            <strong>Trip ID:</strong> ${tripData._id}
                            <br/>
                            <strong>Route:</strong> ${tripData.origin} → ${tripData.destination}
                            <br/>
                            <strong>Reason:</strong> ${reason}
                            <br/>
                            <strong>Cancelled At:</strong> ${new Date().toLocaleString()}
                        </div>
                        <p>Please contact your fleet manager for further instructions.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 FleetFlow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Send trip cancellation notification
     */
    async sendTripCancellationEmail(trip, driver, reason = 'Not specified') {
        try {
            const html = this.tripCancelledTemplate(trip, reason);

            return await this.sendEmail({
                to: driver.email,
                subject: `❌ Trip #${trip._id} Cancelled`,
                html,
            });
        } catch (error) {
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new EmailService();
