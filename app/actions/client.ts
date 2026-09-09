"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";


// Define the type for the client data
type CreateClientData = {
  name: string;
  company: string;
  email: string;
  phone: string;
};

export async function createClientAction(datas: CreateClientData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("CREATE CLIENT - USER:", user);
  console.log("CREATE CLIENT - AUTH ERROR:", userError);

  if (userError || !user) {
    throw new Error("You must be logged in to create a client.");
  }

  const membership = await getCurrentMembership(user.id);//if the user is not part of an organization, throw an error

  console.log("CREATE CLIENT - ORGANIZATION:", membership);

  if (!membership) {
    throw new Error(
      "You must belong to an organization to create a client."
    );
  }

  if (membership.role !== "owner") {
    throw new Error("Only workspace owners can create clients.");
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      organization_id: membership.id,
      name: datas.name,
      company: datas.company || null,
      email: datas.email || null,
      phone: datas.phone || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create client error:", error);
    throw new Error(error.message);
  }

  return client;
}


export async function updateClientAction(
  clientId: string, //this function is receiving the clientId from the form and then sending it to the server to update the client in the database, to identify which client to update
  data: CreateClientData //this function is receiving the data from the form and then sending it to the server to update the client in the database
) {
  // Create a Supabase client instance
  const supabase = await createClient();

  // Get the currently logged-in user
  const {
    data: { user },//meaning that i need user data from whats feetched from the database
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to update a client.");
  }

  const membership = await getCurrentMembership(user.id);
  if (!membership || membership.role !== "owner") {
    throw new Error("Only workspace owners can update clients.");
  }

  
  // Update the client
  const { data: client, error } = await supabase //data: client meaning that i need the whole thing when i fetch from the database
    .from("clients")
    .update({
      name: data.name,
      company: data.company || null,// Use null if company is an empty string
      email: data.email || null,//  Use null if email is an empty string
      phone: data.phone || null,// Use null if phone is an empty string
    })
    .eq("id", clientId)
    .eq("organization_id", membership.id)
    .select()
    .single();

  if (error) {
    console.error("Update client error:", error);
    throw new Error(error.message);
  }

  return client;
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to delete a client.");
  }

  const membership = await getCurrentMembership(user.id);
  if (!membership || membership.role !== "owner") {
    throw new Error("Only workspace owners can delete clients.");
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("organization_id", membership.id);

  if (error) throw new Error(error.message);
}

//unique (organization_id, user_id) -> users cannot be added to the organization twice