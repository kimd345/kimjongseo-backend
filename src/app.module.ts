// src/app.module.ts - Fixed version
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { ContentModule } from './content/content.module';
import { UploadModule } from './upload/upload.module';
import { AuthService } from './auth/auth.service';
import { MenuService } from './menu/menu.service';

// Import entities explicitly
import { User } from './entities/user.entity';
import { Menu } from './entities/menu.entity';
import { Content } from './entities/content.entity';
import { FileUpload } from './entities/file-upload.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('Database config:', {
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          database: configService.get('database.name'),
        });

        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          entities: [User, Menu, Content, FileUpload], // Explicit entity import
          synchronize: true, // This should create tables automatically
          logging: ['query', 'error'], // Enable detailed logging
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    MenuModule,
    ContentModule,
    UploadModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private menuService: MenuService,
  ) {}

  async onModuleInit() {
    try {
      console.log('Initializing application...');

      // Add delay to ensure database connection is established
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Initialize default data
      await this.authService.createInitialAdmin();
      await this.menuService.seedDefaultMenus();

      console.log('Application initialization complete');
    } catch (error) {
      console.error('Error during application initialization:', error);
      // Don't throw error to prevent app crash
    }
  }
}
