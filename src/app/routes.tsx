import { Route, Routes } from 'react-router-dom';
import { AuthFoundationPage } from '../features/authentication/AuthFoundationPage';
import { AuthRecoveryFoundationPage } from '../features/authentication/AuthRecoveryFoundationPage';
import { ApplicationStatusPage } from '../features/registration/ApplicationStatusPage';
import { TransporterRegistrationPage } from '../features/registration/TransporterRegistrationPage';
import { LanguageSelectionPage } from '../features/language/LanguageSelectionPage';
import { RoleSelectionPage } from '../features/role/RoleSelectionPage';
import { ShipperAuthGuard } from '../features/shipper/ShipperAuthGuard';
import { ShipperHomePage } from '../features/shipper/ShipperHomePage';
import { ShipperPostShipmentPage } from '../features/shipper/ShipperPostShipmentPage';
import { ShipperProfilePage } from '../features/shipper/ShipperProfilePage';
import { ShipperShipmentsPage } from '../features/shipper/ShipperShipmentsPage';
import {
  ShipperBookingsPage,
  ShipperDocumentsPage,
  ShipperFindTrucksPage,
  ShipperLocationsPage,
  ShipperNotificationsPage,
  ShipperOffersPage,
  ShipperPaymentsPage,
  ShipperTrackingPage,
} from '../features/shipper/ShipperWorkspacePages';
import { ShipperApplicationSubmittedPage } from '../features/shipperRegistration/ShipperApplicationSubmittedPage';
import { ShipperRegistrationPage } from '../features/shipperRegistration/ShipperRegistrationPage';
import { SplashScreenPage } from '../features/splash/SplashScreenPage';
import { TransporterAuthGuard } from '../features/transporterDashboard/components/TransporterAuthGuard';
import { TransporterAvailabilityPage } from '../features/transporterDashboard/pages/TransporterAvailabilityPage';
import { TransporterDashboardPage } from '../features/transporterDashboard/pages/TransporterDashboardPage';
import { TransporterDocumentsPage } from '../features/transporterDashboard/pages/TransporterDocumentsPage';
import { TransporterDriversPage } from '../features/transporterDashboard/pages/TransporterDriversPage';
import { TransporterEarningsPage } from '../features/transporterDashboard/pages/TransporterEarningsPage';
import { TransporterLoadDetailPage } from '../features/transporterDashboard/pages/TransporterLoadDetailPage';
import { TransporterLoadsPage } from '../features/transporterDashboard/pages/TransporterLoadsPage';
import { TransporterNotificationsPage } from '../features/transporterDashboard/pages/TransporterNotificationsPage';
import { TransporterOffersPage } from '../features/transporterDashboard/pages/TransporterOffersPage';
import { TransporterProfileSubPage } from '../features/transporterDashboard/pages/TransporterProfileSubPage';
import { TransporterTrackingPage } from '../features/transporterDashboard/pages/TransporterTrackingPage';
import { TransporterTripsSubPage } from '../features/transporterDashboard/pages/TransporterTripsSubPage';
import { TransporterVehiclesPage } from '../features/transporterDashboard/pages/TransporterVehiclesPage';
import { NotFoundPage } from './NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreenPage />} />
      <Route path="/language" element={<LanguageSelectionPage />} />
      <Route path="/role" element={<RoleSelectionPage />} />
      <Route path="/auth" element={<AuthFoundationPage />} />
      <Route path="/auth/forgot-password" element={<AuthRecoveryFoundationPage />} />
      <Route path="/auth/register" element={<TransporterRegistrationPage />} />
      <Route path="/auth/register/status" element={<ApplicationStatusPage />} />

      <Route path="/shipper/register" element={<ShipperRegistrationPage />} />
      <Route
        path="/shipper/application-submitted"
        element={<ShipperApplicationSubmittedPage />}
      />

      <Route path="/transporter" element={<TransporterAuthGuard />}>
        <Route index element={<TransporterDashboardPage />} />
        <Route path="vehicles" element={<TransporterVehiclesPage />} />
        <Route path="drivers" element={<TransporterDriversPage />} />
        <Route path="loads" element={<TransporterLoadsPage />} />
        <Route path="loads/:loadId" element={<TransporterLoadDetailPage />} />
        <Route path="availability" element={<TransporterAvailabilityPage />} />
        <Route path="trips" element={<TransporterTripsSubPage />} />
        <Route path="offers" element={<TransporterOffersPage />} />
        <Route path="earnings" element={<TransporterEarningsPage />} />
        <Route path="tracking" element={<TransporterTrackingPage />} />
        <Route path="notifications" element={<TransporterNotificationsPage />} />
        <Route path="documents" element={<TransporterDocumentsPage />} />
        <Route path="profile" element={<TransporterProfileSubPage />} />
      </Route>

      <Route path="/shipper" element={<ShipperAuthGuard />}>
        <Route index element={<ShipperHomePage />} />
        <Route path="post" element={<ShipperPostShipmentPage />} />
        <Route path="shipments" element={<ShipperShipmentsPage />} />
        <Route path="trucks" element={<ShipperFindTrucksPage />} />
        <Route path="offers" element={<ShipperOffersPage />} />
        <Route path="bookings" element={<ShipperBookingsPage />} />
        <Route path="tracking" element={<ShipperTrackingPage />} />
        <Route path="payments" element={<ShipperPaymentsPage />} />
        <Route path="locations" element={<ShipperLocationsPage />} />
        <Route path="notifications" element={<ShipperNotificationsPage />} />
        <Route path="documents" element={<ShipperDocumentsPage />} />
        <Route path="profile" element={<ShipperProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
