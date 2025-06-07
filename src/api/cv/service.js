const supabase = require('../../lib/supabase');

const uploadCvService = async ({ file, userId }) => {
  const fileName = `${userId}-${Date.now()}.pdf`;
  const filePath = `public/${fileName}`;

  // 1. Upload file ke Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('cv-files')
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    throw new Error('Gagal mengunggah file CV.');
  }

  // 2. Simpan metadata file ke tabel 'cvs' di database
  const { data: dbData, error: dbError } = await supabase
    .from('cvs')
    .insert({
      user_id: userId,
      file_path: filePath,
    })
    .select()
    .single();

  if (dbError) {
    console.error('Supabase db error:', dbError);
    // Jika terjadi error, menghapus file yang sudah terlanjur di-upload
    await supabase.storage.from('cv-files').remove([filePath]);
    throw new Error('Gagal menyimpan data CV.');
  }

  return dbData;
};

module.exports = { uploadCvService };