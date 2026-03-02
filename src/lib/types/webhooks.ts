export type WebhookProvider = 'unknown';

export interface WebhookEnvelope<TPayload = unknown> {
  provider: WebhookProvider;
  event: string;
  receivedAt: string;
  payload: TPayload;
}

export interface WebhookHandlerResult {
  accepted: boolean;
  status: number;
  message?: string;
}
