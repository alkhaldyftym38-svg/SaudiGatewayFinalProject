import { useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Heritage from './pages/Heritage';
import HeritageDetail from './pages/HeritageDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Investment from './pages/Investment';
import About from './pages/About';
import Support from './pages/Support';
import Favorites from './pages/Favorites';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHeritage from './pages/admin/AdminHeritage';
import AdminHeritageForm from './pages/admin/AdminHeritageForm';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRatings from './pages/admin/AdminRatings';
import AdminInvestment from './pages/admin/AdminInvestment';
import AdminInvestmentSectorForm from './pages/admin/AdminInvestmentSectorForm';
import AdminInvestmentStepForm from './pages/admin/AdminInvestmentStepForm';
import AdminInvestmentGoalForm from './pages/admin/AdminInvestmentGoalForm';
import AdminSiteSettings from './pages/admin/AdminSiteSettings';
import NotFound from './pages/NotFound';
import Assistant from './pages/Assistant';

import { EVENTS_FOCUS_KEY, HERITAGE_FOCUS_KEY } from './lib/adminFocus';
import AdminEventsForm from './pages/admin/AdminEventsForm';

function ScrollToTop() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    const pendingFocus = state?.focusId
      || sessionStorage.getItem(HERITAGE_FOCUS_KEY)
      || sessionStorage.getItem(EVENTS_FOCUS_KEY);
    if (pendingFocus) return;
    window.scrollTo(0, 0);
  }, [pathname, state?.focusId]);
  return null;
}


export default function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar />
      <ScrollToTop />
      <main className={`flex-1 bg-surface ${location.pathname === '/assistant' ? 'overflow-hidden' : ''}`}>
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/heritage" element={<Heritage />} />
              <Route path="/heritage/:id" element={<HeritageDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/investment" element={<Investment />} />
              <Route path="/about" element={<About />} />
              <Route path="/support" element={<Support />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/heritage" element={<AdminRoute><Outlet /></AdminRoute>}>
                <Route index element={<AdminHeritage />} />
                <Route path="new" element={<AdminHeritageForm />} />
                <Route path=":id/edit" element={<AdminHeritageForm />} />
              </Route>
              <Route path="/admin/events" element={<AdminRoute><Outlet /></AdminRoute>}>
                <Route index element={<AdminEvents />} />
                <Route path="new" element={<AdminEventsForm />} />
                <Route path=":id/edit" element={<AdminEventsForm />} />
              </Route>
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/ratings" element={<AdminRoute><AdminRatings /></AdminRoute>} />
              <Route path="/admin/site" element={<AdminRoute><AdminSiteSettings /></AdminRoute>} />
              <Route path="/admin/investment" element={<AdminRoute><Outlet /></AdminRoute>}>
                <Route index element={<AdminInvestment />} />
                <Route path="sectors/new" element={<AdminInvestmentSectorForm />} />
                <Route path="sectors/:id/edit" element={<AdminInvestmentSectorForm />} />
                <Route path="steps/new" element={<AdminInvestmentStepForm />} />
                <Route path="steps/:step/edit" element={<AdminInvestmentStepForm />} />
                <Route path="goals/new" element={<AdminInvestmentGoalForm />} />
                <Route path="goals/:id/edit" element={<AdminInvestmentGoalForm />} />
              </Route>
              <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {location.pathname !== '/assistant' && <Footer />}
    </div>
  );
}
