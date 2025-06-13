const Joi = require('joi');
const { getAllJobsHandler, getJobByIdHandler } = require('./handler');

const Joi = require('joi');

exports.plugin = {
  name: 'jobs-api',
  version: '1.0.0',
  register: async (server) => {
    server.route({
      method: 'GET',
      path: '/jobs',
      handler: getAllJobsHandler,
      options: {
        auth: false,
        tags: ['api', 'Jobs'],
        description: 'Dapatkan daftar pekerjaan dengan filter',
        notes: 'Mengambil daftar pekerjaan yang tersedia. Mendukung filtering melalui query parameter.',
        validate: {
          query: Joi.object({
            q: Joi.string().allow('').optional(),
            employment_type: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
            required_experience: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
            location: Joi.string().optional(),
            function: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
          }).optional(),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/jobs/{id}',
      handler: getJobByIdHandler,
      options: {
        auth: false,
        tags: ['api', 'Jobs'],
        description: 'Dapatkan detail pekerjaan berdasarkan ID',
        notes: 'Mengambil semua detail untuk satu pekerjaan spesifik menggunakan job_id-nya.',
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
      },
    });
  },
};
