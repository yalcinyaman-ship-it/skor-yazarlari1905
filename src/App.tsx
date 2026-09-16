/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PredictionPage from './pages/PredictionPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#080C14] text-[#F1F5F9] font-sans antialiased selection:bg-blue-500/30 selection:text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tahmin" element={<PredictionPage />} />
        </Routes>
      </div>
    </Router>
  );
}
