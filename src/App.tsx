import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDocumentStore } from './store/documentStore';
import { WelcomeScreen } from './components/WelcomeScreen';
import EditorPage from './pages/EditorPage';
import TerminosPage from './pages/TerminosPage';
import PrivacidadPage from './pages/PrivacidadPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { documentoIniciado } = useDocumentStore();
  if (!documentoIniciado) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
