import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SiteShell } from '@/components/mcedit/SiteShell';
import ApkDownloadsPage from '@/pages/ApkDownloadsPage';
import HomePage from '@/pages/HomePage';
import PcDownloadsPage from '@/pages/PcDownloadsPage';

const App = () => (
  <BrowserRouter>
    <SiteShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apks" element={<ApkDownloadsPage />} />
        <Route path="/pc" element={<PcDownloadsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteShell>
  </BrowserRouter>
);

export default App;