export interface Log {
  id: number;
  level: string;
  message: string;
  timestamp: string;
  logger: string;
  module: string;
  function: string;
  request_client_ip: string;
  request_status_code: number;
  request_path: string;
  request_user: string;
  exception_type: string;
  exception_stack_trace: string;
  extra_data: Record<string, any>;
}