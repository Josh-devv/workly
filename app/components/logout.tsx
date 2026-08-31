"use client";

import {createClient} from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Logout() {
  
  const router = useRouter();

    async function handleLogout() { 
        const supabase = createClient();//create a supabase client that can be used to make requests to the supabase API
        await supabase.auth.signOut();//sign out the user from supabase
        
        router.push("/login");//navigate to the login page after successful logout
        router.refresh();//refresh the page to update the state
    }

    return (
        <button onClick={handleLogout}>Logout</button>
    );
}