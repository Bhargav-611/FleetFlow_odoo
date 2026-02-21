/**
 * Notification Jobs
 * Automated cron tasks for sending scheduled notifications
 */

const cron = require('node-cron');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const emailService = require('../services/email.service');
const config = require('../config/env');

// Track if jobs are initialized
let jobsInitialized = false;

/**
 * Initialize all cron jobs
 */
const initializeJobs = () => {
    if (jobsInitialized || !config.features.emailEnabled) {
        return;
    }

    console.log('📅 Initializing notification jobs...');

    /**
     * JOB 1: Send License Expiry Alerts
     * Runs daily at 09:00 AM
     * Sends alerts to drivers with license expiring within 7 days
     */
    cron.schedule('0 9 * * *', async () => {
        try {
            console.log('\n⏰ Running: License Expiry Alert Job (09:00 AM)');

            // Find drivers with license expiring within 7 days
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

            const expiringDrivers = await Driver.find({
                licenseExpiry: {
                    $gte: new Date(), // Not already expired
                    $lte: sevenDaysFromNow, // Expiring within 7 days
                },
                email: { $exists: true, $ne: '' }, // Has email
            });

            console.log(`Found ${expiringDrivers.length} drivers with expiring licenses`);

            if (expiringDrivers.length === 0) {
                console.log('✅ No drivers with expiring licenses to alert');
                return;
            }

            // Send emails for each driver
            const results = await Promise.allSettled(
                expiringDrivers.map(driver => emailService.sendLicenseExpiryAlert(driver))
            );

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(
                `📧 License Expiry Alerts: ${successful} sent, ${failed} failed`
            );
        } catch (error) {
            console.error('❌ License Expiry Alert Job Failed:', error.message);
        }
    });

    /**
     * JOB 2: Send Maintenance Reminders
     * Runs every Tuesday at 08:00 AM
     * Sends alerts for vehicles with maintenance due within 3 days
     */
    cron.schedule('0 8 * * 2', async () => {
        try {
            console.log('\n⏰ Running: Maintenance Reminder Job (Tuesday 08:00 AM)');

            // Find vehicles with maintenance due within 3 days
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            const vehiclesNeedingMaintenance = await Vehicle.find({
                maintenanceDueDate: {
                    $gte: new Date(),
                    $lte: threeDaysFromNow,
                },
                status: { $ne: 'Retired' }, // Exclude retired vehicles
            });

            console.log(
                `Found ${vehiclesNeedingMaintenance.length} vehicles needing maintenance`
            );

            if (vehiclesNeedingMaintenance.length === 0) {
                console.log('✅ No vehicles with upcoming maintenance');
                return;
            }

            // Send emails for each vehicle
            const results = await Promise.allSettled(
                vehiclesNeedingMaintenance.map(vehicle =>
                    emailService.sendMaintenanceReminder(vehicle)
                )
            );

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(
                `🔧 Maintenance Reminders: ${successful} sent, ${failed} failed`
            );
        } catch (error) {
            console.error('❌ Maintenance Reminder Job Failed:', error.message);
        }
    });

    /**
     * JOB 3: Send Weekly Compliance Report
     * Runs every Monday at 10:00 AM
     * Sends compliance summary to fleet managers
     */
    cron.schedule('0 10 * * 1', async () => {
        try {
            console.log('\n⏰ Running: Weekly Compliance Report Job (Monday 10:00 AM)');

            // Count drivers with issues
            const suspendedDrivers = await Driver.countDocuments({ status: 'Suspended' });
            const expiredLicenses = await Driver.countDocuments({
                licenseExpiry: { $lt: new Date() },
            });

            const lowSafetyScores = await Driver.countDocuments({
                safetyScore: { $lt: 70 },
            });

            const complianceSummary = `
                WEEKLY COMPLIANCE REPORT
                Generated: ${new Date().toLocaleString()}

                Total Issues Found:
                • Suspended Drivers: ${suspendedDrivers}
                • Expired Licenses: ${expiredLicenses}
                • Low Safety Scores (<70): ${lowSafetyScores}

                Action Required:
                Please review the dashboard for detailed information and take necessary action.
            `;

            // Send to managers (TODO: Get manager emails from DB)
            await emailService.sendEmail({
                to: 'manager@fleetflow.com',
                subject: `📊 Weekly Compliance Report - ${new Date().toLocaleDateString()}`,
                html: `<pre>${complianceSummary}</pre>`,
            });

            console.log('📊 Weekly Compliance Report sent');
        } catch (error) {
            console.error(
                '❌ Weekly Compliance Report Job Failed:',
                error.message
            );
        }
    });

    /**
     * JOB 4: Cleanup old cron logs (optional)
     * Runs daily at 11:59 PM
     * Logs can grow large over time
     */
    cron.schedule('59 23 * * *', async () => {
        try {
            console.log('\n⏰ Running: Daily Cleanup Job (23:59)');
            console.log('✅ Cleanup completed');
        } catch (error) {
            console.error('❌ Cleanup Job Failed:', error.message);
        }
    });

    jobsInitialized = true;
    console.log('✅ All notification jobs initialized successfully\n');
};

/**
 * Export for use in main app
 */
module.exports = {
    initializeJobs,
    isInitialized: () => jobsInitialized,
};
