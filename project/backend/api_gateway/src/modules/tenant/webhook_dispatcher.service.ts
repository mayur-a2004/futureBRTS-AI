import axios from 'axios';

export interface WebhookEventPayload {
  event: 'HOMEWORK_GRADED' | 'QUIZ_FINISHED' | 'ATTENDANCE_LOCKED';
  tenantId: string;
  externalId: string;
  studentName?: string;
  subject?: string;
  chapter?: string;
  scoreObtained?: number;
  maxScore?: number;
  gradedAt: string;
  meta?: Record<string, any>;
}

export class WebhookDispatcherService {
  /**
   * Dispatch asynchronous HTTP POST event payload to ERP Webhook Target URL
   */
  static async dispatchEvent(webhookUrl: string, payload: WebhookEventPayload): Promise<boolean> {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      console.warn(`[WebhookDispatcher] No valid webhook URL provided for event ${payload.event}. Skipping.`);
      return false;
    }

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FutureBRTS-AI-Platform/1.0'
        },
        timeout: 5000 // 5 second timeout to prevent blocking worker
      });

      console.log(`[WebhookDispatcher] Successfully dispatched ${payload.event} to ${webhookUrl}. Status: ${response.status}`);
      return true;
    } catch (error: any) {
      console.error(`[WebhookDispatcher] Failed to dispatch ${payload.event} to ${webhookUrl}: ${error.message}`);
      return false;
    }
  }
}
