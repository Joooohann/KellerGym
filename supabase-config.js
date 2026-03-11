// supabase-config.js
// Nutze den CDN-Import für Vanilla JS
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://wossbfezzymbwjnymjtp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3NiZmV6enltYndqbnltanRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDA1NDYsImV4cCI6MjA4ODM3NjU0Nn0.qZjl6vkBtPSIlzKb78JQaDlTyHxO-MghX1kL-IYVGzs'

export const supabase = createClient(supabaseUrl, supabaseKey)