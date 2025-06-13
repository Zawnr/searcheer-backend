const Boom = require('@hapi/boom');
const { uploadCvService, getUserCVsService } = require('./service');

const uploadCvHandler = async (request, h) => {
  console.log('uploadCvHandler called');
  try {
    const { file } = request.payload;
    // mengambil ID pengguna dari kredensial token JWT yang sudah divalidasi
    const userId = request.auth.credentials.user.id;

    if (!file) {
      return Boom.badRequest('File tidak ditemukan.');
    }

    // Ambil nama file asli
    const originalName = file.hapi && file.hapi.filename ? file.hapi.filename : 'cv.pdf';

    const cvData = await uploadCvService({ file, userId, originalName });

    return h.response({
      status: 'success',
      message: 'CV berhasil diunggah.',
      data: cvData,
    }).code(201);

  } catch (error) {
    console.log('uploadCvHandler error');
    console.error(error);
    return Boom.internal(error.message);
  }
};

const getUserCVsHandler = async (request, h) => {
  try {
    const userId = request.auth.credentials.user.id;
    const cvs = await getUserCVsService(userId);
    return h.response(cvs).code(200);
  } catch (error) {
    console.error('getUserCVsHandler error:', error);
    return Boom.internal(error.message);
  }
};

module.exports = { uploadCvHandler, getUserCVsHandler };