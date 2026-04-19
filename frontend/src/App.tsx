import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { Logging } from './pages/Logging';
import { Dashboard } from './pages/Dashboard';
import { MeetingCreationWizard } from './pages/MeetingCreationWizard';
import { ParticipationPage } from './pages/ParticipationPage';
import { MeetingManagementResults } from './pages/MeetingManagementResults';
import { ParticipantAvailabilityPage } from './pages/ParticipantAvailabilityPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './App.css';
import { MeetingDetails } from './pages/MeetingDetails';
import { MeetingConfirmation } from './pages/MeetingConfirmation';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/polls" element={<Dashboard />} />

          {/* Study Entry */}
          <Route path="/login" element={<Logging />} />
          <Route path="/logging" element={<Logging />} />

          {/* Meeting Creation - Organizer Only */}
          <Route path="/create" element={<MeetingCreationWizard />} />

          {/* Participation - Public Link */}
          <Route path="/vote/:pollId" element={<ParticipationPage />} />

          {/* Participant Availability - Authenticated Link */}
          <Route
            path="/meetings/join/:publicToken"
            element={(
              <ProtectedRoute>
                <ParticipantAvailabilityPage />
              </ProtectedRoute>
            )}
          />

          {/* Results Management */}
          <Route path="/:meetingId/details" element={<MeetingDetails />} />
          <Route path="/:meetingId" element={<MeetingDetails />} />
          <Route path="/meeting/:meetingId/details" element={<MeetingDetails />} />
          <Route path="/meeting/:meetingId" element={<MeetingDetails />} />
          <Route path="/meeting-confirmation" element={<MeetingConfirmation />} />

          {/* Catch-all */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
