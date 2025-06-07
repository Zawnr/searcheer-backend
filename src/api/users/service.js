const bcrypt = require('bcrypt');
const supabase = require('../../lib/supabase');
const Boom = require('@hapi/boom');

const addUser = async ({ email, password, username }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, username })
    .select('id, email, username, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const verifyUser = async ({ email, password }) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Kredensial tidak valid');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Kredensial tidak valid');
  }

  delete user.password;
  return user;
};

const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, username, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('PENGGUNA_TIDAK_DITEMUKAN');
  }
  return data;
};

const updateUsername = async ({ userId, newUsername }) => {
  const { data, error } = await supabase
    .from('users')
    .update({ username: newUsername })
    .eq('id', userId)
    .select('id, email, username, created_at')
    .single();
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('USERNAME_SUDAH_DIGUNAKAN');
    }
    throw new Error('Gagal memperbarui username.');
  }
  return data;
};

const changeUserPassword = async ({ userId, oldPassword, newPassword }) => {
  // 1. Ambil data pengguna, TERMASUK hash password saat ini dari DB
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, password')
    .eq('id', userId)
    .single();
  
  if (fetchError || !user) {
    throw new Error('PENGGUNA_TIDAK_DITEMUKAN');
  }

  // 2. Verifikasi apakah password lama yang dimasukkan pengguna cocok
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new Error('PASSWORD_LAMA_SALAH');
  }

  // 3. Jika valid, hash password yang baru
  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  // 4. Update password di database dengan hash yang baru
  const { error: updateError } = await supabase
    .from('users')
    .update({ password: newHashedPassword })
    .eq('id', userId);
  
  if (updateError) {
    throw new Error('Gagal memperbarui password di database.');
  }

  return { message: 'Password berhasil diperbarui.' };
};

module.exports = { addUser, verifyUser, getUserById, updateUsername, changeUserPassword };