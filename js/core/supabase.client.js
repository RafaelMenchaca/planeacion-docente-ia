const SUPABASE_URL = 'https://bfnkaqmhcsyxdxoqnahk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbmthcW1oY3N5eGR4b3FuYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDI4MTcsImV4cCI6MjA2Mzg3ODgxN30.ADYrubfJuP9Oo60713UldzO0owCIgYfUKJ8WFnuBCpM'; // tu clave anon publica

// Cliente global
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

