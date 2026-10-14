# resend-lib

Biblioteca reutilizable para enviar correos transaccionales desde aplicaciones Node.js con el SDK oficial de Resend. Incluye envío individual, lotes, adjuntos, claves de idempotencia y un módulo opcional para NestJS. El contenido, las plantillas, el idioma y las reglas de negocio quedan bajo control de cada aplicación.

## Instalación desde GitHub

```bash
npm install git+https://github.com/JhonattanAron/resend-lib.git
```

Para instalar la integración de NestJS, instala también `@nestjs/common` (la mayoría de apps Nest ya lo tiene). El paquete `resend` se instala como dependencia.

## Variables de entorno

```dotenv
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Mi Aplicación <hola@tudominio.com>
```

Crea la API Key desde Resend y verifica el dominio remitente antes de enviar a tus destinatarios. El valor de `RESEND_FROM_EMAIL` debe usar un dominio autorizado. No guardes la clave en frontend, variables `NEXT_PUBLIC_*` ni el repositorio.

## Node.js: enviar un correo

```ts
import { createResendMailer } from "@jhonattanaron/resend-lib";

const mailer = createResendMailer({
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.RESEND_FROM_EMAIL!,
});

const sent = await mailer.sendEmail({
  to: "cliente@example.com",
  subject: "Tu recibo está listo",
  html: "<p>Adjuntamos tu recibo.</p>",
  attachments: [{ filename: "recibo.pdf", content: pdfBuffer }],
}, {
  idempotencyKey: "receipt/order-123",
});

console.log(sent?.id);
```

La librería acepta las opciones de email compatibles con el SDK oficial de Resend, incluyendo `to`, `cc`, `bcc`, `replyTo`, `text`, `html`, `react`, `attachments`, `headers`, `tags` y `scheduledAt`. Puedes sobrescribir el `from` por mensaje. Si Resend devuelve un error, `sendEmail` lanza `ResendMailerError` con código y estado cuando están disponibles.

Usa una clave de idempotencia estable por evento de negocio al reintentar envíos para reducir correos duplicados. Resend conserva las claves de idempotencia por un periodo limitado; revisa sus límites vigentes antes de diseñar reintentos de larga duración.

## Envío por lotes

```ts
const result = await mailer.sendBatch([
  { to: "uno@example.com", subject: "Aviso", html: "<p>Mensaje para uno</p>" },
  { to: "dos@example.com", subject: "Aviso", html: "<p>Mensaje para dos</p>" },
]);
```

El endpoint batch de Resend no acepta adjuntos ni fecha programada. Consulta los límites vigentes de tamaño de lote y envía adjuntos con `sendEmail` individual.

## NestJS

```ts
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ResendModule } from "@jhonattanaron/resend-lib/nestjs";

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
})
export class AppModule {}
```

Inyecta el servicio con `@Inject(RESEND_MAILER) private readonly mailer: ResendMailer` y usa `mailer.sendEmail(...)`. También puedes llamar `ResendModule.forRoot(config)` cuando ya tienes la configuración disponible.

## API pública

- `createResendMailer(config)` y `ResendMailer` — cliente servidor reutilizable.
- `sendEmail(message, options?)` — correo individual, con soporte de las opciones del SDK.
- `sendBatch(messages, options?)` — lotes sin adjuntos ni programación.
- `ResendMailerError` — error con mensaje, código y estado HTTP cuando Resend los devuelve.
- `ResendModule`, `RESEND_MAILER` — integración NestJS opcional desde `@jhonattanaron/resend-lib/nestjs`.

## Plantillas y seguridad

Crea y versiona las plantillas en cada aplicación o en un paquete de diseño propio. Esta librería solo transporta el mensaje que le entregues; no escapa automáticamente HTML ni valida enlaces/códigos incluidos en plantillas. Escapa entradas no confiables y no incluyas claves, tokens de acceso u otros secretos en el contenido del correo.

## Ejemplos

- [`examples/send-email.ts`](examples/send-email.ts): correo individual con adjunto e idempotencia.
- [`examples/nestjs-module.ts`](examples/nestjs-module.ts): configuración e inyección en NestJS.

## Apóyame

Si esta librería te resulta útil, puedes seguirme en [Instagram](https://www.instagram.com/jhonattan_aron/).

## Licencia

MIT. Consulta [`LICENSE`](LICENSE).
