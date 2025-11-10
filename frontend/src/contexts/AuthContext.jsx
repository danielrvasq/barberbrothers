import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check active session
    const initAuth = async () => {
      console.log('🔵 Starting auth initialization...');
      try {
        console.log('🔵 Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔵 Session received:', session ? 'User logged in' : 'No session', error ? `Error: ${error.message}` : '');
        
        if (!mounted) {
          console.log('🔵 Component unmounted, aborting');
          return;
        }
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔵 User found, upserting profile...');
          await upsertProfile(session.user);
        } else {
          console.log('🔵 No user, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          console.log('🔵 Setting loading to false after error');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await upsertProfile(session.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const upsertProfile = async (user) => {
    console.log('🟢 upsertProfile called with user:', user?.id);
    if (!user) {
      console.log('🟢 No user provided, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('🟢 Attempting to upsert profile...');
      
      // Set a timeout to prevent hanging forever
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile upsert timeout')), 5000)
      );
      
      const upsertPromise = supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
        })
        .select()
        .single();

      const { data, error } = await Promise.race([upsertPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Error upserting profile:', error);
        // Even if profile upsert fails, we can continue with user data
        setProfile(null);
      } else {
        console.log('✅ Profile upserted successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('❌ Error upserting profile (catch):', error);
      setProfile(null);
    } finally {
      console.log('🟢 Setting loading to false');
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Si el error es porque no hay sesión, lo ignoramos
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error al cerrar sesión:', error);
        throw error;
      }
      
      // Limpiar estado local independientemente del resultado
      setUser(null);
      setProfile(null);
      
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      // Si hay error de red u otro, al menos limpiamos el estado local
      console.warn('⚠️ Error al cerrar sesión, limpiando estado local:', error);
      setUser(null);
      setProfile(null);
    }
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
