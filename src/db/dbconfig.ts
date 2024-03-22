import { DataSourceOptions, DataSource } from 'typeorm';
import {config} from "dotenv";
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.PORT),
  database:process.env.DB,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  logging: false,
  timezone:"+00:00"
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
