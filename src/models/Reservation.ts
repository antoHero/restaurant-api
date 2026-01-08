import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import {
  ReservationAttribute,
  ReservationCreationDTO,
} from "../types/reservation.type";

export class Reservation
  extends Model<ReservationAttribute, ReservationCreationDTO>
  implements ReservationAttribute
{
  public id!: number;
  public uniqueReference!: string;
  public restaurantId!: number;
  public tableId!: number;
  public customerName!: string;
  public phone!: string;
  public partySize!: number;
  public startDateTime!: Date;
  public durationMinutes!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
