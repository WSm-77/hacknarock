import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { Logging } from './pages/Logging';
import { Dashboard } from './pages/Dashboard';
import { MeetingCreationWizard } from './pages/MeetingCreationWizard';
import { ParticipationPage } from './pages/ParticipationPage';
import './App.css';
import { MeetingDetails } from './pages/MeetingDetails';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Study Entry */}
          <Route path="/login" element={<Logging />} />
          <Route path="/logging" element={<Logging />} />

          {/* Meeting Creation - Organizer Only */}
          <Route path="/create" element={<MeetingCreationWizard />} />

          {/* Participation - Public Link */}
          <Route path="/vote/:pollId" element={<ParticipationPage />} />

          {/* Results Management */}
          <Route path="/meeting/:meetingId" element={<MeetingDetails />} />

          {/* Catch-all */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
