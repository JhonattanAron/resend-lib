import { DynamicModule, InjectionToken, Module, Provider } from "@nestjs/common";
import { createResendMailer, ResendMailer, ResendMailerConfig } from "../mailer.js";

export const RESEND_MAILER = Symbol("RESEND_MAILER");

export interface ResendModuleAsyncOptions {
  imports?: NonNullable<DynamicModule["imports"]>;
  inject?: InjectionToken[];
  useFactory: (...dependencies: any[]) => ResendMailerConfig | Promise<ResendMailerConfig>;
}

@Module({})
export class ResendModule {
  static forRoot(config: ResendMailerConfig): DynamicModule {
    return {
      module: ResendModule,
      providers: [{ provide: RESEND_MAILER, useValue: createResendMailer(config) }],
      exports: [RESEND_MAILER],
    };
  }

  static forRootAsync(options: ResendModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      provide: RESEND_MAILER,
      inject: options.inject ?? [],
      useFactory: async (...dependencies: any[]): Promise<ResendMailer> =>
        createResendMailer(await options.useFactory(...dependencies)),
    };
    return {
      module: ResendModule,
      imports: options.imports,
      providers: [provider],
      exports: [RESEND_MAILER],
    };
  }
}

export type { ResendMailer };
