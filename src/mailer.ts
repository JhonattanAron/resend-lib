import { Resend, type CreateBatchEmailOptions, type CreateEmailOptions, type ResendOptions } from "resend";

export interface ResendMailerConfig {
  apiKey: string;
  /** Default sender, e.g. `Acme <hello@example.com>`. */
  from: string;
  resendOptions?: ResendOptions;
}

export type SendEmailInput = Omit<CreateEmailOptions, "from"> & { from?: string };
export type SendBatchEmailInput = Omit<CreateBatchEmailOptions, "from"> & { from?: string };

export class ResendMailerError extends Error {
  constructor(message: string, readonly code?: string, readonly statusCode?: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "ResendMailerError";
  }
}

/** Small reusable wrapper around the official Resend Node SDK. Use only in server-side code. */
export class ResendMailer {
  private readonly client: Resend;
  private readonly defaultFrom: string;

  constructor(config: ResendMailerConfig) {
    if (!config.apiKey?.trim()) throw new Error("RESEND_API_KEY is required");
    if (!config.from?.trim()) throw new Error("RESEND_FROM_EMAIL is required");
    this.client = new Resend(config.apiKey, config.resendOptions);
    this.defaultFrom = config.from;
  }

  /** Send HTML, text, React-rendered content, templates, and/or attachments supported by Resend. */
  async sendEmail(input: SendEmailInput, options?: { idempotencyKey?: string }) {
    const { from, ...message } = input;
    const { data, error } = await this.client.emails.send(
      { ...message, from: from ?? this.defaultFrom } as CreateEmailOptions,
      options,
    );
    if (error) {
      throw new ResendMailerError(error.message, error.name, error.statusCode ?? undefined, { cause: error });
    }
    return data;
  }

  /** Send up to the batch size allowed by Resend. Attachments are not supported by its batch endpoint. */
  async sendBatch(inputs: SendBatchEmailInput[], options?: { idempotencyKey?: string; batchValidation?: "strict" | "permissive" }) {
    if (inputs.length === 0) throw new Error("At least one email is required");
    const emails = inputs.map(({ from, ...message }) => ({ ...message, from: from ?? this.defaultFrom }));
    const { data, error } = await this.client.batch.send(emails, options);
    if (error) {
      throw new ResendMailerError(error.message, error.name, error.statusCode ?? undefined, { cause: error });
    }
    return data;
  }
}

export function createResendMailer(config: ResendMailerConfig): ResendMailer {
  return new ResendMailer(config);
}
