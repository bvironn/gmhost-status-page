import type { WebhookEnvelope, WebhookHandlerResult } from '@/lib/types/webhooks';

export const ackWebhook = async (_envelope: WebhookEnvelope): Promise<WebhookHandlerResult> => {
  return {
    accepted: true,
    status: 202,
  };
};
