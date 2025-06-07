const Boom = require('@hapi/boom');
const jwt = require('@hapi/jwt');
const { addUser, verifyUser, getUserById, updateUsername, changeUserPassword } = require('./service');

const registerUserHandler = async (request, h) => {
  try {
    const { email, password, username } = request.payload;
    const user = await addUser({ email, password, username });
    return h.response(user).code(201);
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      return Boom.conflict('Email atau username sudah terdaftar.');
    }
    console.error('Register error:', error);
    return Boom.internal('Terjadi kesalahan saat mendaftarkan pengguna.');
  }
};

const loginUserHandler = async (request, h) => {
  try {
    const { email, password } = request.payload;
    const user = await verifyUser({ email, password });
    const token = jwt.token.generate(
      {
        aud: 'urn:audience:test',
        iss: 'urn:issuer:test',
        user: { id: user.id, email: user.email },
      },
      { key: process.env.JWT_SECRET, algorithm: 'HS256' },
      { ttlSec: 14400 }
    );
    return h.response({ message: 'Login berhasil', token }).code(200);
  } catch (error) {
    return Boom.unauthorized(error.message);
  }
};

const getMyProfileHandler = async (request, h) => {
  try {
    const userId = request.auth.credentials.user.id;
    const profile = await getUserById(userId);
    return h.response(profile).code(200);
  } catch (error) {
    if (error.message === 'PENGGUNA_TIDAK_DITEMUKAN') {
      return Boom.notFound('Pengguna tidak ditemukan.');
    }
    console.error('Get profile error:', error);
    return Boom.internal('Gagal mengambil profil.');
  }
};

const updateMyProfileHandler = async (request, h) => {
  try {
    const userId = request.auth.credentials.user.id;
    const { username } = request.payload;
    const updatedProfile = await updateUsername({ userId, newUsername: username });
    return h.response(updatedProfile).code(200);
  } catch (error) {
    if (error.message === 'USERNAME_SUDAH_DIGUNAKAN') {
      return Boom.conflict('Username tersebut sudah digunakan.');
    }
    console.error('Update profile error:', error);
    return Boom.internal('Gagal memperbarui profil.');
  }
};

const changePasswordHandler = async (request, h) => {
  try {
    const userId = request.auth.credentials.user.id;
    const { oldPassword, newPassword } = request.payload;
    
    await changeUserPassword({ userId, oldPassword, newPassword });

    return h.response({ message: 'Password berhasil diubah' }).code(200);
  } catch (error) {
    if (error.message === 'PASSWORD_LAMA_SALAH') {
      return Boom.badRequest('Password lama yang Anda masukkan salah.');
    }
    if (error.message === 'PENGGUNA_TIDAK_DITEMUKAN') {
      return Boom.notFound('Pengguna tidak ditemukan.');
    }
    console.error('Change password error:', error);
    return Boom.internal('Terjadi kesalahan saat mengubah password.');
  }
};

module.exports = { registerUserHandler, loginUserHandler, getMyProfileHandler, updateMyProfileHandler, changePasswordHandler };