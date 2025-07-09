import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BackupService implements OnModuleInit {
  onModuleInit() {
    // ⚠️ Programado para ejecutarse cada minuto (para pruebas). Cambia a '0 2 * * *' para diario a las 2AM.
    cron.schedule('*/5 * * * *', () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Ruta base para guardar backups (puede ser un volumen montado como /app/backups)
      const backupBasePath = path.resolve('/app/backups'); // Cambia si lo necesitas en local
      const backupDir = path.join(backupBasePath, `backup-${timestamp}`);

      // Asegura que el directorio exista
      fs.mkdirSync(backupDir, { recursive: true });

      const dbUri = process.env.MONGODB_URI_CLOUD || 'mongodb://localhost/geolocalizacion';
      const cmd = `mongodump --uri="${dbUri}" --out="${backupDir}"`;

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Error durante backup:', err.message);
          console.error(stderr);
          return;
        }
        console.log(`✅ Backup exitoso guardado en: ${backupDir}`);
      });
    });

    console.log('🕑 Cron de backup programado (cada minuto para pruebas)');
  }
}
