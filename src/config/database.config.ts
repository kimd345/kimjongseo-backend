// src/config/database.config.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Menu } from '../entities/menu.entity';
import { Content } from '../entities/content.entity';
import { FileUpload } from '../entities/file-upload.entity';

export const createDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_NAME', 'kimjongseo_db'),
    entities: [User, Menu, Content, FileUpload],
    migrations: ['dist/migrations/*.js'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
  });
};

// Default export for TypeORM CLI
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'kimjongseo_db',
  entities: [User, Menu, Content, FileUpload],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.NODE_ENV === 'development',
});

export default dataSource;
