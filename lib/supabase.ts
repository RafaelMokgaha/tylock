import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kekagckwxhmrgagfmqaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtla2FnY2t3eGhtcmdhZ2ZtcWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTkzMzksImV4cCI6MjA4Nzg3NTMzOX0.sZtw2EFkWyi_6ybWVXg5260yQ4Ya1AAh0tM4R-jNjXI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
