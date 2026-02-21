# 🗺️ OpenRouteService & SendGrid Integration Guide

## Overview

FleetFlow has been enhanced with two powerful external integrations:

- **OpenRouteService**: Real-time route calculation, distance, ETA, and polylines
- **SendGrid**: Automated email notifications for drivers and managers

This guide explains how to set up, configure, and use these integrations.

---

## 📦 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [API Key Setup](#api-key-setup)
4. [Configuration](#configuration)
5. [OpenRouteService Integration](#openrouteservice-integration)
6. [SendGrid Integration](#sendgrid-integration)
7. [Auto Email Triggers](#auto-email-triggers)
8. [Frontend Usage](#frontend-usage)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ FleetFlow backend running (Node.js 18+)  
✅ MongoDB connected  
✅ npm/yarn package manager  

### External Accounts Required

You'll need to create accounts and get API keys for:

1. **OpenRouteService** - https://openrouteservice.org/register/
2. **SendGrid** - https://sendgrid.com/

---

## Installation

### Step 1: Install Dependencies

```bash
cd server
npm install
```

The new packages are already added to `package.json`:
- `axios` - HTTP requests
- `@sendgrid/mail` - Email sending
- `node-cron` - Scheduled jobs

### Step 2: Verify Files

Check that these new files exist:

```bash
# Backend services
src/config/env.js
src/services/map.service.js
src/services/email.service.js

# Backend controllers
src/controllers/route.controller.js
src/controllers/notification.controller.js

# Backend routes
src/routes/route.routes.js
src/routes/notification.routes.js

# Backend jobs
src/jobs/notification.job.js

# Frontend services
client/src/services/route.service.js
client/src/services/notification.service.js
```

---

## API Key Setup

### 1. OpenRouteService Setup

1. Go to https://openrouteservice.org/register/
2. Create free account
3. Verify email
4. Go to Dashboard → API Keys
5. Copy your API key
6. Add to `.env`:
   ```env
   OPENROUTE_API_KEY=your_actual_api_key_here
   ```

**Free Tier Limits**:
- 40 requests/minute
- 2,500 requests/day
- Perfect for development and testing

### 2. SendGrid Setup

1. Go to https://sendgrid.com/
2. Create free account
3. Go to Settings → API Keys
4. Create new API key
5. Copy the key (only visible once!)
6. Add to `.env`:
   ```env
   SENDGRID_API_KEY=your_actual_api_key_here
   EMAIL_FROM=your-email@yourdomain.com
   ```

**Free Tier Limits**:
- 100 emails/day
- Perfect for development

---

## Configuration

### Update .env File

```env
# Server
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fleetflow
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# OpenRouteService (Required for route features)
OPENROUTE_API_KEY=your_key_here

# SendGrid (Required for email features)
SENDGRID_API_KEY=your_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Validation

The `config/env.js` validates all required variables on startup:

```javascript
// Required:
MONGODB_URI, JWT_SECRET, JWT_EXPIRE, PORT, NODE_ENV, CORS_ORIGIN

// Optional (but recommended):
OPENROUTE_API_KEY, SENDGRID_API_KEY, EMAIL_FROM
```

If optional variables are missing, you'll see a warning but the server will still start (with those features disabled).

---

## OpenRouteService Integration

### Architecture

```
┌─────────────────────────────────────────┐
│ Frontend (React)                        │
│ - Trip creation form                    │
│ - Route preview                         │
│ - Cost estimation                       │
└────────────────────┬────────────────────┘
                     │ calculateRoute()
                     ▼
┌─────────────────────────────────────────┐
│ Backend Routes                          │
│ POST /routes/calculate                  │
│ POST /routes/batch                      │
│ POST /routes/distance-matrix            │
│ POST /routes/estimate-cost              │
└────────────────────┬────────────────────┘
                     │
┌─────────────────────▼────────────────────┐
│ Map Service                             │
│ validates coordinates                   │
│ formats request for OpenRouteService    │
│ transforms response                     │
└────────────────────┬────────────────────┘
                     │ HTTPS
                     ▼
      ┌──────────────────────────┐
      │ OpenRouteService API     │
      │ v2/directions/driving-car│
      └──────────────────────────┘
```

### Usage Examples

#### 1. Calculate Single Route

**Frontend:**
```javascript
import { calculateRoute } from '@/services/route.service';

// In component
const handleCalculateRoute = async () => {
    try {
        const route = await calculateRoute(
            { lat: 22.2587, lng: 71.1924 }, // Ahmedabad
            { lat: 23.0225, lng: 72.5714 }  // Vadodara
        );
        
        console.log(`Distance: ${route.distanceInKm} km`);
        console.log(`Duration: ${route.durationInMinutes} minutes`);
        console.log(`Polyline:`, route.polyline);
    } catch (error) {
        console.error('Route calculation failed:', error);
    }
};
```

**Backend API:**
```bash
POST /api/v1/routes/calculate

Request:
{
  "origin": { "lat": 22.2587, "lng": 71.1924 },
  "destination": { "lat": 23.0225, "lng": 72.5714 }
}

Response:
{
  "success": true,
  "data": {
    "distanceInKm": 42.5,
    "durationInMinutes": 45,
    "polyline": [
      { "lat": 22.2587, "lng": 71.1924 },
      { "lat": 22.2890, "lng": 71.5234 },
      ...
    ],
    "source": "openroute",
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

#### 2. Estimate Trip Cost

```javascript
import { estimateTripCost } from '@/services/route.service';

const costBreakdown = await estimateTripCost(42.5, {
    fuelConsumption: 6, // km per liter
    fuelPrice: 100, // per liter
    fixedCostPerKm: 5 // driver, insurance, etc.
});

// Response:
// {
//   distanceInKm: 42.5,
//   fuelCost: 708.33,
//   fixedCost: 212.5,
//   totalCost: 920.83,
//   profitMargin: 20
// }
```

#### 3. Integration with Trip Creation

```javascript
// In TripsPage.jsx
const handleTripCreation = async (formData) => {
    try {
        // 1. Calculate route
        const route = await calculateRoute(
            formData.originCoords,
            formData.destinationCoords
        );
        
        // 2. Estimate cost
        const costBreakdown = await estimateTripCost(
            route.distanceInKm,
            vehicle.specs
        );
        
        // 3. Create trip with route data
        const tripResponse = await api.post('/trips', {
            ...formData,
            distance: route.distanceInKm,
            duration: route.durationInMinutes,
            routePolyline: route.polyline,
            estimatedDurationMinutes: route.durationInMinutes,
            estimatedFuelCost: costBreakdown.fuelCost,
            estimatedFixedCost: costBreakdown.fixedCost,
            estimatedTotalCost: costBreakdown.totalCost,
        });
        
        // 4. Display cost summary
        showToast(`Trip created! Est. cost: ₹${costBreakdown.totalCost}`);
    } catch (error) {
        showErrorToast(error.message);
    }
};
```

---

## SendGrid Integration

### Architecture

```
┌────────────────────────────────────┐
│ Automatic Triggers                 │
│ - Trip completed                   │
│ - License expiry (7 days)          │
│ - Maintenance due (3 days)         │
└────────────────┬───────────────────┘
                 │
┌────────────────▼───────────────────┐
│ Cron Jobs (node-cron)              │
│ Runs daily at scheduled times      │
└────────────────┬───────────────────┘
                 │
┌────────────────▼───────────────────┐
│ Email Service                      │
│ Validates email addresses          │
│ Generates HTML templates           │
│ Handles rate limiting              │
└────────────────┬───────────────────┘
                 │ HTTPS
                 ▼
    ┌─────────────────────────┐
    │ SendGrid API            │
    │ v3/mail/send            │
    └─────────────────────────┘
```

### Email Templates

The system includes pre-built HTML templates:

#### 1. License Expiry Alert
```
Subject: ⚠️ Driver License Expiring in X Days
Recipients: Driver email

Content:
- License number
- Expiry date
- Days remaining (highlighted in red)
- Link to update profile
```

#### 2. Maintenance Reminder
```
Subject: 🔧 Maintenance Due: Vehicle Name
Recipients: Fleet manager email

Content:
- Vehicle name & license plate
- Maintenance type
- Due date
- Link to schedule maintenance
```

#### 3. Trip Completion Confirmation
```
Subject: ✅ Trip #ID Completed
Recipients: Driver email
CC: Fleet manager

Content:
- Trip ID
- Vehicle & driver details
- Route details
- Distance traveled
- Cargo weight
- Revenue
- Link to view full details
```

### Usage Examples

#### 1. Manual Email Sending

```javascript
import { sendEmail } from '@/services/notification.service';

await sendEmail(
    'john@example.com',
    'Welcome to FleetFlow',
    'Hello John,\n\nWelcome to our fleet management system!'
);
```

#### 2. Batch Email to Multiple Users

```javascript
import { sendBatchEmail } from '@/services/notification.service';

await sendBatchEmail(
    ['driver1@example.com', 'driver2@example.com'],
    'Fleet Update',
    'Important update about your fleet...'
);
```

#### 3. Trigger License Alerts (Manual)

```javascript
import { sendLicenseExpiryAlerts } from '@/services/notification.service';

const result = await sendLicenseExpiryAlerts();
// {
//   totalDrivers: 3,
//   emailsSent: 3,
//   emailsFailed: 0,
//   driversNotified: [...]
// }
```

---

## Auto Email Triggers

### Automatic Cron Jobs

The system runs these jobs automatically. No manual trigger needed!

#### Job 1: License Expiry Alerts
- **Schedule**: Daily at 9:00 AM
- **Trigger**: License expiring within 7 days
- **Recipients**: Affected drivers
- **Template**: License Expiry Alert

```javascript
// In notification.job.js
cron.schedule('0 9 * * *', async () => {
    // Find drivers with license expiring within 7 days
    // Send alert emails
    // Log results
});
```

#### Job 2: Maintenance Reminders
- **Schedule**: Every Tuesday at 8:00 AM
- **Trigger**: Maintenance due within 3 days
- **Recipients**: Fleet manager
- **Template**: Maintenance Reminder

```javascript
cron.schedule('0 8 * * 2', async () => {
    // Find vehicles needing maintenance
    // Send reminder emails
    // Log results
});
```

#### Job 3: Weekly Compliance Report
- **Schedule**: Every Monday at 10:00 AM
- **Recipients**: Fleet manager
- **Content**: Summary of suspended drivers, expired licenses, low safety scores

#### Job 4: Trip Completion Email
- **Trigger**: When trip status changes to "Completed"
- **When**: Automatically when trip is marked complete
- **Recipients**: Driver, Fleet manager (CC)
- **Template**: Trip Completion Confirmation

---

## Frontend Usage

### 1. Trip Creation with Route Calculation

**File**: `client/src/pages/TripsPage.jsx`

```javascript
import { calculateRoute, estimateTripCost } from '@/services/route.service';

export default function TripsPage() {
    const handleCreateTrip = async (formData) => {
        try {
            // Calculate route
            const route = await calculateRoute(
                { lat: originLat, lng: originLng },
                { lat: destLat, lng: destLng }
            );
            
            // Show distance & ETA
            console.log(`Distance: ${route.distanceInKm} km`);
            console.log(`ETA: ${route.durationInMinutes} minutes`);
            
            // Estimate cost
            const cost = await estimateTripCost(
                route.distanceInKm,
                vehicleSpecs
            );
            
            // Create trip with route data
            const response = await api.post('/trips', {
                ...formData,
                distance: route.distanceInKm,
                estimatedTotalCost: cost.totalCost,
            });
            
            toast.success('Trip created successfully!');
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
    };
    
    return (
        // Form that calls handleCreateTrip
    );
}
```

### 2. Display Route on Map

```javascript
import { calculateRoute } from '@/services/route.service';

const RoutePreview = ({ origin, destination }) => {
    const [route, setRoute] = useState(null);
    
    useEffect(async () => {
        if (origin && destination) {
            const routeData = await calculateRoute(origin, destination);
            setRoute(routeData);
            // Display polyline on map
        }
    }, [origin, destination]);
    
    return (
        <div>
            <p>Distance: {route?.distanceInKm} km</p>
            <p>Duration: {route?.durationInMinutes} min</p>
            {/* Display map with polyline */}
        </div>
    );
};
```

### 3. Manual Notification Triggers (Admin Panel)

```javascript
import {
    sendLicenseExpiryAlerts,
    sendMaintenanceAlerts,
} from '@/services/notification.service';

export default function AdminPanel() {
    const handleSendLicenseAlerts = async () => {
        try {
            const result = await sendLicenseExpiryAlerts();
            toast.success(`Sent ${result.emailsSent} license alerts`);
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const handleSendMaintenanceAlerts = async () => {
        try {
            const result = await sendMaintenanceAlerts();
            toast.success(`Sent ${result.emailsSent} maintenance alerts`);
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    return (
        <div>
            <Button onClick={handleSendLicenseAlerts}>
                Send License Expiry Alerts
            </Button>
            <Button onClick={handleSendMaintenanceAlerts}>
                Send Maintenance Reminders
            </Button>
        </div>
    );
}
```

---

## Testing

### 1. Test Route Calculation

```bash
curl -X POST http://localhost:5000/api/v1/routes/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": { "lat": 22.2587, "lng": 71.1924 },
    "destination": { "lat": 23.0225, "lng": 72.5714 }
  }'

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "distanceInKm": 42.5,
    "durationInMinutes": 45,
    "polyline": [...],
    "source": "openroute"
  }
}
```

### 2. Test Email Sending

```bash
curl -X POST http://localhost:5000/api/v1/notifications/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test message"
  }'

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "success": true,
    "to": "test@example.com",
    "subject": "Test Email",
    "messageId": "xxx"
  }
}
```

### 3. Test License Expiry Alerts

```bash
curl -X POST http://localhost:5000/api/v1/notifications/send-license-alerts \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Response:
{
  "success": true,
  "data": {
    "totalDrivers": 3,
    "emailsSent": 3,
    "emailsFailed": 0,
    "driversNotified": [...]
  }
}
```

### 4. Check Service Health

```bash
# Check Route Service
curl http://localhost:5000/api/v1/routes/health

# Check Email Service
curl http://localhost:5000/api/v1/notifications/health

# Response:
{
  "success": true,
  "service": "OpenRouteService",
  "status": "operational",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

---

## Troubleshooting

### Issue: "OpenRouteService is currently unavailable"

**Cause**: API key not set or invalid

**Solution**:
```bash
# 1. Check .env file
cat server/.env | grep OPENROUTE

# 2. Verify API key at openrouteservice.org

# 3. Restart server
npm start
```

### Issue: "SendGrid Email Service is currently unavailable"

**Cause**: API key not set or invalid

**Solution**:
```bash
# 1. Check .env file
cat server/.env | grep SENDGRID

# 2. Verify API key at sendgrid.com

# 3. Restart server
npm start
```

### Issue: Invalid coordinates error

**Cause**: Latitude/longitude out of range

**Solution**:
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Verify coordinates are in `{ lat: number, lng: number }` format

```javascript
// ❌ Wrong
{ lat: "22.2587", lng: "71.1924" } // strings instead of numbers

// ✅ Correct
{ lat: 22.2587, lng: 71.1924 }
```

### Issue: Email not received

**Cause**: Sender email mismatch or spam folder

**Solution**:
```bash
# 1. Use email verified in SendGrid
# 2. Add to email whitelist
# 3. Check spam folder
# 4. Verify EMAIL_FROM in .env matches SendGrid verified sender
```

### Issue: Cron jobs not running

**Check logs**:
```bash
pm2 logs fleetflow-api

# Should show on startup:
# ✅ All notification jobs initialized successfully
```

The jobs run at:
- **9:00 AM**: License expiry checks
- **8:00 AM Tuesday**: Maintenance reminders
- **10:00 AM Monday**: Compliance reports

### Issue: Rate limit exceeded

**OpenRouteService**:
- Free tier: 2,500 requests/day
- If exceeded, wait until next day

**SendGrid**:
- Free tier: 100 emails/day
- If exceeded, upgrade plan or wait until next day

---

## Cost Calculation Logic

The `estimateTripCost()` function calculates:

```javascript
fuelCost = (distance / fuelConsumption) × fuelPrice
fixedCost = distance × fixedCostPerKm
totalCost = fuelCost + fixedCost
```

**Example**:
- Distance: 100 km
- Fuel consumption: 5 km/liter
- Fuel price: 100 per liter
- Fixed cost: 5 per km

```
fuelCost = (100 / 5) × 100 = 2000
fixedCost = 100 × 5 = 500
totalCost = 2500
```

---

## Production Deployment

### Before Going Live

1. ✅ Get production API keys
2. ✅ Update .env with production keys
3. ✅ Test all email templates
4. ✅ Verify cron job intervals
5. ✅ Set up error monitoring
6. ✅ Configure email backup (2FA recovery)
7. ✅ Test rate limits

### Environment Variables

```bash
# Production .env
OPENROUTE_API_KEY=prod_key_xxx
SENDGRID_API_KEY=prod_key_xxx
EMAIL_FROM=noreply@yourdomain.com
NODE_ENV=production
```

### Monitoring

```javascript
// Add logging to track:
- Route calculation requests
- Email sending failures
- Cron job execution
- API response times
```

---

## Quick Reference

### Important Files

| File | Purpose |
|------|---------|
| `config/env.js` | Environment validation |
| `services/map.service.js` | OpenRouteService wrapper |
| `services/email.service.js` | SendGrid wrapper |
| `controllers/route.controller.js` | Route endpoints |
| `controllers/notification.controller.js` | Email endpoints |
| `jobs/notification.job.js` | Cron jobs |
| `client/src/services/route.service.js` | Frontend route API |
| `client/src/services/notification.service.js` | Frontend email API |

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/routes/calculate` | Calculate single route |
| POST | `/routes/batch` | Calculate multiple routes |
| POST | `/routes/estimate-cost` | Estimate trip cost |
| GET | `/routes/health` | Check route service |
| POST | `/notifications/email` | Send single email |
| POST | `/notifications/batch-email` | Send multiple emails |
| POST | `/notifications/send-license-alerts` | Trigger license alerts |
| POST | `/notifications/send-maintenance-alerts` | Trigger maintenance alerts |
| GET | `/notifications/health` | Check email service |

---

## Next Steps

1. ✅ Add Google Maps integration for polyline visualization
2. ✅ Implement vehicle GPS tracking
3. ✅ Create advanced route optimization (TSP)
4. ✅ Add SMS notifications
5. ✅ Build analytics dashboard for email metrics

---

Last Updated: February 21, 2026
