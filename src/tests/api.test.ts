import request from 'supertest';
import app from '../server.js';
import { sequelize, Restaurant, Table } from '../models/index.js';

describe('Testing Restaurant Reservation API Critical Endpoints', () => {
  let slug = 'test-bistro';

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    await Restaurant.create({
      name: 'Test Bistro',
      slug: slug,
      openingTime: '09:00',
      closingTime: '22:00',
      totalTables: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await Table.create({
      restaurantId: 1,
      tableNumber: 1,
      capacity: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });


  it('POST /api/reservations - should create a reservation and block double-booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const reservationData = {
      slug: slug,
      customerName: 'John Doe',
      phone: '1234567890',
      partySize: 2,
      startDateTime: tomorrow.toISOString(),
      durationMinutes: 60
    };

    // First booking should succeed
    const res1: any = await (request(app) as any)
      .post('/api/reservations')
      .send(reservationData);
    
    expect(res1.status).toBe(201);
    expect(res1.body.data).toHaveProperty('uniqueReference');

    // Second booking (overlapping) should fail
    const res2: any = await (request(app) as any)
      .post('/api/reservations')
      .send(reservationData);
    
    expect(res2.status).toBe(400);
    expect(res2.body.error).toContain('Double booking detected');
  });

  
  it('GET /api/reservations/slots - should return valid time slots', async () => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const dateString = tomorrowDate.toISOString().split('T')[0];

    const res: any = await (request(app) as any)
      .get('/api/reservations/slots')
      .query({
        slug: slug,
        partySize: '2',
        date: dateString
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
    if (res.body.slots.length > 0) {
      expect(res.body.slots[0]).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }
  });

  it('POST /api/restaurants/:slug/tables - should add a new table', async () => {

    const res: any = await (request(app) as any)
      .post(`/api/restaurants/${slug}/tables`)
      .send({
        tableNumber: 2,
        capacity: 6
      });

    expect(res.status).toBe(201);
    expect(res.body.data.tableNumber).toBe(2);
    expect(res.body.data.capacity).toBe(6);
  });

  it('PATCH /api/reservations/:reference/cancel - should cancel reservation and release table', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    futureDate.setHours(14, 0, 0, 0);

    const booking: any = await (request(app) as any)
      .post('/api/reservations')
      .send({
        slug: slug,
        customerName: 'Jane Smith',
        phone: '0987654321',
        partySize: 2,
        startDateTime: futureDate.toISOString(),
        durationMinutes: 60
      });

    const ref = booking.body.data.uniqueReference;

    const cancelRes: any = await (request(app) as any)
      .patch(`/api/reservations/${ref}/cancel`);
    
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.message).toBe('Reservation cancelled');

    // Verify it's no longer blocking (Double check resource release)
    const rebookRes: any = await (request(app) as any)
      .post('/api/reservations')
      .send({
        slug: slug,
        customerName: 'Jane Smith',
        phone: '0987654321',
        partySize: 2,
        startDateTime: futureDate.toISOString(),
        durationMinutes: 60
      });
    
    expect(rebookRes.status).toBe(201);
  });
});