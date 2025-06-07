const bcrypt = require('bcrypt');
const supabase = require('../../lib/supabase');

/**
 * Menambahkan pengguna baru ke database
 */
const addUser = async ({ email, password, username }) => {
  // 1. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Masukkan ke Supabase
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, username })
    .select('id, email, username, created_at') 
    .single();

  // 3. Handle error (misal: email duplikat)
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Memverifikasi kredensial pengguna
 */
const verifyUser = async ({ email, password }) => {
  // 1. Cari pengguna berdasarkan email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Kredensial tidak valid');
  }

  // 2. Bandingkan password yang diberikan dengan hash di database
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Kredensial tidak valid');
  }

  // Hapus password dari objek sebelum dikembalikan
  delete user.password;
  return user;
};

module.exports = { addUser, verifyUser };