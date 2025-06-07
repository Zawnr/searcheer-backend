// src/api/users/index.js
const Joi = require('joi');
const { registerUserHandler, loginUserHandler } = require('./handler');

exports.plugin = {
  name: 'users-api',
  version: '1.0.0',
  register: async (server, options) => {
    server.route({
      method: 'POST',
      path: '/users/register',
      handler: registerUserHandler,
      options: {
        auth: false,
        tags: ['api', 'Users'], // <-- TAMBAHKAN BARIS INI
        description: 'Registrasi pengguna baru',
        validate: {
          payload: Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
          }),
        },
      },
    });

    server.route({
      method: 'POST',
      path: '/users/login',
      handler: loginUserHandler,
      options: {
        auth: false,
        tags: ['api', 'Users'], // <-- TAMBAHKAN BARIS INI
        description: 'Login pengguna untuk mendapatkan token JWT',
        validate: {
          payload: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
          }),
        },
      },
    });
  },
};