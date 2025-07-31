import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from './_utils';
import { supabase, supabaseSchema } from './_supabase';

// POST /api/login
const handleLogin = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      res.status(400).json({ message: 'Password is required.' });
      return;
    }
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    
    if (error) {
      console.error('[POST /api/login] Supabase auth error:', error);
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    if (!data.user) {
      res.status(401).json({ message: 'Authentication failed.' });
      return;
    }
    
    // Get user type from custom table if it exists
    let userType = null;
    try {
      const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
      const { data: userData, error: userError } = await supabase
        .from(tableName)
        .select('user_type')
        .eq('email', email.trim())
        .single();
      
      if (userData && !userError) {
        userType = userData.user_type;
      }
    } catch (userLookupError) {
      // User type lookup failed, but auth succeeded
      console.warn('[POST /api/login] User type lookup failed:', userLookupError);
    }
    
    res.status(200).json({
      user: data.user,
      session: data.session,
      userType,
      message: 'Login successful.'
    });
  } catch (error: any) {
    console.error('[POST /api/login] Error:', error.message);
    res.status(500).json({ message: error.message || 'Login failed.' });
  }
};

// Main handler
export default createHandler({
  POST: handleLogin
});
