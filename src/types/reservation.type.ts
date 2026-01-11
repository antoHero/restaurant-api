import { Optional } from "sequelize";

export interface ReservationAttribute {
    id: number;
    uniqueReference: string;
    restaurantId: number;
    tableId: number;
    customerName: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    partySize: number;
    startDateTime: Date;
    durationMinutes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReservationCreationDTO extends Optional<ReservationAttribute, 'id'> {}
