import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Restaurant API',
    description: 'Auto-generated documentation for the Restaurant Reservation API including management and booking systems.',
    version: '1.0.0',
  },
  host: 'localhost:9000',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: 'Restaurant', description: 'Endpoints for managing restaurant details and operating hours' },
    { name: 'Table', description: 'Endpoints for managing physical tables and capacities' },
    { name: 'Reservation', description: 'Core booking logic and availability checking' }
  ],
  definitions: {
    Restaurant: {
      name: 'The Gourmet Bistro',
      totalTables: 5,
      openingTime: '09:00',
      closingTime: '22:00'
    },
    Reservation: {
      customerName: 'John Doe',
      uniqueReference: 'res-09834-khdfsdo-poowiepw',
      phone: '555-0199',
      partySize: 4,
      startDateTime: '2024-06-01T19:00:00Z',
      durationMinutes: 90
    }
  }
};

const outputFile = 'src/swagger-output.json';
const routes = ['src/server'];

console.log('--- Generating Swagger Documentation ---');
swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc).then(() => {
  console.log('--- Swagger Documentation Generated Successfully ---');
});