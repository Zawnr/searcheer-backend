const Boom = require('@hapi/boom');
const { uploadCvService } = require('./service');

const uploadCvHandler = async (request, h) => {
  console.log('uploadCvHandler called');
  try {
    const { file } = request.payload;
    // mengambil ID pengguna dari kredensial token JWT yang sudah divalidasi
    const userId = request.auth.credentials.user.id;

    if (!file) {
      return Boom.badRequest('File tidak ditemukan.');
    }

    const cvData = await uploadCvService({ file, userId });

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

module.exports = { uploadCvHandler };