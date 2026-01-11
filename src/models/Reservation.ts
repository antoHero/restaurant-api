import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import {
  ReservationAttribute,
  ReservationCreationDTO,
} from "../types/reservation.type.js";

export class Reservation
  extends Model<ReservationAttribute, ReservationCreationDTO>
  implements ReservationAttribute
{
  declare public id: number;
  declare public uniqueReference: string;
  declare public restaurantId: number;
  declare public tableId: number;
  declare public customerName: string;
  declare public status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  declare public phone: string;
  declare public partySize: number;
  declare public startDateTime: Date;
  declare public durationMinutes: number;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Reservation.init(
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
    tableId: {
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
    startDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90, // Standard 1.5 hour slot
    },
    uniqueReference: {
      type: DataTypes.STRING,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reservations",
    timestamps: true,
    sequelize,
    modelName: "Reservation",
  }
);
