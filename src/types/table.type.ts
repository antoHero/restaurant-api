import { Optional } from "sequelize";

export interface TableAttribute {
    id: number;
    restaurantId: number;
    tableNumber: number;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TableCreationDTO extends Optional<TableAttribute, 'id'> {}
