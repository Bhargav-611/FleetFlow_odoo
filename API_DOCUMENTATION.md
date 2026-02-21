# 🔌 FleetFlow API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require:
```
Authorization: Bearer <JWT_TOKEN>
```

Token is obtained from login response and should be sent in Authorization header.

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "driver"  // driver, fleet_manager, dispatcher, safety_officer, financial_analyst
}

Response: 201 Created
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "driver"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": { ... user object ... }
}
```

---

## 🚗 Vehicle Endpoints

### Get All Vehicles
```http
GET /vehicles?page=1&limit=10&status=Available&type=Truck&region=North&search=tesla

Parameters:
- page: Page number (default: 1)
- limit: Records per page (default: 10)
- status: Available | On Trip | In Shop | Retired
- type: Truck | Van | Trailer | Tanker | Flatbed | Refrigerated | Other
- region: Filter by region
- search: Search by name

Response: 200 OK
{
  "success": true,
  "count": 5,
  "total": 15,
  "pages": 2,
  "currentPage": 1,
  "data": [
    {
      "_id": "...",
      "name": "Tesla Truck X",
      "licensePlate": "TESLA001",
      "type": "Truck",
      "maxCapacity": 5000,
      "odometer": 45230,
      "region": "North",
      "status": "Available",
      "acquisitionCost": 80000,
      "year": 2023,
      "fuelType": "Electric",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Available Vehicles
```http
GET /vehicles/available

Response: 200 OK
{
  "success": true,
  "count": 8,
  "data": [ ... ]
}
```

### Get Single Vehicle
```http
GET /vehicles/600d5ec49d4c3b0015a5c1a1

Response: 200 OK
{
  "success": true,
  "data": { ... vehicle object ... }
}
```

### Create Vehicle (Manager/Dispatcher only)
```http
POST /vehicles
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Tesla Truck X",
  "licensePlate": "TESLA001",
  "type": "Truck",
  "maxCapacity": 5000,
  "odometer": 0,
  "region": "North",
  "acquisitionCost": 80000,
  "year": 2023,
  "fuelType": "Electric"
}

Response: 201 Created
{
  "success": true,
  "data": { ... created vehicle ... }
}
```

### Update Vehicle (Manager only)
```http
PUT /vehicles/600d5ec49d4c3b0015a5c1a1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Tesla Truck X",
  "odometer": 45230,
  "region": "South"
}

Response: 200 OK
{
  "success": true,
  "data": { ... updated vehicle ... }
}
```

### Update Vehicle Status (Manager only)
```http
PATCH /vehicles/600d5ec49d4c3b0015a5c1a1/status
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "status": "In Shop"  // Available | On Trip | In Shop | Retired
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

### Delete Vehicle (Manager only)
```http
DELETE /vehicles/600d5ec49d4c3b0015a5c1a1
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": {}
}
```

---

## 👨‍💼 Driver Endpoints

### Get All Drivers
```http
GET /drivers?status=On Duty&search=john

Parameters:
- status: On Duty | Off Duty | On Trip | Suspended
- search: Search by name

Response: 200 OK
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "licenseNumber": "DL123456",
      "licenseExpiry": "2025-12-31",
      "vehicleCategories": ["Truck", "Van"],
      "status": "On Duty",
      "safetyScore": 95,
      "totalTrips": 50,
      "completedTrips": 48,
      "isLicenseValid": true,
      "completionRate": 96
    }
  ]
}
```

### Get Available Drivers
```http
GET /drivers/available

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [ ... on duty drivers with valid license ... ]
}
```

### Get Driver Compliance
```http
GET /drivers/600d5ec49d4c3b0015a5c1a1/compliance
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "licenseExpiry": "2025-12-31",
    "licenseNumber": "DL123456",
    "status": "On Duty",
    "safetyScore": 95,
    "isLicenseValid": true,
    "daysUntilExpiry": 315,
    "completionRate": 96,
    "totalTrips": 50,
    "completedTrips": 48
  }
}
```

### Create Driver (Manager/Safety Officer only)
```http
POST /drivers
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "licenseNumber": "DL123456",
  "licenseExpiry": "2025-12-31",
  "vehicleCategories": ["Truck", "Van"],
  "safetyScore": 100,
  "status": "On Duty"
}

Response: 201 Created
```

### Update Driver Status (Manager/Safety Officer only)
```http
PATCH /drivers/600d5ec49d4c3b0015a5c1a1/status
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "status": "Off Duty"  // On Duty | Off Duty | On Trip | Suspended
}

Response: 200 OK
```

---

## 📦 Trip Endpoints

### Get All Trips
```http
GET /trips?status=Dispatched&search=Mumbai

Parameters:
- status: Draft | Dispatched | Completed | Cancelled
- search: Search by origin/destination

Response: 200 OK
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "vehicle": {
        "_id": "...",
        "name": "Tesla Truck X",
        "licensePlate": "TESLA001"
      },
      "driver": {
        "_id": "...",
        "name": "John Doe"
      },
      "origin": "Mumbai",
      "destination": "Delhi",
      "cargoWeight": 3500,
      "cargoDescription": "Electronics",
      "status": "Dispatched",
      "revenue": 5000,
      "distance": 1400,
      "startOdometer": 45230,
      "endOdometer": null,
      "dispatchedAt": "2024-02-20T10:30:00Z",
      "createdAt": "2024-02-20T09:00:00Z"
    }
  ]
}
```

### Get Single Trip
```http
GET /trips/600d5ec49d4c3b0015a5c1a1
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": { ... trip object ... }
}
```

### Create Trip (Manager/Dispatcher only)
```http
POST /trips
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "vehicle": "600d5ec49d4c3b0015a5c1a1",
  "driver": "600d5ec49d4c3b0015a5c1a2",
  "origin": "Mumbai",
  "destination": "Delhi",
  "cargoWeight": 3500,
  "cargoDescription": "Electronics",
  "revenue": 5000
}

Response: 201 Created
{
  "success": true,
  "data": { ... created trip with status Draft ... }
}
```

### Dispatch Trip (Manager/Dispatcher only)
```http
PATCH /trips/600d5ec49d4c3b0015a5c1a1/dispatch
Authorization: Bearer <TOKEN>

Response: 200 OK
Note: Vehicle & driver status automatically set to "On Trip"
```

### Complete Trip (Manager/Dispatcher only)
```http
PATCH /trips/600d5ec49d4c3b0015a5c1a1/complete
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "endOdometer": 46630,
  "revenue": 5250,
  "distance": 1400  // Optional: calculated from odometers
}

Response: 200 OK
Note: Vehicle status → Available, Driver status → On Duty, metrics updated
```

### Cancel Trip (Manager/Dispatcher only)
```http
PATCH /trips/600d5ec49d4c3b0015a5c1a1/cancel
Authorization: Bearer <TOKEN>

Response: 200 OK
Note: If dispatched, resources are freed
```

### Delete Trip (Manager only - Draft trips only)
```http
DELETE /trips/600d5ec49d4c3b0015a5c1a1
Authorization: Bearer <TOKEN>

Response: 200 OK
```

---

## 🔧 Maintenance Endpoints

### Get All Maintenance Logs
```http
GET /maintenance?vehicle=...&status=In Progress

Parameters:
- vehicle: Filter by vehicle ID
- status: In Progress | Completed

Response: 200 OK
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "vehicle": {
        "_id": "...",
        "name": "Tesla Truck X",
        "licensePlate": "TESLA001"
      },
      "type": "Preventive",  // Preventive | Reactive
      "description": "Oil change and filter replacement",
      "cost": 500,
      "startDate": "2024-02-20",
      "endDate": null,
      "status": "In Progress",
      "performedBy": "John's Workshop",
      "notes": "Regular service"
    }
  ]
}
```

### Create Maintenance (Manager only)
```http
POST /maintenance
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "vehicle": "600d5ec49d4c3b0015a5c1a1",
  "type": "Preventive",
  "description": "Oil change and filter replacement",
  "cost": 500,
  "performedBy": "John's Workshop",
  "notes": "Regular service"
}

Response: 201 Created
Note: Vehicle status automatically set to "In Shop"
```

### Complete Maintenance (Manager only)
```http
PATCH /maintenance/600d5ec49d4c3b0015a5c1a1/complete
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "endDate": "2024-02-21",
  "cost": 600  // Optional: update if changed
}

Response: 200 OK
Note: Vehicle status automatically set to "Available"
```

---

## ⛽ Fuel Log Endpoints

### Get All Fuel Logs
```http
GET /fuel-logs?vehicle=...&trip=...

Parameters:
- vehicle: Filter by vehicle ID
- trip: Filter by trip ID

Response: 200 OK
[
  {
    "_id": "...",
    "vehicle": { ... },
    "trip": null,
    "liters": 50,
    "cost": 2500,
    "odometerAtFill": 45230,
    "date": "2024-02-20",
    "notes": "Fill-up at Mumbai station"
  }
]
```

### Create Fuel Log
```http
POST /fuel-logs
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "vehicle": "600d5ec49d4c3b0015a5c1a1",
  "liters": 50,
  "cost": 2500,
  "odometerAtFill": 45230,
  "date": "2024-02-20",
  "notes": "Fill-up at Mumbai station"
}

Response: 201 Created
```

---

## 💰 Expense Endpoints

### Get All Expenses
```http
GET /expenses?vehicle=...&category=Maintenance&trip=...

Response: 200 OK
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "vehicle": { ... },
      "category": "Maintenance",  // Fuel | Maintenance | Toll | Insurance | Fine | Other
      "amount": 1500,
      "date": "2024-02-20",
      "description": "Brake pad replacement",
      "trip": null
    }
  ]
}
```

### Create Expense
```http
POST /expenses
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "vehicle": "600d5ec49d4c3b0015a5c1a1",
  "category": "Maintenance",
  "amount": 1500,
  "date": "2024-02-20",
  "description": "Brake pad replacement"
}

Response: 201 Created
```

---

## 📊 Analytics Endpoints

### Get Dashboard KPIs
```http
GET /analytics/dashboard
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalVehicles": 15,
    "activeFleet": 8,
    "maintenanceAlerts": 2,
    "available": 5,
    "retired": 0,
    "utilizationRate": 62,
    "totalDrivers": 12,
    "pendingCargo": 3,
    "totalTrips": 156,
    "completedTrips": 142,
    "totalRevenue": 450000,
    "totalDistance": 45000,
    "totalFuelCost": 112500,
    "totalLiters": 4500,
    "totalMaintenanceCost": 28000
  }
}
```

### Get Fuel Efficiency
```http
GET /analytics/fuel-efficiency
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "600d5ec49d4c3b0015a5c1a1",
      "vehicleName": "Tesla Truck X",
      "licensePlate": "TESLA001",
      "totalLiters": 450,
      "totalCost": 22500,
      "entries": 18,
      "kmPerLiter": 8.5,
      "costPerKm": 1.2
    }
  ]
}
```

### Get Vehicle ROI
```http
GET /analytics/vehicle-roi
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "vehicle": {
        "_id": "...",
        "name": "Tesla Truck X",
        "licensePlate": "TESLA001"
      },
      "totalFuelCost": 22500,
      "totalLiters": 450,
      "totalMaintenanceCost": 5000,
      "totalRevenue": 75000,
      "totalDistance": 3825,
      "tripCount": 15,
      "totalOperationalCost": 27500,
      "costPerKm": 7.19,
      "fuelEfficiency": 8.5,
      "roi": 18.44
    }
  ]
}
```

### Get Monthly Trends
```http
GET /analytics/monthly-trends
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "success": true,
  "data": {
    "trips": [
      {
        "_id": "2024-01",
        "trips": 25,
        "revenue": 87500,
        "distance": 8750
      },
      {
        "_id": "2024-02",
        "trips": 28,
        "revenue": 98000,
        "distance": 9800
      }
    ],
    "fuel": [
      {
        "_id": "2024-01",
        "fuelCost": 21750,
        "liters": 870
      },
      {
        "_id": "2024-02",
        "fuelCost": 24500,
        "liters": 980
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Cargo weight exceeds vehicle capacity"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized — token invalid"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Role 'driver' is not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Vehicle not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "License plate already exists"
}
```

---

## Rate Limiting
Currently not implemented. Recommended for production:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Pagination Example
```http
GET /vehicles?page=2&limit=20

Response includes:
- count: Number of records in current page
- total: Total records in database
- pages: Total pages available
- currentPage: Current page number
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error - Internal error |

---

Last Updated: February 21, 2026
