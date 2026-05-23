-- Token Expo Push registrado pelo app mobile no login.
-- Usado pelo PushNotificationService pra enviar push quando viagem é
-- criada/atribuida, CNH vencendo, etc.
ALTER TABLE "usuarios" ADD COLUMN "expo_push_token" VARCHAR(200);
