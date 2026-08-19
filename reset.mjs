import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zlvvkltsefsytzqjorsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdnZrbHRzZWZzeXR6cWpvcnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkyNTg1NSwiZXhwIjoyMDkxNTAxODU1fQ.U5StW_DiCuAQk6f7fqzqKNUqsPuvlHt1A82SDOqim_M'
);

async function reset() {
  const hash = await bcrypt.hash('admin123', 10);
  const { data, error } = await supabase.from('app_users').update({ password_hash: hash }).eq('username', 'admin').select();
  console.log(error ? error : 'Success: ' + data[0].username);
}
reset();
