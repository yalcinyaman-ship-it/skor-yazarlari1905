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
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] font-sans antialiased">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tahmin" element={<PredictionPage />} />
        </Routes>
      </div>
    </Router>
  );
}
