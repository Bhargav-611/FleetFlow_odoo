# 🧪 FleetFlow Testing Guide

## Overview
This guide covers how to test all features of the FleetFlow Fleet Management System, from authentication to advanced analytics.

---

## 🚀 Quick Start Testing

### Step 1: Setup Environment
```bash
# Terminal 1 - Backend
cd server
npm install
npm start
# Should display: Server running on port 5000

# Terminal 2 - Frontend
cd client
npm install
npm run dev
# Should display: Local: http://localhost:5173
```

### Step 2: Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **MongoDB**: Ensure MongoDB is running (or update .env with MongoDB Atlas URI)

---

## 📋 Demo Credentials

### Default User (Pre-seeded in seed.js)
```
Email: demo@example.com
Password: demo123456
Role: fleet_manager
```

### Create Test Users
Use the Register page to create accounts with different roles:
- Driver: Test vehicle assignment and trip workflows
- Dispatcher: Test trip dispatch and logistics
- Fleet Manager: Test complete CRUD operations
- Safety Officer: Test compliance and driver management
- Financial Analyst: Test analytics and reporting

---

## 🧐 Manual Testing Checklist

### 1. Authentication Flow ✅

#### Register as Driver
1. Click "Sign Up" on login page
2. Fill form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: password123
   - Confirm Password: password123
   - Role: Driver
3. Click "Sign Up"
4. **Expected**: Redirect to dashboard, token in localStorage

#### Register as Fleet Manager
1. Click "Sign Up"
2. Email: manager@example.com, password: password123, Role: Fleet Manager
3. **Expected**: Can access vehicle and driver management

#### Login
1. Enter demo@example.com / demo123456
2. **Expected**: Redirect to dashboard with user role visible

---

### 2. Vehicle Management ✅

#### Add Vehicle (Fleet Manager)
1. Navigate to **Vehicles** page
2. Click **"Add Vehicle"** button
3. Fill form:
   ```
   Name: Tata 10 Ton
   License Plate: MH01AB1234
   Type: Truck
   Max Capacity: 10000
   Odometer: 0
   Region: West
   Acquisition Cost: 800000
   Year: 2023
   Fuel Type: Diesel
   ```
4. Click "Add Vehicle"
5. **Expected**: New vehicle appears in list

#### View Vehicles
1. Go to **Vehicles** page
2. **Expected**: Paginated list (10 per page by default)
3. Test filters: Type, Status, Region

#### Search Vehicles
1. In search box, type "Tata"
2. **Expected**: Filters to vehicles matching "Tata"

#### Filter by Status
1. Click status dropdown
2. Select "Available"
3. **Expected**: Only available vehicles shown

#### Edit Vehicle (Fleet Manager)
1. Click edit icon on vehicle row
2. Change odometer to 5000
3. Click "Update Vehicle"
4. **Expected**: Vehicle updated in list

#### Change Vehicle Status (Fleet Manager)
1. Click vehicle row
2. Change status dropdown to "In Shop"
3. **Expected**: Vehicle status updated

#### Test Role-Based UI (Driver)
1. Login as driver
2. Go to **Vehicles** page
3. **Expected**: 
   - "Add Vehicle" button NOT visible
   - Edit/Delete buttons NOT visible
   - Can only view vehicles

---

### 3. Driver Management ✅

#### Add Driver (Fleet Manager)
1. Navigate to **Drivers** page
2. Click **"Add Driver"** button
3. Fill form:
   ```
   Name: Rajesh Kumar
   Email: rajesh@example.com
   Phone: 9876543210
   License Number: DL2024001
   License Expiry: 2027-12-31
   Vehicle Categories: Truck, Van
   Status: On Duty
   Safety Score: 100
   ```
4. Click "Create Driver"
5. **Expected**: Driver appears in list

#### View Driver Compliance
1. Click on driver row
2. View license status, expiry countdown, completion rate
3. **Expected**: Shows "License Valid for X days", completion rate percentage

#### Update Driver Status
1. Click driver row
2. Change status to "Off Duty"
3. **Expected**: Status updated

#### Test Role-Based UI (Driver)
1. Login as driver
2. Go to **Drivers** page
3. **Expected**:
   - Can view all drivers
   - Search/filter NOT visible
   - Edit/Delete buttons NOT visible
   - Read-only access

---

### 4. Trip Management (Trip Dispatcher) ✅

#### Create Trip (Dispatcher)
1. Navigate to **Trips** page
2. Click **"Create New Trip"** button
3. Fill form:
   ```
   Vehicle: Select "Tata 10 Ton" (must be Available)
   Driver: Select "Rajesh Kumar" (must be On Duty with valid license)
   Origin: Mumbai
   Destination: Delhi
   Cargo Weight: 8000 kg
   Cargo Description: Electronics cargo
   Revenue: ₹5000
   ```
4. Click "Create Trip"
5. **Expected**: Trip created with status "Draft"

#### Dispatch Trip
1. Find trip with "Draft" status
2. Click **"Dispatch"** button
3. **Expected**:
   - Trip status → "Dispatched"
   - Vehicle status → "On Trip"
   - Driver status → "On Trip"
   - Button changes to "Complete" / "Cancel"

#### Complete Trip
1. Click **"Complete"** on dispatched trip
2. Enter:
   ```
   End Odometer: 46400
   Revenue: 5250
   ```
3. Click "Complete Trip"
4. **Expected**:
   - Trip status → "Completed"
   - Vehicle status → "Available"
   - Driver status → "On Duty"
   - Trip metrics saved (distance calculated)

#### Cancel Trip
1. Create a trip and set status to "Draft"
2. Click **"Cancel"** button
3. **Expected**: Trip status → "Cancelled"

#### Workflow Validation
1. Try to dispatch trip with "In Shop" vehicle
2. **Expected**: Error message "Vehicle not available"
3. Try to dispatch trip with Suspended driver
4. **Expected**: Error message "Driver not available"

---

### 5. Maintenance Logs ✅

#### Create Maintenance (Fleet Manager)
1. Navigate to **Maintenance** page
2. Click **"Add Maintenance"**
3. Fill form:
   ```
   Vehicle: Select "Tata 10 Ton"
   Type: Preventive
   Description: Oil change and filter
   Cost: 500
   Performed By: ABC Workshop
   Notes: Regular maintenance
   ```
4. Click "Create Maintenance"
5. **Expected**:
   - Maintenance log created
   - Vehicle status auto-set to "In Shop"

#### Complete Maintenance
1. Find maintenance with "In Progress" status
2. Click **"Mark Complete"**
3. Enter End Date, optionally update cost
4. Click "Complete"
5. **Expected**:
   - Status → "Completed"
   - Vehicle status → "Available"

#### Vehicle Status Toggling Test
1. Create maintenance (vehicle → In Shop)
2. Complete maintenance (vehicle → Available)
3. Create another maintenance (vehicle → In Shop again)
4. **Expected**: Vehicle status toggling works correctly

---

### 6. Fuel Logs ✅

#### Add Fuel Log
1. Navigate to **Fuel Logs** page
2. Click **"Add Fuel Log"**
3. Fill form:
   ```
   Vehicle: Select any vehicle
   Liters: 50
   Cost: 2500
   Odometer: 45230
   Date: Today
   Notes: Fuel station refill
   ```
4. Click "Add Fuel Log"
5. **Expected**: Fuel log recorded with vehicle reference

#### Verify Cost Calculation
1. View fuel logs list
2. **Expected**: Shows:
   - Cost per liter (2500/50 = 50 per liter)
   - Total cost tracking

---

### 7. Expenses ✅

#### Add Expense
1. Navigate to **Expenses** page
2. Click **"Add Expense"**
3. Fill forms:
   ```
   Type 1 - Maintenance:
   - Vehicle: Select any
   - Category: Maintenance
   - Amount: 1500
   - Description: Brake replacement
   
   Type 2 - Toll Fee:
   - Vehicle: Select any
   - Category: Toll
   - Amount: 250
   - Description: Toll fee Mumbai-Delhi
   ```
4. **Expected**: Different expense types categorized

#### View Expense Summary
1. In Expenses page
2. View total by category
3. **Expected**: Shows breakdown by category (Fuel, Maintenance, Toll, etc.)

---

### 8. Dashboard & Analytics ✅

#### View Dashboard KPIs
1. Navigate to **Dashboard**
2. Verify KPI cards show:
   - Total Vehicles
   - Active Fleet
   - Maintenance Alerts
   - Vehicle Utilization Rate %
   - Total Drivers
   - Pending Cargo Count
   - Total Revenue
   - Total Distance
   - Fuel Cost Per Km
3. **Expected**: All KPIs calculated correctly

#### Test Calculations
1. Complete a trip with:
   - Start Odometer: 45000
   - End Odometer: 45250
   - Revenue: 1000
2. Go to Dashboard
3. **Expected**:
   - Completed Trips count increases
   - Total Revenue increases by 1000
   - Distance increases by 250 km

#### Create Another Trip for Trend
1. Complete 2-3 more trips
2. Navigate to **Analytics**
3. **Expected**: Charts populate with data

#### View Fuel Efficiency Analytics
1. Go to **Analytics**
2. Scroll to "Fuel Efficiency Report"
3. **Expected**: Shows:
   - Vehicle name
   - Total liters used
   - KM per liter (efficiency)
   - Cost per KM

#### View Vehicle ROI
1. In **Analytics**
2. Scroll to "Vehicle ROI"
3. **Expected**: Shows:
   - Total operational cost
   - Total revenue
   - ROI percentage
   - Cost per KM

#### View Monthly Trends
1. In **Analytics**
2. Scroll to charts
3. **Expected**: Line/bar charts showing:
   - Revenue trend
   - Distance trend
   - Fuel cost trend

#### Export Analytics Data
1. Click **"Export as CSV"** on any report
2. **Expected**: CSV file downloads with proper formatting

---

### 9. Role-Based Access Control ✅

#### Test As Fleet Manager
1. Login as fleet_manager@example.com
2. Navigate to each page:
   - Dashboard: ✅ Full access
   - Vehicles: ✅ Can add, edit, delete
   - Drivers: ✅ Can add, edit, delete
   - Trips: ✅ Can create, dispatch, complete
   - Maintenance: ✅ Can add, complete
   - Fuel Logs: ✅ Read-only
   - Expenses: ✅ Can add, view
   - Analytics: ✅ Full access

#### Test As Dispatcher
1. Login as dispatcher@example.com (create if needed)
2. **Expected**:
   - Dashboard: ✅ View only
   - Vehicles: ✅ View only (maybe edit status)
   - Drivers: ✅ View only
   - Trips: ✅ Can dispatch, complete
   - Cannot: Add vehicles, add drivers, delete records

#### Test As Driver
1. Login as john.doe@example.com
2. **Expected**:
   - Dashboard: ✅ Limited view
   - Vehicles: ✅ View only
   - Drivers: ✅ View all drivers, read-only
   - Trips: ✅ View own trips, cannot create
   - Maintenance: ❌ No access
   - Fuel Logs: ✅ View only
   - Expenses: ❌ No access
   - Analytics: ❌ No access

#### Test As Financial Analyst
1. Create user with financial_analyst role
2. **Expected**:
   - Dashboard: ✅ Full access
   - Vehicles: ✅ View only (for cost metrics)
   - Analytics: ✅ Full access
   - Trips: ✅ View only (for revenue)
   - Cannot: Modify vehicles, drivers, trips

#### Test As Safety Officer
1. Create user with safety_officer role
2. **Expected**:
   - Dashboard: ✅ View only
   - Drivers: ✅ Full access (compliance focus)
   - Vehicles: ✅ View only
   - Cannot: Add trips, manage finances

---

### 10. Search & Filtering ✅

#### Vehicle Search
1. Navigation to **Vehicles**
2. Search "Tata" → Filters by name
3. Search "MH01" → Filters by license plate
4. **Expected**: Real-time search results

#### Driver Search
1. Navigate to **Drivers**
2. Search "Rajesh" → Filters by name
3. Search "9876" → Filters by phone
4. **Expected**: Real-time search results

#### Trip Search
1. Navigate to **Trips**
2. Search "Delhi" → Filters by origin/destination
3. **Expected**: Real-time search results

#### Filter by Date Range
1. In **Fuel Logs** or **Expenses**
2. Select date range
3. **Expected**: Filtered results

---

### 11. Pagination ✅

#### Test Vehicle Pagination
1. Create 15+ vehicles
2. Navigate to **Vehicles**
3. **Expected**:
   - Shows 10 per page
   - "Page 1 of 2" indicator
   - Next/Previous buttons work
   - Different vehicles on page 2

#### Test on Other Pages
1. **Drivers**: Create 15+ drivers
2. **Trips**: Create 15+ trips
3. **Expected**: Pagination works on all list pages

---

### 12. Form Validation ✅

#### Test Vehicle Form
1. Try to create vehicle with empty name
2. **Expected**: Error "Name is required"
3. Try duplicate license plate
4. **Expected**: Error "License plate already exists"

#### Test Driver Form
1. Try to create driver with invalid email
2. **Expected**: Error "Invalid email format"
3. Try with license number already used
4. **Expected**: Error "License number already exists"
5. Try with expiry date in past
6. **Expected**: Error "License expiry must be in future"

#### Test Trip Form
1. Try to create trip with cargo weight > vehicle capacity
2. **Expected**: Error "Cargo exceeds vehicle capacity"
3. Try with unavailable vehicle
4. **Expected**: Error "Vehicle not available"
5. Try with suspended driver
6. **Expected**: Error "Driver not available for dispatch"

---

### 13. Performance Testing ✅

#### Pagination Performance
1. Create 1000 vehicles
2. Navigate through pages
3. **Expected**: Each page loads < 1 second

#### Search Performance
1. Search with "A" in 1000 vehicles
2. **Expected**: Results appear < 500ms

#### Analytics Generation
1. Complete 50+ trips
2. Go to Analytics
3. **Expected**: Charts render < 2 seconds

---

## 🔧 API Testing with Postman

### Setup Postman Collection

1. **Create new collection**: FleetFlow API
2. **Add environment variables**:
   ```
   base_url: http://localhost:5000/api/v1
   token: (gets set after login)
   vehicle_id: (set after create vehicle)
   driver_id: (set after create driver)
   trip_id: (set after create trip)
   ```

### Test Requests

#### 1. Register
```
POST http://localhost:5000/api/v1/auth/register
Body (JSON):
{
  "name": "Test Driver",
  "email": "test@example.com",
  "password": "password123",
  "role": "driver"
}

Tests script (Extract token):
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

#### 2. Login
```
POST {{base_url}}/auth/login
Body:
{
  "email": "demo@example.com",
  "password": "demo123456"
}

Tests:
pm.environment.set("token", pm.response.json().token);
```

#### 3. Get Current User
```
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

#### 4. Create Vehicle
```
POST {{base_url}}/vehicles
Authorization: Bearer {{token}}
Body:
{
  "name": "Mercedes Truck",
  "licensePlate": "KA01AB5678",
  "type": "Truck",
  "maxCapacity": 8000,
  "odometer": 0,
  "region": "North",
  "acquisitionCost": 600000,
  "year": 2023,
  "fuelType": "Diesel"
}

Tests:
pm.environment.set("vehicle_id", pm.response.json().data._id);
```

#### 5. Get Vehicles (with Pagination)
```
GET {{base_url}}/vehicles?page=1&limit=10&status=Available

Expected Response:
{
  "success": true,
  "count": 10,
  "total": 15,
  "pages": 2,
  "currentPage": 1,
  "data": [...]
}
```

#### 6. Create Driver
```
POST {{base_url}}/drivers
Authorization: Bearer {{token}}
Body:
{
  "name": "Harjit Singh",
  "email": "harjit@example.com",
  "phone": "9999888877",
  "licenseNumber": "DL2024002",
  "licenseExpiry": "2027-12-31",
  "vehicleCategories": ["Truck"],
  "safetyScore": 95,
  "status": "On Duty"
}

Tests:
pm.environment.set("driver_id", pm.response.json().data._id);
```

#### 7. Create Trip
```
POST {{base_url}}/trips
Authorization: Bearer {{token}}
Body:
{
  "vehicle": "{{vehicle_id}}",
  "driver": "{{driver_id}}",
  "origin": "Bangalore",
  "destination": "Chennai",
  "cargoWeight": 6000,
  "cargoDescription": "Frozen goods",
  "revenue": 3000
}

Tests:
pm.environment.set("trip_id", pm.response.json().data._id);
```

#### 8. Dispatch Trip
```
PATCH {{base_url}}/trips/{{trip_id}}/dispatch
Authorization: Bearer {{token}}

Expected: Status changes to "Dispatched"
```

#### 9. Complete Trip
```
PATCH {{base_url}}/trips/{{trip_id}}/complete
Authorization: Bearer {{token}}
Body:
{
  "endOdometer": 46350,
  "revenue": 3150
}

Expected: Status changes to "Completed"
```

#### 10. Get Analytics
```
GET {{base_url}}/analytics/dashboard
Authorization: Bearer {{token}}

Expected: KPI metrics calculated
```

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**:
- Start MongoDB: `mongod`
- Or update `.env` with MongoDB Atlas URI
- Or use Docker: `docker run -d -p 27017:27017 mongo`

### Issue: Token Expired
```
Error: jwt malformed / jwt expired
```
**Solution**:
- Clear localStorage in browser DevTools
- Re-login to get new token
- Or check JWT_EXPIRE in .env

### Issue: CORS Error
```
Access to XMLHttpRequest has been blocked
```
**Solution**:
- Ensure backend running on port 5000
- Ensure frontend running on port 5173
- Check CORS middleware in server/src/index.js

### Issue: Vehicle Status Not Updating
```
Vehicle still shows "On Trip" after completing trip
```
**Solution**:
- Check trip completion logic in trip.controller.js
- Ensure endOdometer is being provided
- Verify vehicle reference is correct

### Issue: Driver License Validation Not Working
```
Dispatching trip with expired license succeeds
```
**Solution**:
- Check driver compliance in driver.controller.js
- Ensure licenseExpiry is in correct format (ISO date)
- Verify dispatch validation middleware

---

## 📊 Performance Benchmarks

Target performance metrics:

| Operation | Target | Actual |
|-----------|--------|--------|
| Page Load | < 2s | ? |
| API Response | < 500ms | ? |
| Search | < 300ms | ? |
| Pagination | < 500ms | ? |
| Analytics Query | < 1s | ? |
| Export CSV | < 2s | ? |

---

## ✅ Sign-Off Checklist

Before considering system "tested":

- [ ] All roles can login
- [ ] Vehicles CRUD operations working
- [ ] Driver registration workflow complete
- [ ] Trip dispatch workflow end-to-end working
- [ ] Maintenance toggling vehicle status correctly
- [ ] Fuel logs tracking costs
- [ ] Expenses categorized properly
- [ ] Dashboard KPIs calculating correctly
- [ ] Analytics reports generating
- [ ] Role-based access control blocking unauthorized actions
- [ ] Pagination working on all list pages
- [ ] Form validation working
- [ ] Search/filter functional
- [ ] Error messages displaying properly
- [ ] No console errors
- [ ] No unhandled promise rejections

---

Last Updated: February 21, 2026
