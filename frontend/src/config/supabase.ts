import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwjvowvrvduqdckrmgke.supabase.co';
const supabaseKey = 'sb_publishable_-2Qf0MQG7djpjpnwilLklg_DKlvZR3Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
