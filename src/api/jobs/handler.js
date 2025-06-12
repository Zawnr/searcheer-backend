const Boom = require('@hapi/boom');
const jobService = require('./service');

const getAllJobsHandler = async (request, h) => {
  console.log('getAllJobsHandler called');
  try {
    // Ambil filter dari query string, contoh /jobs?location=New%20York
    console.log('QUERY DI HANDLER:', request.query);
    const filters = request.query;
    const jobs = await jobService.getAllJobs(filters);
    return h.response(jobs).code(200);
  } catch (error) {
    console.log('getAllJobsHandler error');
    return Boom.internal(error.message);
  }
};

const getJobByIdHandler = async (request, h) => {
  console.log('getJobByIdHandler called');
  try {
    const { id } = request.params; // Ambil id dari path, contoh /jobs/123
    const job = await jobService.getJobById(id);
    if (!job) {
      return Boom.notFound('Pekerjaan tidak ditemukan.');
    }
    return h.response(job).code(200);
  } catch (error) {
    console.log('getJobByIdHandler error');
    return Boom.internal(error.message);
  }
};

module.exports = { getAllJobsHandler, getJobByIdHandler };