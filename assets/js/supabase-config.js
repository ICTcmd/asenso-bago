// Supabase Configuration
// TODO: Add your actual Supabase credentials here before deployment

const SUPABASE_CONFIG = {
  url: 'https://esvbibxavfrxkkfujhmz.supabase.co',  // Example: 'https://xxxxxxxxxxxxx.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdmJpYnhhdmZyeGtrZnVqaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDgyMjIsImV4cCI6MjEwODIyNDIyMn0.8cbpFhsettaK9lXD7YKZLlQA3YG4o-9xvrx_jrY_Hro'  // Your anon/public key from Supabase dashboard
};

// Export for use in other files
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
