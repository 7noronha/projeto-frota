import { Global, Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';

/**
 * Global pra qualquer modulo poder injetar PushNotificationService sem
 * importar explicitamente. Mantém o acoplamento baixo.
 */
@Global()
@Module({
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class NotificacoesModule {}
