export interface ApiClientConfig {
  baseUrl: string | null;
  timeoutMs: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface FastApiBackendContract {
  readonly serviceTarget: 'python-fastapi-cloud-run';
  readonly isConnected: false;
  getConfig(): ApiClientConfig;
}

export const fastApiBackendContract: FastApiBackendContract = {
  serviceTarget: 'python-fastapi-cloud-run',
  isConnected: false,
  getConfig() {
    return {
      baseUrl: null,
      timeoutMs: 15000,
    };
  },
};
