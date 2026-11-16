import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import LoadingSpinner from '@components/LoadingSpinner/LoadingSpinner.jsx';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary.jsx';

const Panel = lazy(() => import('@pages/panel/Panel.jsx'));
const Start = lazy(() => import('@pages/start/Start.jsx'));
const LoginPage = lazy(() => import('@pages/login-page/LoginPage.jsx'));
const Elearning = lazy(() => import('@pages/elearning/Elearning.jsx'));
const PlanZajec = lazy(() => import('@pages/plan-zajec/PlanZajec.jsx'));
const MapaKampusu = lazy(() => import('@pages/mapa-kampusu/MapaKampusu.jsx'));
const Feed = lazy(() => import('@pages/feed/Feed.jsx'));
const Ustawienia = lazy(() => import('@pages/ustawienia/Ustawienia.jsx'));
const OProjekcie = lazy(() => import('@pages/o-projekcie/OProjekcie.jsx'));
const ListaZmian = lazy(() => import('@pages/lista-zmian/ListaZmian.jsx'));
const NaszZespol = lazy(() => import('@pages/nasz-zespol/NaszZespol.jsx'));
const PolitykaPrywatnosci = lazy(() => import('@pages/polityka-prywatnosci/PolitykaPrywatnosci.jsx'));
const InformacjeOCookie = lazy(() => import('@pages/informacje-o-cookie/InformacjeOCookie.jsx'));
const ZglosBlad = lazy(() => import('@pages/zglos-blad/ZglosBlad.jsx'));

const RootRedirect = () => {
  const { user, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  return user ? <Navigate to="/Panel" replace /> : <Navigate to="/Start" replace />;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/Start" element={<Start />} />
          <Route path="/LandingPage" element={<Navigate to="/Start" replace />} />
          <Route path="/Logowanie" element={<LoginPage />} />
          <Route path="/OProjekcie" element={<OProjekcie />} />
          <Route path="/NaszZespol" element={<NaszZespol />} />
          <Route path="/ListaZmian" element={<ListaZmian />} />
          <Route path="/PolitykaPrywatnosci" element={<PolitykaPrywatnosci />} />
          <Route path="/InformacjeOCookie" element={<InformacjeOCookie />} />
          <Route path="/ZglosBlad" element={<ZglosBlad />} />
          <Route path="/Panel" element={<ProtectedRoute><Panel /></ProtectedRoute>} />
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
