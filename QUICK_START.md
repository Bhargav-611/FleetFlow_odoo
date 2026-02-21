# 🚀 Quick Start Checklist & Troubleshooting

Complete this checklist to get the integrated system up and running.

---

## ✅ Installation Checklist

### Step 1: Environment Setup

- [ ] Verify Node.js version (18+)
  ```bash
  node --version  # Should be v18.0.0 or higher
  ```

- [ ] Navigate to server directory
  ```bash
  cd server
  ```

- [ ] Install dependencies
  ```bash
  npm install
  ```

### Step 2: API Keys Configuration

- [ ] Create OpenRouteService account
  - Go to: https://openrouteservice.org/register/
  - Sign up with email
  - Verify email address
  - Copy API key from dashboard

- [ ] Create SendGrid account
  - Go to: https://sendgrid.com/
  - Sign up with email
  - Verify email address
  - Create API key from Settings → API Keys
  - Note: Only visible once!

### Step 3: Environment Variables

- [ ] Update `server/.env` file
  ```env
  # Add these lines:
  OPENROUTE_API_KEY=your_actual_key_from_openrouteservice
  SENDGRID_API_KEY=your_actual_key_from_sendgrid
  EMAIL_FROM=your-verified-email@yourcompany.com
  ```

- [ ] Verify all required variables are set
  ```bash
  cat .env | grep -E "MONGO|JWT|PORT|OPENROUTE|SENDGRID"
  ```

### Step 4: Database

- [ ] Ensure MongoDB is running
  ```bash
  mongod  # or check if service is running
  ```

- [ ] Verify connection string in .env
  ```env
  MONGODB_URI=mongodb://127.0.0.1:27017/fleetflow
  ```

### Step 5: Start Server

- [ ] Start the development server
  ```bash
  npm start
  ```

- [ ] Verify output shows these messages:
  ```
  ✅ Connected to MongoDB
  ✅ FleetFlow server running on port 5000
  ✅ All notification jobs initialized successfully
  ```

---

## 🧪 Verification Tests

Run these tests to confirm everything is working:

### Test 1: Route Service Health

```bash
curl http://localhost:5000/api/v1/routes/health

# Expected response:
# {
#   "success": true,
#   "service": "OpenRouteService",
#   "status": "operational",
#   "configured": true
# }
```

- [ ] Returns 200 OK
- [ ] Status shows "operational"
- [ ] Configured is true

### Test 2: Email Service Health

```bash
curl http://localhost:5000/api/v1/notifications/health

# Expected response:
# {
#   "success": true,
#   "service": "SendGrid",
#   "status": "operational",
#   "configured": true
# }
```

- [ ] Returns 200 OK
- [ ] Status shows "operational"
- [ ] Configured is true

### Test 3: Authentication

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@fleetflow.com",
    "password": "password123"
  }'

# Expected response includes:
# "token": "eyJhbGciOiJIUzI1NiIs..."
```

- [ ] Returns 200 OK
- [ ] Response includes token
- [ ] Token format is valid JWT

### Test 4: Route Calculation

```bash
# First, get token from Test 3, then:

curl -X POST http://localhost:5000/api/v1/routes/calculate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": 22.2587, "lng": 71.1924},
    "destination": {"lat": 23.0225, "lng": 72.5714}
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "distanceInKm": 42.5,
#     "durationInMinutes": 45,
#     "polyline": [...]
#   }
# }
```

- [ ] Returns 200 OK
- [ ] distanceInKm is a number
- [ ] durationInMinutes is a number
- [ ] polyline is an array

### Test 5: Email Sending

```bash
curl -X POST http://localhost:5000/api/v1/notifications/email \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@gmail.com",
    "subject": "FleetFlow Test Email",
    "message": "This is a test message from FleetFlow"
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "to": "your-test-email@gmail.com",
#     "subject": "FleetFlow Test Email"
#   }
# }
```

- [ ] Returns 200 OK
- [ ] Email is received in inbox/spam folder within 2 minutes
- [ ] Email formatting looks correct

### Test 6: Cost Estimation

```bash
curl -X POST http://localhost:5000/api/v1/routes/estimate-cost \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "distanceInKm": 100,
    "vehicle": {
      "fuelConsumption": 6,
      "fuelPrice": 100,
      "fixedCostPerKm": 5
    }
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "distanceInKm": 100,
#     "fuelCost": 1666.67,
#     "fixedCost": 500,
#     "totalCost": 2166.67
#   }
# }
```

- [ ] Returns 200 OK
- [ ] totalCost = (distance/consumption) × price + (distance × fixedPerKm)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module @sendgrid/mail"

**Error Message:**
```
Error: Cannot find module '@sendgrid/mail'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
cd server
npm install
npm start
```

- [ ] Dependencies installed
- [ ] Server starts without errors

---

### Issue 2: "OPENROUTE_API_KEY is not set"

**Error Message:**
```
⚠️ OPENROUTE_API_KEY is not set - route features disabled
OpenRouteService is currently unavailable
```

**Cause:** API key missing from .env

**Solution:**
```bash
1. Go to https://openrouteservice.org/register/
2. Create account and copy API key
3. Add to server/.env:
   OPENROUTE_API_KEY=your_actual_key_here
4. Restart server: npm start
```

- [ ] .env updated with API key
- [ ] Server restarted
- [ ] Health check returns "operational"

---

### Issue 3: "SENDGRID_API_KEY is not set"

**Error Message:**
```
⚠️ SENDGRID_API_KEY is not set - email features disabled
SendGrid Email Service is currently unavailable
```

**Cause:** SendGrid API key missing from .env

**Solution:**
```bash
1. Go to https://sendgrid.com/
2. Create account
3. Go to Settings → API Keys → Create API Key
4. Copy the key (only visible once!)
5. Add to server/.env:
   SENDGRID_API_KEY=your_actual_key_here
   EMAIL_FROM=your-verified-email@yourcompany.com
6. Restart server: npm start
```

- [ ] .env has SENDGRID_API_KEY
- [ ] .env has EMAIL_FROM with verified email
- [ ] Server restarted
- [ ] Health check returns "operational"

---

### Issue 4: "Invalid coordinates" Error

**Error Message:**
```json
{
  "success": false,
  "message": "Invalid coordinates",
  "details": "Latitude must be between -90 and 90"
}
```

**Cause:** Coordinates out of valid range

**Valid Ranges:**
- Latitude: -90 to 90
- Longitude: -180 to 180

**Solution:**
```javascript
// ❌ Wrong
{ lat: "22.2587", lng: "71.1924" }  // strings instead of numbers

// ✅ Correct
{ lat: 22.2587, lng: 71.1924 }      // numbers
```

- [ ] Use numeric values (not strings)
- [ ] Latitude between -90 and 90
- [ ] Longitude between -180 and 180

---

### Issue 5: "Email not received"

**Possible Causes:**

1. **Email marked as spam**
   - [ ] Check spam/junk folder
   - [ ] Add sender to contacts
   - [ ] Whitelist domain in email provider

2. **Wrong sender email**
   - [ ] Verify EMAIL_FROM in .env
   - [ ] Must be verified in SendGrid
   - [ ] Restart server after change

3. **Rate limit exceeded**
   - [ ] Free SendGrid: 100 emails/day
   - [ ] Check logs for rate limit errors
   - [ ] Wait until next day or upgrade plan

4. **API key invalid**
   - [ ] Verify SENDGRID_API_KEY is correct
   - [ ] Check it hasn't expired
   - [ ] Get new key if needed

**Debug Steps:**
```bash
# 1. Check logs
npm start | grep -i email

# 2. Test with different email
curl -X POST http://localhost:5000/api/v1/notifications/email \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "another-email@gmail.com",
    "subject": "Test 2",
    "message": "Test"
  }'

# 3. Verify SendGrid API key
# Go to https://sendgrid.com/ → Settings → API Keys
```

- [ ] Check spam folder
- [ ] Verify EMAIL_FROM is correct
- [ ] Verify API key is valid
- [ ] Check rate limit not exceeded
- [ ] Restart server

---

### Issue 6: "MongoDB connection failed"

**Error Message:**
```
Error connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause:** MongoDB not running or wrong connection string

**Solution:**

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or manually start it
mongod
```

**Mac/Linux:**
```bash
# Use Homebrew
brew services start mongodb-community

# Or manually
mongod
```

**Verify:**
```bash
# Check if MongoDB is running
mongodb+srv://... # If remote
# or
localhost:27017 # If local
```

- [ ] MongoDB service is running
- [ ] MONGODB_URI in .env is correct
- [ ] Connection successful message appears

---

### Issue 7: "Cron jobs not initializing"

**Error Message:**
```
⚠️ Could not initialize notification jobs: ...
```

**Possible Causes:**

1. SendGrid not configured
   - [ ] Check SENDGRID_API_KEY is set
   - [ ] Jobs will still initialize but skip email send

2. Database connection issues
   - [ ] Verify MongoDB is running
   - [ ] Check MONGODB_URI is correct

3. Permission issues
   - [ ] Check file permissions on notification.job.js
   - [ ] Ensure not read-only

**Debug Steps:**
```bash
# 1. Check logs for specific error
npm start | grep -i "job"

# 2. Verify SendGrid is configured
cat .env | grep SENDGRID

# 3. Verify database connection
npm start | grep -i "mongo"

# 4. Check cron syntax
# Format: 'minute hour day month dayOfWeek'
# '0 9 * * *' = Daily 9 AM ✅
```

- [ ] SENDGRID_API_KEY is set
- [ ] MongoDB is connected
- [ ] Check logs for specific errors
- [ ] Restart server

---

### Issue 8: "Invalid JWT token"

**Error Message:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "details": "Invalid token"
}
```

**Cause:** Missing or invalid Authentication header

**Solution:**
```bash
# 1. Get valid token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@fleetflow.com",
    "password": "password123"
  }'

# 2. Copy the token from response

# 3. Use in requests
curl http://localhost:5000/api/v1/routes/health \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Important:**
- [ ] Include "Bearer " prefix
- [ ] Token should be after "Bearer "
- [ ] Token expires after JWT_EXPIRE time (default: 7 days)
- [ ] Get new token if expired

---

### Issue 9: "Rate limit exceeded"

**Error Message:**
```json
{
  "message": "Rate limit exceeded",
  "details": "Free tier: 2,500 requests/day"
}
```

**Limits:**
- OpenRouteService Free: 2,500 requests/day
- SendGrid Free: 100 emails/day

**Solutions:**

1. **Upgrade Plan**
   - [ ] OpenRouteService: https://openrouteservice.org/pricing/
   - [ ] SendGrid: https://sendgrid.com/pricing/

2. **Wait for Reset**
   - [ ] Both reset at midnight UTC
   - [ ] Check remaining quota on their dashboards

3. **Optimize Usage**
   - [ ] Use batch endpoints instead of single
   - [ ] Cache frequently requested routes
   - [ ] Schedule heavy operations off-peak

**Check Remaining Quota:**
```bash
# OpenRouteService - check dashboard
# https://openrouteservice.org/dashboard/

# SendGrid - check dashboard
# https://sendgrid.com/
```

- [ ] Check quota on dashboard
- [ ] Upgrade if needed
- [ ] Optimize batch operations
- [ ] Schedule heavy operations carefully

---

### Issue 10: "Port 5000 already in use"

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Cause:** Another process using port 5000

**Solution:**

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm start
```

**Mac/Linux:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

- [ ] Kill existing process
- [ ] Or use different PORT in .env
- [ ] Restart server

---

## ⚡ Performance Optimization Tips

### Tip 1: Batch Operations

```javascript
// Instead of:
for (let dest of destinations) {
  const route = await calculateRoute(origin, dest);
}

// Use:
const routes = await calculateBatchRoutes(origin, destinations);
```

- [ ] Use batch endpoint for multiple routes
- [ ] Reduces API calls by 90%

### Tip 2: Cache Frequently Used Routes

```javascript
// Add Redis caching
const routeCache = new Map();

function getCachedRoute(origin, dest) {
  const key = `${origin.lat},${origin.lng}:${dest.lat},${dest.lng}`;
  return routeCache.get(key);
}
```

### Tip 3: Database Indexing

```javascript
// Add indexes for common queries
db.drivers.createIndex({ licenseExpiry: 1 });
db.vehicles.createIndex({ maintenanceDueDate: 1 });
db.trips.createIndex({ createdAt: -1 });
```

### Tip 4: Async Email Sending

```javascript
// Don't wait for email to complete
// Send in background
emailService.sendTripCompletionEmail(trip).catch(err => {
  console.warn('Email send failed:', err);
});

// Return immediately
return res.json({ success: true, data: trip });
```

### Tip 5: Monitor API Usage

```bash
# Track daily usage
# OpenRouteService: https://openrouteservice.org/dashboard/
# SendGrid: https://sendgrid.com/

# Set alerts at 80% quota
```

---

## 📋 Pre-Production Checklist

- [ ] All 6 verification tests pass
- [ ] Environment variables using production values
- [ ] Production API keys from OpenRouteService
- [ ] Production API keys from SendGrid
- [ ] Database backups configured
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Email templates tested in different clients
- [ ] Cron jobs scheduled and verified
- [ ] Rate limits monitored
- [ ] CORS configured for production domain
- [ ] JWT secret different from development
- [ ] HTTPS enabled for all external APIs

---

## 📺 Common Commands

```bash
# Start server
npm start

# Run tests
npm test

# Check logs
npm start | grep -i "error\|warning\|success"

# Seed database with test data
npm run seed

# Check database connection
npm run check:db

# Format code
npm run format

# Lint code
npm run lint
```

---

## 🆘 Getting Help

### Resources

- **OpenRouteService Docs**: https://openrouteservice.org/docs/
- **SendGrid Docs**: https://sendgrid.api-docs.io/
- **Node-Cron Docs**: https://github.com/kelektiv/node-cron
- **Express Docs**: https://expressjs.com/
- **MongoDB Docs**: https://docs.mongodb.com/

### Debug Commands

```bash
# Check all services health
curl http://localhost:5000/api/v1/routes/health
curl http://localhost:5000/api/v1/notifications/health

# Test database
npm run check:db

# View recent logs
npm start | tail -20

# Check environment
cat .env | grep -E "API_KEY|DATABASE|JWT"
```

### Contact Support

- **OpenRouteService**: support@openrouteservice.org
- **SendGrid**: support@sendgrid.com
- **Slack**: #fleetflow-dev

---

Last Updated: February 21, 2026
