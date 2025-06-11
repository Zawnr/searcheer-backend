const Boom = require('@hapi/boom');
const jwt = require('@hapi/jwt');
const { addUser, verifyUser, getUserById, updateUsername, changeUserPassword } = require('./service');

const registerUserHandler = async (request, h) => {
  console.log('registerUserHandler called');
  try {
    const { email, password, username } = request.payload;
    const user = await addUser({ email, password, username });
    return h.response(user).code(201);
  } catch (error) {
    console.log('registerUserHandler error');
    if (error.message.includes('duplicate key')) {
      return Boom.conflict('Email atau username sudah terdaftar.');
    }
    console.error('Register error:', error);
    return Boom.internal('Terjadi kesalahan saat mendaftarkan pengguna.');
  }
};

const loginUserHandler = async (request, h) => {
  console.log('loginUserHandler called');
  try {
    const { email, password } = request.payload;
    const user = await verifyUser({ email, password });

    const token = jwt.token.generate(
      {
        aud: 'urn:audience:test',
        iss: 'urn:issuer:test',
        user: { 
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { key: process.env.JWT_SECRET, algorithm: 'HS256' },
      { ttlSec: 14400 }
    );
    return h.response({ message: 'Login berhasil', token }).code(200);
  } catch (error) {
    console.log('loginUserHandler error');
    if (error.isBoom) return error;
    return Boom.unauthorized("Email atau password salah.");
  }
};

const getMyProfileHandler = async (request, h) => {
  console.log('getMyProfileHandler called');
  // Tidak perlu lagi try-catch atau memanggil service.
  // Semua data yang kita butuhkan sudah ada di dalam token yang divalidasi.
  const userProfileFromToken = request.auth.credentials.user;

  // Kita hanya perlu mengembalikan data tersebut.
  return h.response({
    id: userProfileFromToken.id,
    email: userProfileFromToken.email,
    username: userProfileFromToken.username,
  }).code(200);
};

const updateMyProfileHandler = async (request, h) => {
  console.log('updateMyProfileHandler called');
  try {
    const { id: userId, email: userEmail } = request.auth.credentials.user;
    const { username: newUsername } = request.payload;

    // Panggil service yang hanya mengembalikan data dari tabel 'users'
    const updatedProfileData = await updateUsername({ userId, newUsername });

    // Rakit respons lengkap dengan data dari token dan hasil service
    const fullUpdatedProfile = {
      id: updatedProfileData.id,
      username: updatedProfileData.username,
      email: userEmail, 
      created_at: updatedProfileData.created_at,
    };

    return h.response(fullUpdatedProfile).code(200);
  } catch (error) {
    console.log('updateMyProfileHandler error');
    if (error.message === 'USERNAME_SUDAH_DIGUNAKAN') {
      return Boom.conflict('Username tersebut sudah digunakan.');
    }
    console.error('Update profile error:', error);
    return Boom.internal('Gagal memperbarui profil.');
  }
};

const changePasswordHandler = async (request, h) => {
  console.log('changePasswordHandler called');
  try {
    const userId = request.auth.credentials.user.id;
    const { newPassword } = request.payload;
    
    await changeUserPassword({ userId, newPassword });

    return h.response({ message: 'Password berhasil diubah' }).code(200);
 } catch (error) {
    console.log('changePasswordHandler error');
    if (error.isBoom) {
      return error;
    }
    console.error('Change password error:', error);
    return Boom.internal('Terjadi kesalahan saat mengubah password.');
  }
};

module.exports = { registerUserHandler, loginUserHandler, getMyProfileHandler, updateMyProfileHandler, changePasswordHandler };