# API Testing Guide - OpenRouteService & SendGrid Integration

## Quick Start Testing

This guide shows how to test each endpoint using cURL or Postman.

---

## 1️⃣ Authentication

First, get a JWT token by logging in:

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@fleetflow.com",
    "password": "password123"
  }'

# Response includes "token"
# Copy the token and use it in Authorization header for all protected routes
```

**In Postman**: Add to Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🗺️ ROUTE API ENDPOINTS

### 1. Calculate Single Route

Calculate distance, duration, and get polyline between two coordinates.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/routes/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "lat": 22.2587,
      "lng": 71.1924
    },
    "destination": {
      "lat": 23.0225,
      "lng": 72.5714
    }
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "distanceInKm": 42.5,
    "durationInMinutes": 45,
    "polyline": [
      { "lat": 22.2587, "lng": 71.1924 },
      { "lat": 22.2890, "lng": 71.5234 },
      { "lat": 22.8975, "lng": 72.2345 },
      { "lat": 23.0225, "lng": 72.5714 }
    ],
    "source": "openroute",
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

**Test Cases:**
- ✅ Valid coordinates
- ❌ Missing origin/destination
- ❌ Invalid coordinate ranges (lat > 90)
- ❌ Missing JWT token

---

### 2. Calculate Batch Routes

Calculate routes from single origin to multiple destinations.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/routes/batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "lat": 22.2587,
      "lng": 71.1924
    },
    "destinations": [
      { "lat": 23.0225, "lng": 72.5714 },
      { "lat": 23.1815, "lng": 72.6309 },
      { "lat": 23.2156, "lng": 72.6369 }
    ]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "origin": { "lat": 22.2587, "lng": 71.1924 },
    "routes": [
      {
        "destination": { "lat": 23.0225, "lng": 72.5714 },
        "distanceInKm": 42.5,
        "durationInMinutes": 45,
        "polyline": [...]
      },
      {
        "destination": { "lat": 23.1815, "lng": 72.6309 },
        "distanceInKm": 48.2,
        "durationInMinutes": 51,
        "polyline": [...]
      },
      {
        "destination": { "lat": 23.2156, "lng": 72.6369 },
        "distanceInKm": 50.1,
        "durationInMinutes": 53,
        "polyline": [...]
      }
    ],
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

---

### 3. Get Distance Matrix

Get distances between all origin-destination pairs (for optimization).

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/routes/distance-matrix \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "lat": 22.2587,
      "lng": 71.1924
    },
    "destinations": [
      { "lat": 23.0225, "lng": 72.5714 },
      { "lat": 23.1815, "lng": 72.6309 }
    ]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "origin": [ 22.2587, 71.1924 ],
    "destinations": [
      [ 23.0225, 72.5714 ],
      [ 23.1815, 72.6309 ]
    ],
    "distances": [ 42500, 48200 ],
    "durations": [ 2700, 3060 ],
    "source": "openroute",
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

---

### 4. Estimate Trip Cost

Calculate fuel + fixed costs for a trip.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/routes/estimate-cost \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "distanceInKm": 100,
    "vehicle": {
      "fuelConsumption": 6,
      "fuelPrice": 100,
      "fixedCostPerKm": 5
    }
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "distanceInKm": 100,
    "fuelCost": 1666.67,
    "fixedCost": 500,
    "totalCost": 2166.67,
    "profitMargin": 20,
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

**Calculation Formula:**
```
fuelCost = (distance / consumption) × price
fixedCost = distance × costPerKm
totalCost = fuelCost + fixedCost
```

---

### 5. Route Service Health

Check if OpenRouteService is available.

**Request:**
```bash
curl http://localhost:5000/api/v1/routes/health
```

**Response (200 OK) - Service Available:**
```json
{
  "success": true,
  "service": "OpenRouteService",
  "status": "operational",
  "configured": true,
  "timestamp": "2024-02-21T10:30:00Z"
}
```

**Response (503) - Service Unavailable:**
```json
{
  "success": false,
  "service": "OpenRouteService",
  "status": "unavailable",
  "configured": false,
  "message": "You must set OPENROUTE_API_KEY environment variable",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

---

## 📧 NOTIFICATION API ENDPOINTS

### 1. Send Generic Email

Send a custom email to any recipient.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/notifications/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "john@example.com",
    "subject": "Trip Assignment",
    "message": "You have been assigned a new trip to Mumbai"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "to": "john@example.com",
    "subject": "Trip Assignment",
    "messageId": "sg-1234567890",
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

---

### 2. Send Batch Email

Send the same email to multiple recipients.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/notifications/batch-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      "driver1@example.com",
      "driver2@example.com",
      "driver3@example.com"
    ],
    "subject": "Fleet Update",
    "message": "Important update: New fuel prices effective tomorrow"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRecipients": 3,
    "emailsSent": 3,
    "emailsFailed": 0,
    "results": [
      { "email": "driver1@example.com", "status": "sent", "messageId": "sg-123" },
      { "email": "driver2@example.com", "status": "sent", "messageId": "sg-124" },
      { "email": "driver3@example.com", "status": "sent", "messageId": "sg-125" }
    ],
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

---

### 3. Send License Expiry Alerts

Trigger alert emails for drivers with expiring licenses (within 7 days).

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/notifications/send-license-alerts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalDrivers": 3,
    "emailsSent": 3,
    "emailsFailed": 0,
    "driversNotified": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "licenseExpiry": "2024-02-28",
        "daysRemaining": 7,
        "status": "sent"
      },
      {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "licenseExpiry": "2024-03-01",
        "daysRemaining": 8,
        "status": "sent"
      }
    ],
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

**Query Used:**
- Finds drivers with `licenseExpiry` between today and +7 days
- Sends red alert email template
- Updates driver record with email sent timestamp

---

### 4. Send Maintenance Alerts

Trigger alert emails for vehicles with upcoming maintenance (within 3 days).

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/notifications/send-maintenance-alerts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalVehicles": 2,
    "emailsSent": 2,
    "emailsFailed": 0,
    "vehiclesNotified": [
      {
        "name": "Truck-001",
        "plate": "GJ01AB1234",
        "email": "manager@fleetflow.com",
        "maintenanceType": "Oil Change",
        "maintenanceDueDate": "2024-02-23",
        "daysRemaining": 2,
        "status": "sent"
      },
      {
        "name": "Van-005",
        "plate": "GJ02CD5678",
        "email": "manager@fleetflow.com",
        "maintenanceType": "Tire Rotation",
        "maintenanceDueDate": "2024-02-25",
        "daysRemaining": 4,
        "status": "sent"
      }
    ],
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

---

### 5. Send Trip Completion Notification

Trigger email for a specific completed trip.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/notifications/send-trip-completion/TRIP_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/notifications/send-trip-completion/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tripId": "507f1f77bcf86cd799439011",
    "driver": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "vehicle": {
      "name": "Truck-001",
      "plate": "GJ01AB1234"
    },
    "trip": {
      "origin": "Ahmedabad",
      "destination": "Vadodara",
      "distance": 42.5,
      "duration": 45,
      "totalCost": 500
    },
    "emailSent": true,
    "messageId": "sg-1234567890",
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

---

### 6. Email Service Health

Check if SendGrid is available.

**Request:**
```bash
curl http://localhost:5000/api/v1/notifications/health
```

**Response (200 OK) - Service Available:**
```json
{
  "success": true,
  "service": "SendGrid",
  "status": "operational",
  "configured": true,
  "timestamp": "2024-02-21T10:30:00Z"
}
```

**Response (503) - Service Unavailable:**
```json
{
  "success": false,
  "service": "SendGrid",
  "status": "unavailable",
  "configured": false,
  "message": "You must set SENDGRID_API_KEY environment variable",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

---

## ⚠️ ERROR RESPONSES

### Common Error Scenarios

**1. Missing Authentication Token (401)**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required",
  "details": "No token provided",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

**2. Invalid Coordinates (400)**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid coordinates",
  "details": "Latitude must be between -90 and 90",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

**3. OpenRouteService Error (502)**
```json
{
  "success": false,
  "statusCode": 502,
  "message": "External API Error",
  "details": "OpenRouteService returned: 401 Unauthorized",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

**4. SendGrid Error (502)**
```json
{
  "success": false,
  "statusCode": 502,
  "message": "Email service error",
  "details": "SendGrid returned: 403 Forbidden",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

**5. Rate Limited (429)**
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "details": "Free tier: 2,500 requests/day. Current: 2,501/2,500",
  "timestamp": "2024-02-21T10:30:00Z"
}
```

---

## 🧪 Postman Collection Import

**Option 1: Copy JSON**

Save as `FleetFlow_API.postman_collection.json`:

```json
{
  "info": {
    "name": "FleetFlow Route & Notification API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/v1/auth/login",
            "body": {
              "raw": "{\"email\": \"manager@fleetflow.com\", \"password\": \"password123\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Routes",
      "item": [
        {
          "name": "Calculate Route",
          "request": {
            "method": "POST",
            "header": {
              "Authorization": "Bearer {{token}}"
            },
            "url": "http://localhost:5000/api/v1/routes/calculate",
            "body": {
              "raw": "{\"origin\": {\"lat\": 22.2587, \"lng\": 71.1924}, \"destination\": {\"lat\": 23.0225, \"lng\": 72.5714}}"
            }
          }
        },
        {
          "name": "Route Health",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/v1/routes/health"
          }
        }
      ]
    },
    {
      "name": "Notifications",
      "item": [
        {
          "name": "Send Email",
          "request": {
            "method": "POST",
            "header": {
              "Authorization": "Bearer {{token}}"
            },
            "url": "http://localhost:5000/api/v1/notifications/email",
            "body": {
              "raw": "{\"to\": \"test@example.com\", \"subject\": \"Test\", \"message\": \"Test message\"}"
            }
          }
        },
        {
          "name": "Email Health",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/v1/notifications/health"
          }
        }
      ]
    }
  ]
}
```

**Option 2: Import from URL**

1. Open Postman
2. Click "File" → "Import"
3. Paste the JSON above
4. Click "Import"

---

## 📊 Test Checklist

- [ ] Route calculation returns valid distance/duration
- [ ] Email sending succeeds with SendGrid
- [ ] Batch email sends to multiple recipients
- [ ] License alerts trigger for expiring licenses
- [ ] Maintenance alerts trigger for due maintenance
- [ ] Trip completion email sent automatically
- [ ] Health checks return correct status
- [ ] Error handling works for invalid inputs
- [ ] Rate limits respected
- [ ] Authentication required on protected routes

---

## 🐛 Debugging

### Enable Verbose Logging

```bash
# Set NODE_ENV to development for detailed logs
export NODE_ENV=development

# Start server with logging
npm start

# Watch for:
# ✅ "Route calculated successfully"
# ✅ "Email sent to: ..."
# ⚠️ API key missing warnings
# ❌ CORS or authentication errors
```

### Test with Sample Data

```bash
# 1. Make sure database has sample data
npm run seed

# 2. Test route between known cities
curl -X POST http://localhost:5000/api/v1/routes/calculate \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "origin": {"lat": 28.6139, "lng": 77.2090},
    "destination": {"lat": 19.0760, "lng": 72.8777}
  }'
```

---

Last Updated: February 21, 2026
