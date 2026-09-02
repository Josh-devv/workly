"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function createOrganization(name: string) {
  const supabase = await createClient();

  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to create an organization.");
  }

  //stores this in my organization table
  const { data: organization, error: organizationError } =
    await supabase
      .from("organizations")
      .insert({
        name,
        created_by: user.id, //this is the logged-in user id, which is the owner of the organization, it checks if the logged in ID is the same as the created_by ID in the organization table, if it is the same then it allows the user to create an organization, if not then it throws an error
        
      })
      .select()
      .single();

  if (organizationError) {
    throw new Error(organizationError.message);
  }

  //stores this into the organization membere table
  //this also insert into another table which is org members and add the persons role
  //thhis connects the logged-in user to the organization and gives them a role of owner
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      role: "owner",//this is the role of the logged-in user, which is the owner of the organization, it passes
    });

  if (memberError) {
    throw new Error(memberError.message);
  }

  return organization;
}