import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOppositeRole,
  getWorkspaceBasePath,
  isRouteInRoleWorkspace,
  resolveRoleFromPath,
} from './roleRouting';

test('getWorkspaceBasePath returns strict role workspace roots', () => {
  assert.equal(getWorkspaceBasePath('transporter'), '/transporter');
  assert.equal(getWorkspaceBasePath('shipper'), '/shipper');
});

test('resolveRoleFromPath isolates transporter and shipper workspaces', () => {
  assert.equal(resolveRoleFromPath('/transporter'), 'transporter');
  assert.equal(resolveRoleFromPath('/transporter/trips'), 'transporter');
  assert.equal(resolveRoleFromPath('/shipper'), 'shipper');
  assert.equal(resolveRoleFromPath('/shipper/shipments'), 'shipper');
  assert.equal(resolveRoleFromPath('/'), null);
  assert.equal(resolveRoleFromPath('/auth'), null);
});

test('getOppositeRole toggles cleanly between transporter and shipper', () => {
  assert.equal(getOppositeRole('transporter'), 'shipper');
  assert.equal(getOppositeRole('shipper'), 'transporter');
  assert.equal(isRouteInRoleWorkspace('/transporter/profile', 'transporter'), true);
  assert.equal(isRouteInRoleWorkspace('/transporter/profile', 'shipper'), false);
});
