/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AppRoutes from './routes';

const Layout = () => {
  const location = useLocation();
  
  const getPageTitle = (path: string) => {
    switch (path) {
      // Admin
      case '/admin': return 'Admin Dashboard';
      case '/admin/bookings': return 'Booking Monitor';
      case '/admin/owners': return 'Manage Owners';
      case '/admin/users': return 'Manage Users';
      case '/admin/reports': return 'System Reports';
      
      // Customer
      case '/customer': return 'Customer Dashboard';
      case '/customer/history': return 'Booking History';
      case '/customer/destinations': return 'Explore Destinations';
      case '/customer/invite': return 'Group Invites';
      case '/customer/payment': return 'Payments';
      case '/customer/planner': return 'Trip Planner';

      // Owner
      case '/': return 'Overview Dashboard';
      case '/destinations': return 'Destinations Hub';
      case '/transport': return 'Transport Fleet';
      case '/bookings': return 'Bookings Tracking';
      case '/messages': return 'Messaging Center';
      case '/promotions': return 'Promotions Management';
      case '/analytics': return 'Business Analytics';
      case '/financials': return 'Financial Overview';
      case '/settings': return 'Portal Settings';
      case '/destinations/new': return 'Add New Property';
      case '/transport/new': return 'Register New Vehicle';
      case '/bookings/new': return 'Create New Booking';
      case '/financials/withdraw': return 'Withdraw Funds';
      case '/promotions/new': return 'Create Promotion';
      default: return 'Partner Portal';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Header title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              <AppRoutes location={location} />
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

