const { startAnalysisService, getAnalysisResultById, getAllResultsByCvId } = require('./service');
const Boom = require('@hapi/boom');
const { getJobRecommendations } = require('./service'); 

const startAnalysisHandler = async (request, h) => {
  console.log('startAnalysisHandler called', {
    params: request.params,
    payload: request.payload,
    userId: request.auth?.credentials?.user?.id
  });
  try {
    const { cvId } = request.params;
    const { job_title, job_description } = request.payload;
    const userId = request.auth.credentials.user.id;

    const result = await startAnalysisService({
      cvId,
      userId,
      jobTitle: job_title,
      jobDescription: job_description,
    });

    return h.response({
      status: 'success',
      message: 'Analisis berhasil diselesaikan.',
      data: result,
    }).code(200);
  } catch (error) {
    console.log('startAnalysisHandler error', {
      error: error.message,
      params: request.params,
      payload: request.payload,
      userId: request.auth?.credentials?.user?.id
    });
    if (error.isBoom) return error;
    console.error('Unhandled analysis error:', error);
    return Boom.internal('Terjadi kesalahan tak terduga pada server.');
  }
};

const getResultByIdHandler = async (request, h) => {
  console.log('getResultByIdHandler called', {
    params: request.params,
    userId: request.auth?.credentials?.user?.id
  });
  try {
    const { id } = request.params;
    const userId = request.auth.credentials.user.id;
    const result = await getAnalysisResultById({ resultId: id, userId });
    return h.response(result).code(200);
  } catch (error) {
    console.log('getResultByIdHandler error', {
      error: error.message,
      params: request.params,
      userId: request.auth?.credentials?.user?.id
    });
    if (error.isBoom) return error;
    console.error('Get result by id error:', error);
    return Boom.internal('Terjadi kesalahan tak terduga.');
  }
};

const getResultsByCvIdHandler = async (request, h) => {
  console.log('getResultsByCvIdHandler called', {
    params: request.params,
    userId: request.auth?.credentials?.user?.id
  });
  try {
    const { cvId } = request.params;
    const userId = request.auth.credentials.user.id;
    const results = await getAllResultsByCvId({ cvId, userId });
    return h.response(results).code(200);
  } catch (error) {
    console.log('getResultsByCvIdHandler error', {
      error: error.message,
      params: request.params,
      userId: request.auth?.credentials?.user?.id
    });
    if (error.isBoom) return error;
    console.error('Get results by cvId error:', error);
    return Boom.internal('Terjadi kesalahan tak terduga.');
  }
};

const getRecommendationsHandler = async (request, h) => {
  console.log('getRecommendationsHandler called', {
    params: request.params,
    userId: request.auth?.credentials?.user?.id
  });
  try {
    const { id } = request.params;
    const userId = request.auth.credentials.user.id;
    const recommendations = await getJobRecommendations({ resultId: id, userId });
    return h.response(recommendations).code(200);
  } catch (error) {
    console.log('getRecommendationsHandler error', {
      error: error.message,
      params: request.params,
      userId: request.auth?.credentials?.user?.id
    });
    if (error.isBoom) return error;
    return Boom.internal('Terjadi kesalahan saat mengambil rekomendasi.');
  }
};

module.exports = { startAnalysisHandler, getResultByIdHandler, getResultsByCvIdHandler, getRecommendationsHandler };