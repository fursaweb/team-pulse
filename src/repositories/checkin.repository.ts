import { supabase } from "./../infrastructure/database/supabase.client";

import {
  Checkin,
  CreateCheckinData,
  UpdateCheckinData,
} from "../types/checkin.types";

class CheckinRepository {
  async findById(id: string): Promise<Checkin | null> {
    const { data: checkin, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!checkin) return null;

    return checkin;
  }

  async findByTeamAndDate(
    teamId: string,
    date: string,
  ): Promise<Checkin | null> {
    const { data: checkin, error } = await supabase
      .from("checkins")
      .select("*")
      .match({ team_id: teamId, date: date })
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!checkin) return null;

    return checkin;
  }

  async create(data: CreateCheckinData): Promise<Checkin> {
    const { data: checkin, error } = await supabase
      .from("checkins")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!checkin) throw new Error("Failed to create checkin");

    return checkin;
  }

  async update(id: string, data: UpdateCheckinData): Promise<Checkin> {
    const { data: checkin, error } = await supabase
      .from("checkins")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!checkin) throw new Error("Failed to update checkin");

    return checkin;
  }
}

export const checkinRepository = new CheckinRepository();
