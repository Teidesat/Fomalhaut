// Se han cambiado reflejando el LogSchema del servidor central
export interface Log {
  id: number;
  timestamp: string;
  level: string;
  logger: string;
  module: string;
  function: string;
  message: string;
  request_method?: string | null;
  request_path?: string | null;
  request_status_code?: number | null;
  request_client_ip?: string | null;
  request_user?: string | null;
  exception_type?: string | null;
  exception_message?: string | null;
  exception_stack_trace?: string | null;
  extra_data?: Record<string, unknown> | null;
}
