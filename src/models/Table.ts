import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { TableAttribute, TableCreationDTO } from "../types/table.type.js";

export class Table
  extends Model<TableAttribute, TableCreationDTO>
  implements TableAttribute
{
  declare public id: number;
  declare public restaurantId: number;
  declare public tableNumber: number;
  declare public capacity: number;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Table.init(
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
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "tables",
    timestamps: true,
    sequelize,
    modelName: "Table",
  }
);
