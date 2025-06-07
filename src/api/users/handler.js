const Boom = require('@hapi/boom');
const jwt = require('@hapi/jwt');
const userService = require('./service');

const registerUserHandler = async (request, h) => {
  try {
    const { email, password, username } = request.payload;
    const user = await userService.addUser({ email, password, username });
    return h.response(user).code(201);
  } catch (error) {
    // Jika error karena email sudah ada (kode 23505 di Postgres)
    if (error.message.includes('duplicate key')) {
      return Boom.conflict('Email atau Username sudah terdaftar.');
    }
    return Boom.internal('Terjadi kesalahan saat mendaftarkan pengguna.');
  }
};

const loginUserHandler = async (request, h) => {
  try {
    const { email, password } = request.payload;
    const user = await userService.verifyUser({ email, password });

    // Jika verifikasi berhasil, buat token JWT
    const token = jwt.token.generate(
      {
        aud: 'urn:audience:test',
        iss: 'urn:issuer:test',
        user: {
          id: user.id,
          email: user.email,
        },
      },
      {
        key: process.env.JWT_SECRET,
        algorithm: 'HS256',
      },
      {
        ttlSec: 14400, // 4 jam
      }
    );

    return h.response({
      message: 'Login berhasil',
      token,
    }).code(200);

  } catch (error) {
    // Jika error karena kredensial tidak valid
    return Boom.unauthorized(error.message);
  }
};

module.exports = { registerUserHandler, loginUserHandler };