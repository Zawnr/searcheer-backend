require('dotenv').config();
console.log("JWT Secret yang terbaca oleh server:", process.env.JWT_SECRET);

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Jwt = require('@hapi/jwt');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    routes: {
      cors: {
        // Ganti '*' dengan domain frontend untuk produksi
        origin: ['*'],
        //nanti diganti ke ini kalo sudah deploy
        // origin: [process.env.FRONTEND_URL],
      },
    },
  });

  const swaggerOptions = {
    info: {
      title: 'Searcheer API Documentation',
      version: '1.0.0',
    },
    // mendefinisikan skema keamanan agar tombol 'Authorize' muncul
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: "Enter 'Bearer' [space] and then your token.",
      },
    },
    security: [{ bearerAuth: [] }],
  };

  // 1. mendaftarkan plugin(Inert, Vision, Jwt)
  await server.register([Inert, Vision, Jwt]);

  // 2. mendefinisikan STRATEGI auth
  server.auth.strategy('jwt_strategy', 'jwt', {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: 'urn:audience:test',
      iss: 'urn:issuer:test',
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400,
      timeSkewSec: 15,
    },
    validate: (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: { user: artifacts.decoded.payload.user },
      };
    },
  });

  server.auth.default('jwt_strategy');

  // 3. mendaftarkan semua route app
  await server.register([
    require('./api/users'),
    require('./api/cv'),
    require('./api/jobs'),
    require('./api/analysis'),
  ]);

  // 4. mendftarkan plugin dokumentasi diakhir
  await server.register([
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  // Rute utama
  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: false,
    },
    handler: (request, h) => {
      return 'Server Searcheer berjalan. Cek dokumentasi di /documentation';
    },
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
  console.log('Searcheer API documentation available at:', `${server.info.uri}/documentation`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();