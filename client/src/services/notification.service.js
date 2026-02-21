/**
 * Notification Service (Frontend)
 * Handles API calls for email notifications
 */

import api from '../lib/api';

/**
 * Send generic email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise<Object>} Sent email data
 */
export const sendEmail = async (to, subject, message) => {
    try {
        const response = await api.post('/notifications/email', {
            to,
            subject,
            message,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Send email to multiple recipients
 * @param {Array<string>} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise<Object>} Batch send result
 */
export const sendBatchEmail = async (recipients, subject, message) => {
    try {
        const response = await api.post('/notifications/batch-email', {
            recipients,
            subject,
            message,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error sending batch email:', error);
        throw error;
    }
};

/**
 * Send license expiry alerts (Manual trigger)
 * @returns {Promise<Object>} Result with number of emails sent
 */
export const sendLicenseExpiryAlerts = async () => {
    try {
        const response = await api.post('/notifications/send-license-alerts');
        return response.data.data;
    } catch (error) {
        console.error('Error sending license expiry alerts:', error);
        throw error;
    }
};

/**
 * Send maintenance alerts (Manual trigger)
 * @returns {Promise<Object>} Result with number of emails sent
 */
export const sendMaintenanceAlerts = async () => {
    try {
        const response = await api.post('/notifications/send-maintenance-alerts');
        return response.data.data;
    } catch (error) {
        console.error('Error sending maintenance alerts:', error);
        throw error;
    }
};

/**
 * Send trip completion notification
 * @param {string} tripId - Trip ID
 * @returns {Promise<Object>} Email send result
 */
export const sendTripCompletionEmail = async (tripId) => {
    try {
        const response = await api.post(
            `/notifications/send-trip-completion/${tripId}`
        );
        return response.data.data;
    } catch (error) {
        console.error('Error sending trip completion email:', error);
        throw error;
    }
};

/**
 * Check if email service is available
 * @returns {Promise<Boolean>} Service availability
 */
export const checkEmailServiceHealth = async () => {
    try {
        const response = await api.get('/notifications/health');
        return response.data.success;
    } catch (error) {
        console.warn('Email service unavailable:', error.message);
        return false;
    }
};

export default {
    sendEmail,
    sendBatchEmail,
    sendLicenseExpiryAlerts,
    sendMaintenanceAlerts,
    sendTripCompletionEmail,
    checkEmailServiceHealth,
};
