// src/api/cv/index.js
const { uploadCvHandler } = require('./handler');

exports.plugin = {
  name: 'cv-api',
  version: '1.0.0',
  register: async (server) => {
    server.route({
      method: 'POST',
      path: '/cvs',
      handler: uploadCvHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'CVs'], // <-- TAMBAHKAN BARIS INI
        description: 'Upload CV baru oleh pengguna terautentikasi',
        payload: {
          output: 'data',
          parse: true,
          multipart: true,
          maxBytes: 10 * 1024 * 1024,
        },
      },
    });
  },
};