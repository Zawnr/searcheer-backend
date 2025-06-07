// src/api/jobs/index.js
const Joi = require('joi');
const { getAllJobsHandler, getJobByIdHandler } = require('./handler');

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
        tags: ['api', 'Jobs'], // <-- TAMBAHKAN BARIS INI
        description: 'Dapatkan daftar pekerjaan dengan filter',
        notes: 'Mengambil daftar pekerjaan yang tersedia. Mendukung filtering melalui query parameter.',
        validate: {
          query: Joi.object({
            employment_type: Joi.string().optional(),
            required_experience: Joi.string().optional(),
            location: Joi.string().optional(),
            function: Joi.string().optional(),
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
        tags: ['api', 'Jobs'], // <-- TAMBAHKAN BARIS INI
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