require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});

        // Create users (one per role)
        const users = await User.create([
            { name: 'Admin Manager', email: 'manager@fleetflow.com', password: 'password123', role: 'fleet_manager' },
            { name: 'Jane Dispatcher', email: 'dispatcher@fleetflow.com', password: 'password123', role: 'dispatcher' },
            { name: 'Mike Safety', email: 'safety@fleetflow.com', password: 'password123', role: 'safety_officer' },
            { name: 'Sara Analyst', email: 'analyst@fleetflow.com', password: 'password123', role: 'financial_analyst' },
        ]);
        console.log(`Created ${users.length} users`);

        // Create vehicles
        const vehicles = await Vehicle.create([
            { name: 'Volvo FH16', licensePlate: 'FL-1001', type: 'Truck', maxCapacity: 25000, odometer: 85000, region: 'North', acquisitionCost: 120000, fuelType: 'Diesel' },
            { name: 'Mercedes Actros', licensePlate: 'FL-1002', type: 'Truck', maxCapacity: 20000, odometer: 62000, region: 'South', acquisitionCost: 110000, fuelType: 'Diesel' },
            { name: 'Ford Transit', licensePlate: 'FL-2001', type: 'Van', maxCapacity: 3500, odometer: 45000, region: 'East', acquisitionCost: 35000, fuelType: 'Petrol' },
            { name: 'Scania R500', licensePlate: 'FL-1003', type: 'Trailer', maxCapacity: 30000, odometer: 120000, region: 'West', acquisitionCost: 150000, fuelType: 'Diesel' },
            { name: 'Isuzu NPR', licensePlate: 'FL-3001', type: 'Refrigerated', maxCapacity: 8000, odometer: 32000, region: 'North', acquisitionCost: 65000, fuelType: 'Diesel' },
            { name: 'DAF XF', licensePlate: 'FL-1004', type: 'Flatbed', maxCapacity: 22000, odometer: 97000, region: 'South', acquisitionCost: 130000, fuelType: 'Diesel' },
            { name: 'MAN TGX', licensePlate: 'FL-1005', type: 'Tanker', maxCapacity: 28000, odometer: 110000, region: 'East', acquisitionCost: 140000, fuelType: 'Diesel' },
            { name: 'Renault Master', licensePlate: 'FL-2002', type: 'Van', maxCapacity: 4000, odometer: 28000, region: 'West', acquisitionCost: 32000, fuelType: 'Diesel' },
        ]);
        console.log(`Created ${vehicles.length} vehicles`);

        // Create drivers
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 2);
        const pastDate = new Date('2024-01-01');

        const drivers = await Driver.create([
            { name: 'John Smith', phone: '+1-555-0101', licenseNumber: 'DL-10001', licenseExpiry: futureDate, vehicleCategories: ['Truck', 'Trailer'], status: 'On Duty', safetyScore: 95 },
            { name: 'Maria Garcia', phone: '+1-555-0102', licenseNumber: 'DL-10002', licenseExpiry: futureDate, vehicleCategories: ['Van', 'Truck'], status: 'On Duty', safetyScore: 92 },
            { name: 'David Chen', phone: '+1-555-0103', licenseNumber: 'DL-10003', licenseExpiry: futureDate, vehicleCategories: ['Truck', 'Tanker', 'Flatbed'], status: 'On Duty', safetyScore: 88 },
            { name: 'Emily Johnson', phone: '+1-555-0104', licenseNumber: 'DL-10004', licenseExpiry: futureDate, vehicleCategories: ['Van', 'Refrigerated'], status: 'Off Duty', safetyScore: 97 },
            { name: 'Robert Brown', phone: '+1-555-0105', licenseNumber: 'DL-10005', licenseExpiry: pastDate, vehicleCategories: ['Truck'], status: 'On Duty', safetyScore: 78 },
            { name: 'Lisa Wilson', phone: '+1-555-0106', licenseNumber: 'DL-10006', licenseExpiry: futureDate, vehicleCategories: ['Truck', 'Trailer', 'Flatbed'], status: 'Suspended', safetyScore: 45 },
        ]);
        console.log(`Created ${drivers.length} drivers`);

        console.log('\n--- Seed Credentials ---');
        console.log('Fleet Manager:      manager@fleetflow.com    / password123');
        console.log('Dispatcher:         dispatcher@fleetflow.com / password123');
        console.log('Safety Officer:     safety@fleetflow.com     / password123');
        console.log('Financial Analyst:  analyst@fleetflow.com    / password123');
        console.log('------------------------\n');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();
