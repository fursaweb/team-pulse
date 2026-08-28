import { supabase } from "../infrastructure/database/supabase.client";
import {
  User,
  CreateUserData,
  UpdateUserData,
  USER_STATUS,
} from "../types/user.types";

class UserRepository {
  async findAll(): Promise<User[]> {
    const { data: users, error } = await supabase.from("users").select("*");

    if (error) throw new Error(error.message);

    return users;
  }

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

  async findByEmail(email: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
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

  async findActive(): Promise<User[]> {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("status", USER_STATUS.ACTIVE);

    if (error) throw new Error(error.message);

    return users;
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
