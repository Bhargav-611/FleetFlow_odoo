import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TripList from '@/pages/trips/TripList';
import TripCreate from '@/pages/trips/TripCreate';
import TripDetails from '@/pages/trips/TripDetails';

/**
 * TripsPage - Router wrapper for trip management features
 * Routes:
 *   /trips           → TripList (view all trips with filters)
 *   /trips/create    → TripCreate (create new trip with route calculation)
 *   /trips/:tripId   → TripDetails (view full trip details + complete action)
 */
export default function TripsPage() {
    return (
        <Routes>
            <Route path="/" element={<TripList />} />
            <Route path="/create" element={<TripCreate />} />
            <Route path="/:tripId" element={<TripDetails />} />
        </Routes>
    );
}
