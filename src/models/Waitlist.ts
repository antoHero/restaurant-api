
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface WaitlistAttributes {
  id: number;
  restaurantId: number;
  customerName: string;
  phone: string;
  partySize: number;
  preferredDateTime: Date;
}

export interface WaitlistCreationAttributes extends Optional<WaitlistAttributes, 'id'> {}

export class Waitlist extends Model<WaitlistAttributes, WaitlistCreationAttributes> implements WaitlistAttributes {
  declare public id: number;
  declare public restaurantId: number;
  declare public customerName: string;
  declare public phone: string;
  declare public partySize: number;
  declare public preferredDateTime: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Waitlist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    partySize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    preferredDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'waitlists',
  }
);
