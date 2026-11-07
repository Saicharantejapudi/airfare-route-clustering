import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import PassengerGuidePage from './pages/PassengerGuidePage';
import AcademicOverviewPage from './pages/AcademicOverviewPage';
import ExplorerPage from './pages/ExplorerPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import PCASpacePage from './pages/PCASpacePage';
import ArchetypesPage from './pages/ArchetypesPage';
import PredictPage from './pages/PredictPage';

function App() {
  return (
    <ModeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-aviation-500 selection:text-white">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/passenger-guide" element={<PassengerGuidePage />} />
              <Route path="/academic/overview" element={<AcademicOverviewPage />} />
              <Route path="/explorer" element={<ExplorerPage />} />
              <Route path="/diagnostics" element={<DiagnosticsPage />} />
              <Route path="/pca-space" element={<PCASpacePage />} />
              <Route path="/archetypes" element={<ArchetypesPage />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ModeProvider>
  );
}

export default App;
