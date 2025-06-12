const Joi = require('joi');
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
        tags: ['api', 'CVs'],
        description: 'Upload CV baru oleh pengguna terautentikasi',
        payload: {
          output: 'data',
          parse: true,
          multipart: true,
          maxBytes: 10 * 1024 * 1024,
        },
        validate: {
          payload: Joi.object({
            file: Joi.any()
              .meta({ swaggerType: 'file' })
              .description('File CV dalam format PDF yang akan diunggah')
              .required(),
          }).label('UploadCVPayload'), 
        },

        plugins: {
          'hapi-swagger': {
            payloadType: 'form' 
          }
        }

      },
    });
  },
};