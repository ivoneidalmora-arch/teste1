import { supabase } from './src/services/supabase.ts';

async function checkTables() {
  const { data: rec, error: err1 } = await supabase.from('Receitas').select('count');
  const { data: des, error: err2 } = await supabase.from('Despesas').select('count');
  const { data: rf, error: err3 } = await supabase.from('rec_financeiro').select('count');
  const { data: d, error: err4 } = await supabase.from('despesas').select('count');

  console.log('Receitas:', !err1 ? 'OK' : err1.message);
  console.log('Despesas:', !err2 ? 'OK' : err2.message);
  console.log('rec_financeiro:', !err3 ? 'OK' : err3.message);
  console.log('despesas:', !err4 ? 'OK' : err4.message);
}

checkTables();
