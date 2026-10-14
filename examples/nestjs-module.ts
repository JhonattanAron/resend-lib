import { Inject, Injectable, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RESEND_MAILER, ResendModule, ResendMailer } from "@jhonattanaron/resend-lib/nestjs";

@Injectable()
class NotificationsService {
  constructor(@Inject(RESEND_MAILER) private readonly mailer: ResendMailer) {}
  sendWelcome(to: string) {
    return this.mailer.sendEmail({ to, subject: "Welcome", html: "<p>Thanks for joining.</p>" });
  }
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    ResendModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        apiKey: config.getOrThrow<string>("RESEND_API_KEY"),
        from: config.getOrThrow<string>("RESEND_FROM_EMAIL"),
      }),
    }),
  ],
  providers: [NotificationsService],
})
export class NotificationsModule {}
