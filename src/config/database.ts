import { Sequelize } from "sequelize";
import * as dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

export default sequelize;