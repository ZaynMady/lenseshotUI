import { SupabaseClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "../secrets/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Authentication({method}){

    const navigate = useNavigate(); // Initialize hook

  useEffect(() => {
    // 3. Set up the listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      // If the user just signed in...
      if (event === "SIGNED_IN") {
        // ...navigate them to the dashboard (or home)
        navigate("/desktop"); 
      }
      
      // Optional: Handle Sign Out
      if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    // Cleanup the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, [navigate]);


    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="w-96 p-8 bg-gray-800 rounded-lg shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            view={method}
            theme="dark" // Sets the UI to dark mode automatically
            providers={['google', 'apple']}
          />
        </div>
      </div>
    )
  
}