import { Optional } from "sequelize";

export interface RestaurantAttribute {
    id: number;
    name: string;
    slug: string;
    openingTime: string;
    closingTime: string;
    totalTables: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface RestaurantCreationDTO extends Optional<RestaurantAttribute, 'id'> {}


