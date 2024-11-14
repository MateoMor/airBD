// src/supabaseClient.js o src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Reemplaza estos valores con los de tu proyecto en Supabase
const SUPABASE_URL = 'https://gdolojiyzsmctnrjvrgp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkb2xvaml5enNtY3Rucmp2cmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MzAyMDksImV4cCI6MjA0NzEwNjIwOX0.Ial5Nm1633rkLsYm6zL40YP5r1iGkS5Qr0VnvuHWuMg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
