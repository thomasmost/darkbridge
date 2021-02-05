import 'mysql2';
import { Sequelize } from 'sequelize';

const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT } = process.env;

if (!MYSQL_HOST || !MYSQL_PORT || !MYSQL_USERNAME || !MYSQL_PASSWORD) {
  throw Error('Missing config');
}

export const sequelize = new Sequelize({
  database: 'teddy',
  dialect: 'mysql',
  host: MYSQL_HOST,
  port: parseInt(MYSQL_PORT),
  username: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
});
