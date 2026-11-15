import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialDemoShipperWorkspace } from '../../services/demo/demoDatasets.ts';
import {
  SHIPPER_MOBILE_BOTTOM_ITEMS,
  SHIPPER_SIDEBAR_ITEMS,
  isShipperPathActive,
} from './shipperNav.ts';

test('SHIPPER_SIDEBAR_ITEMS defines exact 12 navigation items in specification order', () => {
  assert.deepEqual(
    SHIPPER_SIDEBAR_ITEMS.map((item) => item.label),
    [
      'Dashboard',
      'Post a Shipment',
      'My Shipments',
      'Find Trucks',
      'Offers & Negotiations',
      'Active Bookings',
      'Live Tracking',
      'Payments & Invoices',
      'Saved Locations',
      'Notifications',
      'Document Centre',
      'Profile & Settings',
    ],
  );
  assert.equal(SHIPPER_SIDEBAR_ITEMS[0].to, '/shipper');
  assert.equal(SHIPPER_SIDEBAR_ITEMS[0].matchExact, true);
  assert.equal(SHIPPER_SIDEBAR_ITEMS[9].hasUnreadBadge, true);
});

test('SHIPPER_MOBILE_BOTTOM_ITEMS defines exact 5 mobile tabs with central Post CTA', () => {
  assert.deepEqual(
    SHIPPER_MOBILE_BOTTOM_ITEMS.map((item) => item.label),
    ['Home', 'Shipments', 'Post', 'Bookings', 'Profile'],
  );
  assert.equal(SHIPPER_MOBILE_BOTTOM_ITEMS[2].isPrimaryAction, true);
  assert.equal(SHIPPER_MOBILE_BOTTOM_ITEMS[2].to, '/shipper/post');
});

test('isShipperPathActive matches exact Dashboard root and nested subpaths cleanly', () => {
  assert.equal(isShipperPathActive('/shipper', '/shipper', true), true);
  assert.equal(isShipperPathActive('/shipper/shipments', '/shipper', true), false);
  assert.equal(isShipperPathActive('/shipper/shipments', '/shipper/shipments'), true);
  assert.equal(isShipperPathActive('/shipper/shipments/123', '/shipper/shipments'), true);
});

test('createInitialDemoShipperWorkspace provides isolated synthetic demo shipper data', () => {
  const demo = createInitialDemoShipperWorkspace();
  assert.equal(demo.profile.isDemo, true);
  assert.equal(demo.profile.role, 'shipper');
  assert.equal(demo.businessProfile.businessName, 'ORVEX Demo Traders');
  assert.equal(demo.metrics.totalShipments, 12);
  assert.equal(demo.metrics.activeBookings, 4);
  assert.equal(demo.metrics.openOffers, 6);
  assert.equal(demo.metrics.monthlySpendInr, 872000);
  assert.ok(demo.shipments.length >= 3);
  assert.ok(demo.transporters.length >= 2);
  assert.equal(demo.unreadNotificationCount, 3);
});
