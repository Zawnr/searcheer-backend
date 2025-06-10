const bcrypt = require('bcrypt');
const supabase = require('../../lib/supabase');
const Boom = require('@hapi/boom');


const addUser = async ({ email, password, username }) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw Boom.badRequest(authError.message);
  if (!authData.user) throw Boom.internal('Gagal mendaftarkan pengguna di sistem otentikasi.');

  const { error: profileError } = await supabase.from('users').insert({ id: authData.user.id, username });
  if (profileError) throw Boom.internal('Gagal membuat profil pengguna setelah registrasi.', profileError);
  
  return { id: authData.user.id, email: authData.user.email, username, created_at: authData.user.created_at };
};

const verifyUser = async ({ email, password }) => {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) throw Boom.unauthorized(authError.message);
  if (!authData.user) throw Boom.internal('Gagal mendapatkan data pengguna setelah login.');

  const { data: profileData, error: profileError } = await supabase.from('users').select('username').eq('id', authData.user.id).single();
  if (profileError) throw Boom.internal('Gagal mengambil profil pengguna setelah login.');

  return { id: authData.user.id, email: authData.user.email, username: profileData.username };
};

const getUserById = async (userId) => {
  console.log(`[SERVICE] Mencari profil di public.users untuk userId: ${userId}`);
  const { data, error } = await supabase
    .from('users')
    .select('id, email, username, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[SERVICE] Error saat query getUserById:', error);
    throw new Error('PENGGUNA_TIDAK_DITEMUKAN_ATAU_ERROR');
  }
  if (!data) {
    console.log('[SERVICE] Tidak ada data yang ditemukan untuk userId:', userId);
    throw new Error('PENGGUNA_TIDAK_DITEMUKAN');
  }

  console.log('[SERVICE] Profil ditemukan:', data);
  return data;
};

const updateUsername = async ({ userId, newUsername }) => {
  const { data, error } = await supabase
    .from('users')
    .update({ username: newUsername })
    .eq('id', userId)
    .select('id, username, created_at')
    .single();
  
  if (error) {
    if (error.code === '23505') { 
      throw new Error('USERNAME_SUDAH_DIGUNAKAN');
    }
    throw new Error('Gagal memperbarui username.');
  }
  return data;
};

const changeUserPassword = async ({ userId, newPassword }) => {
  const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    throw Boom.badRequest(error.message);
  }

  return { message: 'Password berhasil diperbarui.' };
};

module.exports = { addUser, verifyUser, getUserById, updateUsername, changeUserPassword };