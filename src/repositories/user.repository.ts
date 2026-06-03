import { supabase } from "../infrastructure/database/supabase.client";
import { User, CreateUserData, UpdateUserData } from "../types/user.types";

class UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!user) return null;

    return user;
  }

  async findBySlackUserId(slackUserId: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("slack_user_id", slackUserId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!user) return null;

    return user;
  }

  async create(data: CreateUserData): Promise<User> {
    const { data: user, error } = await supabase
      .from("users")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!user) throw new Error("Failed to create user");

    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const { data: user, error } = await supabase
      .from("users")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!user) throw new Error("Failed to update user");

    return user;
  }
}

export const userRepository = new UserRepository();
