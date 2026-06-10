import { supabase } from "../infrastructure/database/supabase.client";
import { Team, CreateTeamData, UpdateTeamData } from "../types/team.types";

class TeamRepository {
  async findById(id: string): Promise<Team | null> {
    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!team) return null;

    return team;
  }

  async findByName(name: string): Promise<Team | null> {
    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("name", name)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!team) return null;

    return team;
  }

  async findActive(): Promise<Team[]> {
    const { data: teams, error } = await supabase
      .from("teams")
      .select("*")
      .eq("active", true);

    if (error) throw new Error(error.message);

    return teams ?? [];
  }

  async create(data: CreateTeamData): Promise<Team> {
    const { data: team, error } = await supabase
      .from("teams")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!team) throw new Error("Failed to create team");

    return team;
  }

  async update(id: string, data: UpdateTeamData): Promise<Team> {
    const { data: team, error } = await supabase
      .from("teams")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!team) throw new Error("Failed to update team");

    return team;
  }

  async deactivate(id: string): Promise<Team> {
    return await this.update(id, { active: false });
  }
}

export const teamRepository = new TeamRepository();
