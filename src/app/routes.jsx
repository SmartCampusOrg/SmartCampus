import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import LoadingSpinner from '@components/LoadingSpinner/LoadingSpinner.jsx';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary.jsx';

const Panel = lazy(() => import('@pages/panel/Panel.jsx'));
const LandingPage = lazy(() => import('@pages/landing-page/LandingPage.jsx'));
const LoginPage = lazy(() => import('@pages/login-page/LoginPage.jsx'));
const Elearning = lazy(() => import('@pages/elearning/Elearning.jsx'));
const PlanZajec = lazy(() => import('@pages/plan-zajec/PlanZajec.jsx'));
const MapaKampusu = lazy(() => import('@pages/mapa-kampusu/MapaKampusu.jsx'));
const Feed = lazy(() => import('@pages/feed/Feed.jsx'));
const Ustawienia = lazy(() => import('@pages/ustawienia/Ustawienia.jsx'));
const OProjekcie = lazy(() => import('@pages/o-projekcie/OProjekcie.jsx'));
const ListaZmian = lazy(() => import('@pages/lista-zmian/ListaZmian.jsx'));
const NaszZespol = lazy(() => import('@pages/nasz-zespol/NaszZespol.jsx'));

const RootRedirect = () => {
  const { user, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  return user ? <Navigate to="/Panel" replace /> : <Navigate to="/LandingPage" replace />;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/Logowanie" element={<LoginPage />} />
          <Route path="/OProjekcie" element={<OProjekcie />} />
          <Route path="/NaszZespol" element={<NaszZespol />} />
          <Route path="/Panel" element={<ProtectedRoute><Panel /></ProtectedRoute>} />
          <Route path="/ListaZmian" element={<ProtectedRoute><ListaZmian /></ProtectedRoute>} />
          <Route path="/MapaKampusu" element={<ProtectedRoute><MapaKampusu /></ProtectedRoute>} />
          <Route path="/Elearning" element={<ProtectedRoute><Elearning /></ProtectedRoute>} />
          <Route path="/Feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/PlanZajec" element={<ProtectedRoute><PlanZajec /></ProtectedRoute>} />
          <Route path="/PlanLekcji" element={<Navigate to="/PlanZajec" replace />} />
          <Route path="/Ustawienia" element={<ProtectedRoute><Ustawienia /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
