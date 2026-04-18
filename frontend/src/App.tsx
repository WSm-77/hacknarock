import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { MeetingCreationWizard } from './pages/MeetingCreationWizard';
import { ParticipationPage } from './pages/ParticipationPage';
import { MeetingManagementResults } from './pages/MeetingManagementResults';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Meeting Creation - Organizer Only */}
          <Route path="/create" element={<MeetingCreationWizard />} />

          {/* Participation - Public Link */}
          <Route path="/vote/:pollId" element={<ParticipationPage />} />

          {/* Results Management */}
          <Route path="/meeting/:meetingId" element={<MeetingManagementResults />} />

          {/* Catch-all */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
