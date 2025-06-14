const Joi = require('joi');
const { registerUserHandler, loginUserHandler, getMyProfileHandler, updateMyProfileHandler, changePasswordHandler } = require('./handler');

exports.plugin = {
  name: 'users-api',
  version: '1.0.0',
  register: async (server) => {
    server.route({
      method: 'POST',
      path: '/users/register',
      handler: registerUserHandler,
      options: {
        auth: false,
        tags: ['api', 'Users'],
        description: 'Registrasi pengguna baru',
        validate: {
          payload: Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
          }).label('Register User'),
        },
      },
    });

    server.route({
      method: 'POST',
      path: '/users/login',
      handler: loginUserHandler,
      options: {
        auth: false,
        tags: ['api', 'Users'],
        description: 'Login pengguna untuk mendapatkan token JWT',
        validate: {
          payload: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
          }).label('Login User'),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/users/me',
      handler: getMyProfileHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'Users'],
        description: 'Mendapatkan profil dari pengguna yang sedang login.',
          response: { 
            schema: Joi.object({
              id: Joi.string().uuid(),
              email: Joi.string().email(),
              username: Joi.string(),
              created_at: Joi.date().iso(), 
            }).label('User Profile') 
          }
      },
    });

    server.route({
      method: 'PATCH',
      path: '/users/me',
      handler: updateMyProfileHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'Users'],
        description: 'Memperbarui username dari pengguna yang sedang login.',
        validate: {
          payload: Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
          }).label('Update Profile'),
        },
      },
    });

    server.route({
      method: 'PUT',
      path: '/users/me/password',
      handler: changePasswordHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'Users'],
        description: 'Mengubah password pengguna yang sedang login.',
        validate: {
          payload: Joi.object({
            newPassword: Joi.string().min(6).required(),
            confirmNewPassword: Joi.any().equal(Joi.ref('newPassword')).required()
              .label('Confirm password')
              .messages({ 'any.only': 'Konfirmasi password tidak cocok dengan password baru.' }),
          }).example({
            newPassword: "PasswordSangatBaru123!",
            confirmNewPassword: "PasswordSangatBaru123!"
          }),
        },
      },
    });

  },
};