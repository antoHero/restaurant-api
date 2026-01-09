import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import {
  RestaurantAttribute,
  RestaurantCreationDTO,
} from "../types/restaurant.type";

export class Restaurant
  extends Model<RestaurantAttribute, RestaurantCreationDTO>
  implements RestaurantAttribute
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public openingTime!: string;
  public closingTime!: string;
  public totalTables!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Restaurant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "slug",
      unique: true,
    },
    openingTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "opening_time",
      defaultValue: "09:00",
    },
    closingTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "closing_time",
      defaultValue: "22:00",
    },
    totalTables: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "total_tables",
      validate: {
        min: 1,
      },
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
    tableName: "restaurants",
    timestamps: true,
    sequelize,
    modelName: "Restaurant",
  }
);
