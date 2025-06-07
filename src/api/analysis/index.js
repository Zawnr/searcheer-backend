const Joi = require('joi');
const { startAnalysisHandler, getResultByIdHandler, getResultsByCvIdHandler, getRecommendationsHandler } = require('./handler');


exports.plugin = {
  name: 'analysis-api',
  version: '1.0.0',
  register: async (server) => {
    server.route({
      method: 'POST',
      path: '/cvs/{cvId}/analyze',
      handler: startAnalysisHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'Analysis'],
        description: 'Memulai analisis kecocokan antara sebuah CV dengan deskripsi pekerjaan yang diinput manual oleh user.',
        validate: {
          params: Joi.object({
            cvId: Joi.string().uuid().required(),
          }),
          payload: Joi.object({
            job_title: Joi.string().min(5).required(),
            job_description: Joi.string().min(20).required(),
          }),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/analysis-results/{id}',
      handler: getResultByIdHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'Analysis'],
        description: 'Mendapatkan detail dari satu hasil analisis spesifik.',
        validate: {
          params: Joi.object({
            id: Joi.string().uuid().required(),
          }),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/cvs/{cvId}/analysis-results',
      handler: getResultsByCvIdHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'Analysis'],
        description: 'Mendapatkan semua riwayat hasil analisis untuk sebuah CV.',
        validate: {
          params: Joi.object({
            cvId: Joi.string().uuid().required(),
          }),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/analysis-results/{id}/recommendations',
      handler: getRecommendationsHandler,
      options: {
        auth: 'jwt_strategy',
        tags: ['api', 'Analysis'],
        description: 'Mendapatkan rekomendasi pekerjaan alternatif berdasarkan hasil analisis.',
        validate: {
          params: Joi.object({
            id: Joi.string().uuid().required(),
          }),
        },
      },
    });
    
  },
};