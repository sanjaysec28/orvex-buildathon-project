import { Route, Routes } from 'react-router-dom';
import { AuthFoundationPage } from '../features/authentication/AuthFoundationPage';
import { LanguageSelectionPage } from '../features/language/LanguageSelectionPage';
import { RoleSelectionPage } from '../features/role/RoleSelectionPage';
import { ShipperHomePage } from '../features/shipper/ShipperHomePage';
import { ShipperProfilePage } from '../features/shipper/ShipperProfilePage';
import { ShipperShipmentsPage } from '../features/shipper/ShipperShipmentsPage';
import { SplashScreenPage } from '../features/splash/SplashScreenPage';
import { TransporterHomePage } from '../features/transporter/TransporterHomePage';
import { TransporterProfilePage } from '../features/transporter/TransporterProfilePage';
import { TransporterTripsPage } from '../features/transporter/TransporterTripsPage';
import { NotFoundPage } from './NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreenPage />} />
      <Route path="/language" element={<LanguageSelectionPage />} />
      <Route path="/role" element={<RoleSelectionPage />} />
      <Route path="/auth" element={<AuthFoundationPage />} />

      <Route path="/transporter" element={<TransporterHomePage />} />
      <Route path="/transporter/trips" element={<TransporterTripsPage />} />
      <Route path="/transporter/profile" element={<TransporterProfilePage />} />

      <Route path="/shipper" element={<ShipperHomePage />} />
      <Route path="/shipper/shipments" element={<ShipperShipmentsPage />} />
      <Route path="/shipper/profile" element={<ShipperProfilePage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
