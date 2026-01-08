'use strict';

import { QueryInterface } from "sequelize";
import { RestaurantAttribute } from "../types/restaurant.type";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface: QueryInterface) {
    // Create 3 restaurant
    const now = new Date();
    await queryInterface.bulkInsert('restaurants', [
      {
        name: 'Emerald Green Foods',
        slug: 'emerald-green-foods',
        openingTime: '09:00',
        closingTime: '22:00',
        totalTables: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'The Gourmet Bistro',
        slug: 'the-gourmet-bistro',
        openingTime: '09:00',
        closingTime: '22:00',
        totalTables: 3,
        createdAt: now,
        updatedAt: now
      }
    ]);

    const restaurants = await queryInterface.sequelize.query(
      'SELECT id FROM restaurants',
      { type: 'SELECT' }
    ) as RestaurantAttribute[];

    const tables = [];

    for (const restaurant of restaurants) {
      for (let i = 1; i <= restaurant.totalTables; i++) {

        //tables of 2, 4 and 6
        let capacity = 2;
        if (i > 2 && i < 4) capacity = 4;
        if (i === 5) capacity = 6;

        tables.push({
          restaurantId: restaurant.id,
          tableNumber: i,
          capacity: capacity,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    await queryInterface.bulkInsert('tables', tables);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('tables', {});
    await queryInterface.bulkDelete('restaurants', {});
  }
};
