import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TableAttribute, TableCreationDTO } from "../types/table.type";

export class Table
  extends Model<TableAttribute, TableCreationDTO>
  implements TableAttribute
{
  public id!: number;
  public restaurantId!: number;
  public tableNumber!: number;
  public capacity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
