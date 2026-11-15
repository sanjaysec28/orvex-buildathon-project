import type { FreightCorridor } from '../../types/domain';

export const INITIAL_FREIGHT_CORRIDOR: FreightCorridor = {
  id: 'chennai-bengaluru',
  originCity: 'Chennai',
  destinationCity: 'Bengaluru',
  corridorCode: 'CHN-BLR',
  approximateDistanceKm: 350,
};

export interface MapsPlatformContract {
  readonly provider: 'google-maps-platform';
  readonly isConnected: false;
  getPrimaryCorridor(): FreightCorridor;
}

export const googleMapsContract: MapsPlatformContract = {
  provider: 'google-maps-platform',
  isConnected: false,
  getPrimaryCorridor() {
    return INITIAL_FREIGHT_CORRIDOR;
  },
};
