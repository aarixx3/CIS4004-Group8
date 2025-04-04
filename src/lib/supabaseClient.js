import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlpbxpwdwkxpsifqoebi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscGJ4cHdkd2t4cHNpZnFvZWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTI5NTIsImV4cCI6MjA1OTI2ODk1Mn0.tLU6YuxVK57h25h02VOnathwTnvU6Jexe0ZYINtT_0M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
