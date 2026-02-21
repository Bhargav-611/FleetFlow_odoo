# ❓ FleetFlow FAQ & Troubleshooting Guide

## Table of Contents
1. [Installation Issues](#installation-issues)
2. [Authentication Issues](#authentication-issues)
3. [API Errors](#api-errors)
4. [Database Issues](#database-issues)
5. [Frontend Issues](#frontend-issues)
6. [Performance Issues](#performance-issues)
7. [Role & Permission Issues](#role--permission-issues)
8. [Data & Business Logic Issues](#data--business-logic-issues)
9. [Deployment Issues](#deployment-issues)

---

## Installation Issues

### Q: npm install fails with permission error
```
Error: EACCES: permission denied
```

**A:**
```bash
# Option 1: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Option 2: Use sudo (not recommended)
sudo npm install -g npm

# Option 3: Clear npm cache
npm cache clean --force
npm install
```

### Q: MongoDB connection fails on Windows
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**A:**
```powershell
# Check if MongoDB is installed
mongod --version

# If not installed, download from mongodb.com/try/download/community

# Start MongoDB service
# On Windows, MongoDB should run as a service
# Service name: MongoDB
# Check Services app (Win + R, type: services.msc)

# Or run MongoDB manually
mongod

# If connection still fails, use MongoDB Atlas instead
# Update server/.env:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fleetflow
```

### Q: Node.js version mismatch
```
The engine "node" is incompatible with this package
```

**A:**
```bash
# Check current version
node --version

# Install required version (18+)
# Via nvm (Node Version Manager)
nvm install 18
nvm use 18

# Via homebrew (macOS)
brew install node@18

# Via Windows installer
# Download from nodejs.org
```

---

## Authentication Issues

### Q: Stuck on login page with no error
```
Submit button shows loading spinner indefinitely
```

**A:**
1. Check browser console (F12) for errors
2. Verify backend is running: `curl http://localhost:5000/api/v1/health`
3. Check network tab to see API request status
4. Verify JWT_SECRET exists in .env

```javascript
// client/src/lib/api.js - Check API configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api/v1';
console.log('API Base URL:', API_BASE_URL); // Should show correct URL
```

### Q: "Invalid email or password" on valid credentials
```
Error even with correct email/password
```

**A:**
1. Check user exists in database:
```bash
mongo
> use fleetflow
> db.users.findOne({ email: "your@email.com" })
```

2. Verify password wasn't changed:
```bash
# Reset in database (development only)
> db.users.updateOne(
    { email: "your@email.com" },
    { $set: { password: bcrypt.hashSync('newpassword', 10) } }
  )
```

3. Clear browser cache/cookies:
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
// Then refresh
```

### Q: Token expires immediately
```
Error: jwt expired after 30 seconds
```

**A:**
```bash
# Check JWT_EXPIRE in server/.env
# Should be: 7d (7 days), not 30s

# Update .env
JWT_EXPIRE=7d

# Restart server
npm start
```

### Q: Cannot login with special characters in password
```
Login fails with password containing @, #, $, etc.
```

**A:**
```bash
# Issue: Special characters in .env need escaping
# server/.env (WRONG)
PASSWORD=P@ssw0rd#123

# server/.env (CORRECT)
PASSWORD="P@ssw0rd#123"

# Or use environment variable encoding
export JWT_SECRET="your-secret-with-@-symbols"
npm start
```

### Q: Getting 401 Unauthorized on protected routes
```
Error: Not authorized — token invalid
```

**A:**
```javascript
// Check if token is being sent
// client/src/lib/api.js
const token = localStorage.getItem('token');
console.log('Token:', token); // Should not be null

// If null, user is not logged in. Redirect to /login
```

---

## API Errors

### Q: 400 Bad Request for vehicle creation
```
{
  "success": false,
  "message": "Name is required"
}
```

**A:**
Check request body matches schema:
```javascript
// CORRECT
{
  "name": "Tesla Truck",
  "licensePlate": "TESLA001",
  "type": "Truck",
  "maxCapacity": 5000,
  "odometer": 0,
  "region": "North",
  "acquisitionCost": 80000,
  "year": 2023,
  "fuelType": "Electric"
}

// WRONG - missing required fields
{
  "name": "Tesla Truck"
}
```

### Q: 409 Conflict when creating vehicle
```
{
  "success": false,
  "message": "License plate already exists"
}
```

**A:**
```bash
# Option 1: Use different license plate
# Option 2: Delete existing vehicle with same plate
mongo
> db.vehicles.deleteOne({ licensePlate: "TESLA001" })

# Option 3: For testing, prefix with timestamp
"licensePlate": "TESLA_" + Date.now()
```

### Q: 403 Forbidden error
```
{
  "success": false,
  "message": "Role 'driver' is not authorized"
}
```

**A:**
```javascript
// Check your user role
// This endpoint requires fleet_manager role
// User is logged in as 'driver'

// Solution:
// 1. Login as different role (fleet_manager, dispatcher)
// 2. Or add role to endpoint permissions in backend

// server/src/routes/vehicle.routes.js
const vehicleRouter = express.Router();
vehicleRouter.post(
  '/',
  protect, // Check user is authenticated
  authorize('fleet_manager', 'dispatcher'), // Check user has correct role
  createVehicle
);
```

### Q: 500 Internal Server Error
```
{
  "success": false,
  "message": "Internal server error"
}
```

**A:**
1. Check backend console for error:
```
Error: Vehicle reference not found: [object Object]
```

2. Check server logs:
```bash
# If using PM2
pm2 logs fleetflow-api

# If running directly
npm start # Shows logs in terminal
```

3. Common causes:
   - Database connection lost
   - Invalid MongoDB ObjectId format
   - Missing environment variables

```bash
# Verify all required .env variables
grep -E 'process.env' server/src/index.js
# Then ensure all are in .env
```

### Q: Endpoint returns empty array instead of data
```
// Expected
{
  "success": true,
  "data": [{ vehicle1 }, { vehicle2 }]
}

// Got
{
  "success": true,
  "data": []
}
```

**A:**
```javascript
// Check database has data
db.vehicles.count() // Should be > 0

// Check query filters
GET /api/v1/vehicles?status=Available
// If all vehicles are "In Shop", result will be empty

// Verify database name is correct
// server/.env:
MONGODB_URI=mongodb://localhost/fleetflow
//                              (database name)
```

---

## Database Issues

### Q: Cannot connect to MongoDB Atlas
```
Error: connect ECONNREFUSED
```

**A:**
1. Verify connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/fleetflow?retryWrites=true&w=majority
```
- Check username: Correct case sensitivity
- Check password: Encoded special chars (e.g., @ becomes %40)
- Check cluster name: matches your actual cluster

2. Whitelist your IP:
   - Go to MongoDB Atlas → Network Access
   - Add your IP address (or 0.0.0.0 for development only)

3. Test connection:
```bash
mongo "mongodb+srv://user:password@cluster.mongodb.net/fleetflow"
```

### Q: Database size growing too fast
```
Database size: 10 GB
```

**A:**
```bash
# Check collection sizes
mongo
> use fleetflow
> db.trips.stats() // Shows collection size
> db.vehicles.stats()
> db.fuel_logs.stats()

# Find large collections
Object.keys(db.getCollectionNames()).forEach(name => {
  var stats = db[name].stats();
  print(name + ": " + Math.round(stats.size / 1024 / 1024) + " MB");
});

# Delete old data (older than 6 months)
db.trips.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 6*30*24*60*60*1000) }
});

# Enable TTL index to auto-delete after 90 days
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90*24*60*60 });
```

### Q: Queries running slowly
```
GET /analytics/dashboard takes 5 seconds
```

**A:**
```javascript
// Add database indexes
// server/src/models/Trip.js
tripSchema.index({ status: 1 }); // For filtering
tripSchema.index({ vehicle: 1 }); // For joins
tripSchema.index({ driver: 1 }); // For joins
tripSchema.index({ createdAt: -1 }); // For sorting

// Check existing indexes
db.trips.getIndexes()

// Drop and recreate if needed
db.trips.dropIndex("index_name")
db.trips.createIndex({ status: 1 })

// For aggregation, add allowDiskUse
db.trips.aggregate([...], { allowDiskUse: true })
```

### Q: Duplicate key error
```
Error: E11000 duplicate key error
```

**A:**
```javascript
// Someone already has this value
// Check which field:
// E11000 duplicate key error collection: fleetflow.vehicles index: licensePlate_1

// Solution:
// 1. Delete duplicate
db.vehicles.deleteOne({ licensePlate: "TESLA001" })

// 2. Or use upsert instead of insert
db.vehicles.updateOne(
  { licensePlate: "TESLA001" },
  { $set: { name: "Tesla Truck" } },
  { upsert: true }
)
```

---

## Frontend Issues

### Q: Vite dev server not starting
```
Error: EADDRINUSE: address already in use :::5173
```

**A:**
```bash
# Port 5173 already in use
# Kill process using port
lsof -i :5173 # macOS/Linux
netstat -ano | findstr :5173 # Windows

kill -9 <PID> # macOS/Linux
taskkill /PID <PID> /F # Windows

# Or use different port
npm run dev -- --port 3000
```

### Q: Components not rendering
```
Blank page or missing components
```

**A:**
```javascript
// Check component imports
import KPICard from '@/components/KPICard' // WRONG - might not exist

// Use relative imports
import KPICard from '../components/KPICard' // CORRECT

// Or check vite.config.js alias
// vite.config.js
resolve: {
  alias: {
    '@': '/src'
  }
}

// Verify file exists at path
```

### Q: API calls not reaching backend
```
XMLHttpRequest blocked
```

**A:**
1. Check API URL:
```javascript
// client/src/lib/api.js
console.log('API_BASE_URL:', API_BASE_URL);
// Should show: http://localhost:5000/api/v1
```

2. Verify backend is running:
```bash
curl http://localhost:5000/api/v1/health
# Should return { "status": "OK" }
```

3. Check CORS configuration:
```javascript
// server/src/index.js
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
```

### Q: Images not loading
```
<img> tags show broken image
```

**A:**
```javascript
// For local images, use import
import logoImage from '@/assets/logo.png'
export default () => <img src={logoImage} />

// For external URLs
<img src="https://cdn.example.com/image.png" />

// For public folder files
<img src="/public/logo.png" /> // Correct
<img src="./public/logo.png" /> // WRONG - results in double path
```

### Q: CSS not applying
```
Styles not showing despite correct className
```

**A:**
```javascript
// Check Tailwind is initialized
// client/src/index.css should have:
@tailwind base;
@tailwind components;
@tailwind utilities;

// Check tailwind.config.js includes all template paths
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ...
}

// Rebuild Tailwind
npm run dev # Restarts and rebuilds CSS
```

### Q: "Cannot find module" error
```
Error: Cannot find module '@shadcn/ui/react'
```

**A:**
```bash
# Install missing package
npm install @shadcn/ui

# Or use correct import path
import { Button } from '@/components/ui/button'
// Not from @shadcn/ui/react directly

# Check package.json has dependency
npm list @shadcn/ui
```

---

## Performance Issues

### Q: Slow page load time
```
First contentful paint: 3.5 seconds (Target: < 1 second)
```

**A:**
```javascript
// 1. Check network waterfall (DevTools → Network)
// 2. Lazy load non-critical components
import { lazy, Suspense } from 'react'

const AnalyticsPage = lazy(() => import('./AnalyticsPage'))

export default () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AnalyticsPage />
  </Suspense>
)

// 3. Optimize images
// Use WebP format, resize for device
<img 
  srcSet="img-320w.jpg 320w, img-768w.jpg 768w"
  sizes="(max-width: 320px) 280px, 750px"
/>

// 4. Enable gzip compression
// nginx.conf or server config
gzip on;
gzip_types text/plain text/css application/json;
```

### Q: High memory usage
```
Browser memory: 500 MB (Target: < 100 MB)
```

**A:**
```javascript
// 1. Check for memory leaks
// DevTools → Memory → Take heap snapshot

// 2. Clean up subscriptions and listeners
useEffect(() => {
  const subscription = dataStream.subscribe(...)
  return () => {
    subscription.unsubscribe() // Cleanup
  }
}, [])

// 3. Avoid large data structures in state
const [trips, setTrips] = useState([]) // OK
const [allHistory, setAllHistory] = useState([]) // WRONG - grows huge

// 4. Use useMemo for expensive calculations
const memoizedValue = useMemo(() => expensiveCalc(), [dependency])
```

### Q: Laggy scrolling
```
Jank when scrolling through large list
```

**A:**
```javascript
// 1. Use virtual scrolling for large lists
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={35}
>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>

// 2. Debounce scroll events
const handleScroll = debounce(() => {
  // expensive operation
}, 300)

// 3. Use will-change CSS property
.scrollable-item {
  will-change: transform;
}
```

---

## Role & Permission Issues

### Q: User can access pages they shouldn't
```
Driver accessing Maintenance page (should be restricted)
```

**A:**
1. Check route protection in App.jsx:
```javascript
// client/src/App.jsx - Missing protection
<Route path="/maintenance" element={<MaintenancePage />} />
// WRONG - no role check

// Correct - use role-based route
<ProtectedRoute
  path="/maintenance"
  element={<MaintenancePage />}
  requiredRoles={['fleet_manager', 'dispatcher']}
/>
```

2. Add protection:
```javascript
const ProtectedRoute = ({ element, requiredRoles }) => {
  const { user } = useAuth()
  const isAuthorized = requiredRoles?.includes(user?.role)
  
  return isAuthorized ? element : <Navigate to="/unauthorized" />
}
```

### Q: Create button disappears after login
```
Manager role, But "Add" buttons not visible
```

**A:**
```javascript
// Check user role is being set correctly
console.log('User:', user) // In browser console
// Should show: { id: "...", role: "fleet_manager", ... }

// Check localStorage token
localStorage.getItem('token') // Should not be null

// Verify auth context is initialized
// client/src/context/AuthContext.jsx - Check useAuth returns user

// Force refresh to update role
window.location.reload()
```

### Q: API rejects valid request with 403
```
Status 403: Role 'driver' is not authorized
```

**A:**
```javascript
// Backend authorization middleware
// server/src/middleware/auth.js

// Check authorize middleware is applied to endpoint
app.post('/vehicles', protect, authorize('fleet_manager'), createVehicle)
// 'driver' role can't use this endpoint

// Solution: Login as fleet_manager, or add role to authorize list
authorize('fleet_manager', 'dispatcher', 'driver')
// Now driver has access
```

---

## Data & Business Logic Issues

### Q: Vehicle can be dispatched even though in shop
```
Status: "In Shop" but trip still dispatch successful
```

**A:**
```javascript
// Check trip controller validation
// server/src/controllers/trip.controller.js

dispatchTrip = async (req, res) => {
  const vehicle = await Vehicle.findById(tripData.vehicle)
  
  // WRONG - missing validation
  trip.status = 'Dispatched'
  
  // CORRECT - check vehicle status
  if (vehicle.status !== 'Available') {
    return res.status(400).json({
      success: false,
      message: 'Vehicle not available'
    })
  }
  
  vehicle.status = 'On Trip'
  trip.status = 'Dispatched'
  await vehicle.save()
  await trip.save()
}
```

### Q: Driver license expiry not preventing dispatch
```
Expired license but trip dispatches
```

**A:**
```javascript
// Add license validation in trip controller
const driver = await Driver.findById(tripData.driver)

const isLicenseValid = driver.licenseExpiry > new Date()
if (!isLicenseValid) {
  return res.status(400).json({
    success: false,
    message: 'Driver license expired'
  })
}

// Also check in frontend
{driver.licenseExpiry > new Date() ? (
  <Button onClick={dispatch}>Dispatch</Button>
) : (
  <Button disabled>License Expired</Button>
)}
```

### Q: Cargo weight validation not working
```
6000 kg cargo in 5000 kg vehicle - accepted
```

**A:**
```javascript
// server/src/controllers/trip.controller.js
if (trip.cargoWeight > vehicle.maxCapacity) {
  return res.status(400).json({
    success: false,
    message: `Cargo weight (${trip.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`
  })
}
```

### Q: Analytics showing wrong ROI
```
ROI shows -50% (should be +200%)
```

**A:**
```javascript
// Check ROI calculation
// server/src/controllers/analytics.controller.js

const roi = ((totalRevenue - totalCost) / totalCost * 100).toFixed(2)

// Verify formula:
// ROI = (Profit / Investment) * 100
// Profit = Revenue - Cost
// Investment = Acquisition Cost + Operating Cost

// If getting negative, check:
// 1. totalRevenue includes all trip revenue
// 2. totalCost includes acquisition + maintenance + fuel
// 3. No zero division
```

### Q: Dashboard KPIs not updating
```
After creating new trip, counts don't change
```

**A:**
```javascript
// Frontend: Check data refresh
// client/src/pages/DashboardPage.jsx

useEffect(() => {
  fetchDashboardKPIs() // Should have dependency
}, []) // WRONG - doesn't refresh

// CORRECT
useEffect(() => {
  fetchDashboardKPIs()
}, [refreshTrigger]) // Refresh when needed

// After creating trip, trigger refresh
const handleTripCreated = () => {
  setRefreshTrigger(Date.now())
}

// Or use React Query for automatic refresh
const { data: kpis, refetch } = useQuery('dashboardKpis', fetchDashboardKPIs, {
  staleTime: 60000, // Cache for 1 minute
  cacheTime: 300000 // Keep for 5 minutes
})
```

---

## Deployment Issues

### Q: Cannot push to Heroku
```
Error: Permission denied (publickey)
```

**A:**
```bash
# Setup SSH keys for Heroku
heroku login

# Or use git credentials
git remote add heroku https://git.heroku.com/fleetflow-api.git
git push heroku main

# If still failing, remove and re-add remote
git remote remove heroku
heroku git:remote -a fleetflow-api
git push heroku main
```

### Q: Build fails on Heroku
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /app/package.json
```

**A:**
```bash
# Ensure you're in correct directory
# Heroku needs Procfile
echo "web: npm start" > server/Procfile

# Specify which folder to build
# Heroku needs to know which directory is the app
git add Procfile
git push heroku main

# Or use buildpacks
heroku buildpacks:add --index 1 heroku/nodejs
```

### Q: Frontend shows blank page in production
```
Works locally but blank when deployed to Vercel
```

**A:**
1. Set environment variables in Vercel:
```
VITE_API_URL=https://fleetflow-api.herokuapp.com/api/v1
```

2. Check that .env.production exists:
```
client/.env.production
VITE_API_URL=https://api.example.com/api/v1
```

3. Rebuild frontend:
```bash
npm run build # Ensure no errors
vercel --prod --force
```

### Q: API timeout in production
```
504 Gateway Timeout
```

**A:**
```bash
# Increase timeout in nginx/reverse proxy
upstream backend {
  server fleetflow-api.herokuapp.com;
}

server {
  location /api {
    proxy_pass http://backend;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }
}

# For Heroku
# web: node --max-old-space-size=512 src/index.js
```

---

## 🔍 Debugging Tips

### Enable Debug Logging

**Backend**
```bash
# Add to server/.env
DEBUG=*
LOG_LEVEL=debug

# Or specific debug
DEBUG=app:* npm start
```

**Frontend**
```javascript
// Add to main.jsx
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true
}

// In components
if (window.DEBUG) {
  console.log('Debug info:', data)
}
```

### Use Browser DevTools

```javascript
// Open console and test API
fetch('http://localhost:5000/api/v1/vehicles', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(d => console.log(d))
```

### Check Backend Status

```bash
# Are ports listening?
lsof -i :5000 # Backend should be here
lsof -i :5173 # Frontend should be here
lsof -i :27017 # MongoDB should be here

# Is MongoDB running?
mongo --version
mongo

# Check service status
systemctl status mongodb
systemctl status nginx
```

---

## 📞 Getting Help

1. **Check Logs**
   - Backend: `npm start` output
   - Frontend: Browser console (F12)
   - Database: MongoDB logs

2. **Search Issues**
   - GitHub Issues: github.com/your-repo/issues
   - Stack Overflow: Tag with "express", "react", "mongodb"

3. **Test Endpoints**
   - Use Postman or curl to verify API
   - Check response status and body
   - Verify request headers and authentication

4. **Isolate Problem**
   - Backend issue? Test with Postman
   - Frontend issue? Check browser console
   - Database issue? Test with mongo client
   - Network issue? Check firewall and CORS

---

Last Updated: February 21, 2026
