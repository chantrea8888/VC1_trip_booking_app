import React from 'react';
import { Routes, Route, Location } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminBookingMonitor from '../pages/admin/BookingMonitor';
import ManageOwners from '../pages/admin/ManageOwners';
import ManageUsers from '../pages/admin/ManageUsers';
import SystemReports from '../pages/admin/SystemReports';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import BookingHistory from '../pages/customer/BookingHistory';
import CustomerDestinations from '../pages/customer/Destinations';
import GroupInvite from '../pages/customer/GroupInvite';
import Payment from '../pages/customer/Payment';
import TripPlanner from '../pages/customer/TripPlanner';

// Owner Pages
import OwnerDashboard from '../pages/owner/Dashboard';
import OwnerDestinations from '../pages/owner/Destinations';
import OwnerTransport from '../pages/owner/Transport';
import OwnerBookings from '../pages/owner/Bookings';
import OwnerMessages from '../pages/owner/Messages';
import OwnerPromotions from '../pages/owner/Promotions';
import OwnerAnalytics from '../pages/owner/Analytics';
import OwnerFinancials from '../pages/owner/Financials';
import OwnerSettings from '../pages/owner/Settings';
import AddProperty from '../pages/owner/AddProperty';
import EditProperty from '../pages/owner/EditProperty';
import PropertyDetail from '../pages/owner/PropertyDetail';
import AddRoom from '../pages/owner/AddRoom';
import RegisterVehicle from '../pages/owner/RegisterVehicle';
import NewBooking from '../pages/owner/NewBooking';
import WithdrawFunds from '../pages/owner/WithdrawFunds';
import CreatePromotion from '../pages/owner/CreatePromotion';

const AppRoutes = ({ location }: { location: any }) => {
  return (
    <Routes location={location}>
      {/* Admin Routes */}
      <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
      <Route path="/admin/bookings" element={<PageWrapper><AdminBookingMonitor /></PageWrapper>} />
      <Route path="/admin/owners" element={<PageWrapper><ManageOwners /></PageWrapper>} />
      <Route path="/admin/users" element={<PageWrapper><ManageUsers /></PageWrapper>} />
      <Route path="/admin/reports" element={<PageWrapper><SystemReports /></PageWrapper>} />

      {/* Customer Routes */}
      <Route path="/customer" element={<PageWrapper><CustomerDashboard /></PageWrapper>} />
      <Route path="/customer/history" element={<PageWrapper><BookingHistory /></PageWrapper>} />
      <Route path="/customer/destinations" element={<PageWrapper><CustomerDestinations /></PageWrapper>} />
      <Route path="/customer/invite" element={<PageWrapper><GroupInvite /></PageWrapper>} />
      <Route path="/customer/payment" element={<PageWrapper><Payment /></PageWrapper>} />
      <Route path="/customer/planner" element={<PageWrapper><TripPlanner /></PageWrapper>} />

      {/* Owner Routes (Existing) */}
      <Route path="/" element={<PageWrapper><OwnerDashboard /></PageWrapper>} />
      <Route path="/destinations" element={<PageWrapper><OwnerDestinations /></PageWrapper>} />
      <Route path="/transport" element={<PageWrapper><OwnerTransport /></PageWrapper>} />
      <Route path="/bookings" element={<PageWrapper><OwnerBookings /></PageWrapper>} />
      <Route path="/messages" element={<PageWrapper><OwnerMessages /></PageWrapper>} />
      <Route path="/promotions" element={<PageWrapper><OwnerPromotions /></PageWrapper>} />
      <Route path="/analytics" element={<PageWrapper><OwnerAnalytics /></PageWrapper>} />
      <Route path="/financials" element={<PageWrapper><OwnerFinancials /></PageWrapper>} />
      <Route path="/settings" element={<PageWrapper><OwnerSettings /></PageWrapper>} />
      <Route path="/destinations/new" element={<PageWrapper><AddProperty /></PageWrapper>} />
      <Route path="/destinations/:id" element={<PageWrapper><PropertyDetail /></PageWrapper>} />
      <Route path="/destinations/:id/add-room" element={<PageWrapper><AddRoom /></PageWrapper>} />
      <Route path="/destinations/edit/:id" element={<PageWrapper><EditProperty /></PageWrapper>} />
      <Route path="/transport/new" element={<PageWrapper><RegisterVehicle /></PageWrapper>} />
      <Route path="/bookings/new" element={<PageWrapper><NewBooking /></PageWrapper>} />
      <Route path="/financials/withdraw" element={<PageWrapper><WithdrawFunds /></PageWrapper>} />
      <Route path="/promotions/new" element={<PageWrapper><CreatePromotion /></PageWrapper>} />
    </Routes>
  );
};

export default AppRoutes;
