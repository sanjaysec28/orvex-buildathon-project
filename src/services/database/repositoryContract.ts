export interface RepositoryQueryOptions {
  limit?: number;
  orderByField?: string;
}

export interface RepositoryContract<T extends { id: string }> {
  readonly collectionName: string;
  readonly provider: 'cloud-firestore';
  readonly isConnected: false;
  describeSchema(): { collection: string; sampleKeys: Array<keyof T> };
}
