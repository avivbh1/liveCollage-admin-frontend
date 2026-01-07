import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './auth/LoginPage';
import { Layout } from './components/Layout';
import { EventsListPage } from './events/EventsListPage';
import { EventDashboardPage } from './events/EventDashboardPage';
import { LiveWallPage } from './live-wall/LiveWallPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:eventId" element={<EventDashboardPage />} />
          </Route>

          {/* Live Wall is standalone (maybe specific auth or public for now? User said "Admin Only" so probably protected, but usually displayed on big screen where admin is logged in) */}
          <Route path="/wall/:eventId" element={
            <RequireAuth>
              <LiveWallPage />
            </RequireAuth>
          } />

          <Route path="/" element={<Navigate to="/events" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
