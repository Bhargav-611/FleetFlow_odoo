# 🚛 FleetFlow - Fleet & Logistics Management System
## Complete Implementation Guide

---

## 📋 System Overview

FleetFlow is a comprehensive Fleet Management System built with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Authentication**: JWT with Role-Based Access Control (RBAC)
- **Real-time Data**: RESTful APIs with comprehensive analytics

---

## 🏗️ System Architecture

### Database Models

#### 1. **User Model**
```
Fields:
- name: Full name
- email: Unique, lowercase
- password: Hashed with bcrypt
- role: [driver, fleet_manager, dispatcher, safety_officer, financial_analyst]
- resetPasswordToken: For password recovery
- resetPasswordExpire: Token expiration

Features:
- Password hashing in pre-save hook
- JWT token generation
- Password matching utility
```

#### 2. **Vehicle Model**
```
Fields:
- name: Vehicle name/model
- licensePlate: Unique identifier
- type: [Truck, Van, Trailer, Tanker, Flatbed, Refrigerated, Other]
- maxCapacity: Max load in kg
- odometer: Current reading
- region: Operating region
- status: [Available, On Trip, In Shop, Retired]
- acquisitionCost: Purchase price
- year: Model year
- fuelType: [Diesel, Petrol, CNG, Electric, Hybrid]

Indexes:
- licensePlate (unique)
- status, region
```

#### 3. **Driver Model**
```
Fields:
- name: Driver name
- email: Email address
- phone: Contact number
- licenseNumber: Unique license ID
- licenseExpiry: License valid until
- vehicleCategories: Authorized vehicle types
- status: [On Duty, Off Duty, On Trip, Suspended]
- safetyScore: 0-100 (default: 100)
- totalTrips: Cumulative trip count
- completedTrips: Successfully completed trips
- userId: Reference to User account
- notes: Additional information

Virtuals:
- isLicenseValid: Auto-check expiry
- completionRate: Trip success percentage
```

#### 4. **Trip Model**
```
Fields:
- vehicle: Reference to Vehicle (required)
- driver: Reference to Driver (required)
- origin: Start location
- destination: End location
- cargoWeight: Load in kg
- cargoDescription: Cargo details
- status: [Draft, Dispatched, Completed, Cancelled]
- revenue: Trip earnings
- distance: Travel distance in km
- startOdometer: Reading at start
- endOdometer: Reading at completion
- scheduledDate: Planned date
- dispatchedAt: When sent out
- completedAt: Finish timestamp
- cancelledAt: Cancellation timestamp
- notes: Additional info
- createdBy: User who created trip

Validations:
- cargoWeight ≤ vehicle.maxCapacity
- vehicle.status must be Available
- driver.status must be On Duty
- driver.licenseExpiry > current date

Workflow:
- Draft → Dispatched: vehicle & driver status become "On Trip"
- Dispatched → Completed: vehicle & driver return to Available/On Duty
- Any → Cancelled: Resources freed immediately
```

#### 5. **MaintenanceLog Model**
```
Fields:
- vehicle: Vehicle reference
- type: [Preventive, Reactive]
- description: Maintenance details
- cost: Service cost
- startDate: Work start date
- endDate: Work completion date
- status: [In Progress, Completed]
- performedBy: Technician name
- notes: Additional notes

Side Effects:
- On creation: vehicle.status = "In Shop"
- On completion: vehicle.status = "Available"
```

#### 6. **FuelLog Model**
```
Fields:
- vehicle: Vehicle reference
- trip: Optional trip reference
- liters: Fuel quantity
- cost: Fuel cost
- odometerAtFill: Odometer reading
- date: Refueling date
- notes: Additional info

Used for:
- Fuel efficiency calculations
- Cost analysis
- Maintenance predictions
```

#### 7. **Expense Model**
```
Fields:
- vehicle: Vehicle reference
- trip: Optional trip reference
- category: [Fuel, Maintenance, Toll, Insurance, Fine, Other]
- amount: Expense amount
- date: When incurred
- description: Details

Used for:
- Cost breakdown per vehicle
- Category-wise analysis
- ROI calculations
```

---

## 🔐 Authentication & Authorization

### Role-Based Access Control

| Role | Dashboard | Vehicles | Trips | Drivers | Maintenance | Fuel | Expenses | Analytics |
|------|:---------:|:--------:|:-----:|:-------:|:-----------:|:----:|:--------:|:---------:|
| **Driver** | View | View | - | View | - | - | - | - |
| **Dispatcher** | ✓ | ✓ | Create/Dispatch | View | - | ✓ | - | - |
| **Fleet Manager** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Safety Officer** | ✓ | ✓ | - | ✓ | - | - | - | - |
| **Financial Analyst** | ✓ | View | View | - | - | ✓ | ✓ | ✓ |

### Authentication Flow
```
1. User registers → User account created → Driver record created (if driver role)
2. User logs in → JWT token generated → Stored in localStorage
3. All requests → Authorization header with Bearer token
4. Token validation → Route protection enforced
5. Role validation → Endpoint access controlled
```

---

## 🛣️ API Routes & Endpoints

### Authentication (`/api/v1/auth`)
```
POST   /register          - Create user account
POST   /login             - User login
GET    /me                - Get current user (protected)
POST   /forgot-password   - Request password reset
PUT    /reset-password/:token - Reset password
```

### Vehicles (`/api/v1/vehicles`)
```
GET    /                  - List all vehicles (pagination, filtering)
GET    /available         - Only available vehicles
GET    /:id               - Single vehicle details
POST   /                  - Create (Manager/Dispatcher only)
PUT    /:id               - Update (Manager only)
PATCH  /:id/status        - Update status (Manager only)
DELETE /:id               - Delete (Manager only)

Query Params:
- page, limit: Pagination
- status: Filter by status
- type: Filter by vehicle type
- region: Filter by region
- search: Search by name
```

### Drivers (`/api/v1/drivers`)
```
GET    /                  - List all drivers
GET    /available         - On Duty drivers with valid license
GET    /:id               - Driver details
GET    /:id/compliance    - Compliance info (license status, completion rate)
POST   /                  - Create (Manager/Safety Officer only)
PUT    /:id               - Update (Manager/Safety Officer only)
PATCH  /:id/status        - Status change (Manager/Safety Officer only)
DELETE /:id               - Delete (Manager only)
```

### Trips (`/api/v1/trips`)
```
GET    /                  - List all trips
GET    /:id               - Trip details
POST   /                  - Create draft (Manager/Dispatcher)
PATCH  /:id/dispatch      - Send trip out
PATCH  /:id/complete      - Mark completed
PATCH  /:id/cancel        - Cancel trip
DELETE /:id               - Delete draft trips only
```

### Maintenance (`/api/v1/maintenance`)
```
GET    /                  - All maintenance logs
POST   /                  - Create (Manager only)
PUT    /:id               - Update (Manager only)
PATCH  /:id/complete      - Mark completed (Manager only)
DELETE /:id               - Delete (Manager only)
```

### Fuel Logs (`/api/v1/fuel-logs`)
```
GET    /                  - All fuel logs
POST   /                  - Create log
PUT    /:id               - Update
DELETE /:id               - Delete
```

### Expenses (`/api/v1/expenses`)
```
GET    /                  - All expenses
POST   /                  - Create expense
PUT    /:id               - Update
DELETE /:id               - Delete
```

### Analytics (`/api/v1/analytics`)
```
GET    /dashboard         - KPIs (vehicles, revenue, utilization, etc.)
GET    /fuel-efficiency   - Fuel analysis per vehicle
GET    /vehicle-roi       - ROI calculations
GET    /monthly-trends    - Revenue and cost trends
GET    /export/csv        - CSV export
GET    /export/pdf        - PDF export
```

---

## 📊 Dashboard & KPIs

### Command Center Metrics
```
Active Fleet: Vehicles currently ON_TRIP
Maintenance Alerts: Vehicles IN_SHOP
Utilization Rate: (ON_TRIP / operational vehicles) * 100
Pending Cargo: Trips in DRAFT status
Total Revenue: Sum of completed trip revenues
Fuel Costs: Total fuel expenses
Total Distance: Sum of trip distances
Driver Count: Total active drivers
```

### Performance Calculations

**Cost Per Km**
```
= (Fuel Cost + Maintenance Cost) / Total Distance
```

**Fuel Efficiency**
```
= Total Distance / Total Liters
```

**Vehicle ROI**
```
= ((Total Revenue - (Fuel + Maintenance)) / Acquisition Cost) * 100
```

---

## 🎨 Frontend Architecture

### Page Structure

#### Authentication Pages
- **LoginPage**: Email + password authentication
- **RegisterPage**: User registration with role selection

#### Dashboard Pages

1. **DashboardPage** (Command Center)
   - KPI cards with metrics
   - Fleet status pie chart
   - Revenue & fuel cost bar chart
   - Monthly trends visualization

2. **VehiclesPage**
   - Vehicle registry with pagination
   - Status badges, filters
   - Add/Edit modals
   - Role-based editing permissions

3. **DriversPage**
   - Driver management
   - License expiry alerts
   - Safety score display
   - Trip completion rates
   - Driver view (read-only for drivers)

4. **TripsPage**
   - Trip creation and dispatch
   - Status progression (Draft → Dispatched → Completed)
   - Available vehicle/driver dropdowns
   - Odometer tracking
   - Complete trip with final readings

5. **MaintenancePage**
   - Maintenance log tracking
   - Status indicators
   - Cost management
   - Vehicle impact tracking

6. **FuelLogsPage**
   - Fuel consumption tracking
   - Cost per liter monitoring
   - Odometer correlation

7. **ExpensesPage**
   - Operational cost tracking
   - Category-wise breakdown
   - Vehicle-wise analysis

8. **AnalyticsPage**
   - Fuel efficiency charts
   - Vehicle ROI analysis
   - Monthly trends
   - CSV export functionality

### Component Structure

```
components/
├── layout/
│   └── DashboardLayout.jsx (Sidebar, role-based nav)
├── KPICard.jsx (Dashboard metrics display)
├── PageHeader.jsx (Title + action buttons)
├── StatusBadge.jsx (Color-coded status)
└── ui/ (shadcn/ui components)

pages/ (All page components listed above)

context/
└── AuthContext.jsx (Authentication state & methods)

lib/
├── api.js (Axios instance with JWT interceptor)
└── utils.js (Formatters, role labels, status colors)
```

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 14
MongoDB >= 4.0
npm or yarn
```

### Backend Setup
```bash
cd server
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost/fleetflow
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
PORT=5000
EOF

npm run start
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Access Application
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API: `http://localhost:5000/api/v1`

---

## 🧪 Testing with Demo Credentials

### Default Users (Run seed.js if available)

| Email | Password | Role |
|-------|----------|------|
| manager@fleetflow.com | password123 | Fleet Manager |
| dispatcher@fleetflow.com | password123 | Dispatcher |
| safety@fleetflow.com | password123 | Safety Officer |
| analyst@fleetflow.com | password123 | Financial Analyst |
| driver@fleetflow.com | password123 | Driver |

---

## 📱 Key Features Implemented

### ✅ Phase 3: Vehicle Management
- [x] CRUD operations with validation
- [x] Vehicle status tracking
- [x] Capacity constraints
- [x] Acquisition cost tracking
- [x] Pagination and filtering

### ✅ Phase 4: Driver Management
- [x] License expiry validation
- [x] Safety score tracking
- [x] Trip completion metrics
- [x] Compliance reporting
- [x] Status management

### ✅ Phase 5: Trip Dispatcher
- [x] Trip creation with validation
- [x] Vehicle & driver availability checks
- [x] Cargo weight validation
- [x] Dispatch workflow
- [x] Completion tracking
- [x] Odometer updates

### ✅ Phase 6: Maintenance
- [x] Maintenance log creation
- [x] Vehicle status management
- [x] Cost tracking
- [x] Preventive vs Reactive logging

### ✅ Phase 7: Fuel & Expenses
- [x] Fuel log tracking
- [x] Expense categorization
- [x] Cost analysis
- [x] Efficiency calculations

### ✅ Phase 8: Analytics
- [x] Dashboard KPIs
- [x] ROI calculations
- [x] Fuel efficiency analysis
- [x] Monthly trends
- [x] Export capabilities

### ✅ Phase 9: Frontend
- [x] Complete React application
- [x] Responsive design
- [x] Role-based UI
- [x] Real-time data updates
- [x] Interactive charts

---

## 🔧 Advanced Features

### Validations Implemented
```
✓ Cargo weight ≤ vehicle.maxCapacity
✓ Vehicle must be AVAILABLE for trip creation
✓ Driver must be ON_DUTY and license valid
✓ No duplicate license plates
✓ Email uniqueness
✓ Proper enumerations for all statuses
```

### Business Logic
```
✓ Trip dispatch updates vehicle & driver status
✓ Trip completion increments driver metrics
✓ Maintenance toggles vehicle availability
✓ License expiry blocks driver assignment
✓ All timestamps auto-tracked
```

### Performance
```
✓ Database indexing on frequently queried fields
✓ Population of references only when needed
✓ Pagination for large datasets
✓ Optimized aggregation pipelines
✓ Efficient filtering with MongoDB
```

---

## 📖 Common Use Cases

### Creating a Trip
```
1. Fleet Manager creates trip (Draft)
2. Dispatcher reviews and validates
3. Dispatcher dispatches trip
4. Vehicle & driver status changes to "On Trip"
5. Driver completes trip with final odometer
6. Retrieve end odometer → revenue calculation
7. Driver& vehicle return to available status
8. Metrics updated automatically
```

### Managing Vehicle Maintenance
```
1. Manager creates maintenance log
2. Vehicle status automatically → "In Shop"
3. Maintenance repairs vehicle
4. Manager marks log as completed
5. Vehicle status automatically → "Available"
```

### Analyzing Fleet Performance
```
1. Go to Analytics page
2. View KPIs and charts
3. Check vehicle ROI
4. Export data in CSV format
5. Analyze trends and efficiency
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Vehicle not available" error
- **Solution**: Check vehicle status in database

**Issue**: "License expired" error
- **Solution**: Update driver license expiry date

**Issue**: "Cargo exceeds capacity" error
- **Solution**: Reduce cargo weight or use larger vehicle

**Issue**: Authentication failures
- **Solution**: Check JWT_SECRET matches between files

**Issue**: CORS errors
- **Solution**: Verify CORS is enabled in backend

---

## 📝 Notes

- All timestamps are UTC
- Pagination defaults to page 1, limit 10
- Soft deletes not implemented (hard delete)
- Email verification not implemented
- SMS notifications not implemented
- WebSocket real-time updates not included in base version
- PDF export requires pdfkit (optional)

---

## 🎯 Future Enhancements

- [ ] WebSocket for real-time GPS tracking
- [ ] Mobile app (React Native)
- [ ] Advanced reporting (PDF generation)
- [ ] Predictive maintenance
- [ ] Route optimization
- [ ] Fuel price monitoring
- [ ] Integration with telematics
- [ ] Customer portal
- [ ] Biometric driver verification
- [ ] Insurance integration

---

## 📞 Support

For issues or questions, check the GitHub repository or contact the development team.

---

**Version**: 1.0  
**Last Updated**: February 21, 2026  
**Status**: Production Ready
