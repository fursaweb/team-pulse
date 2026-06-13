import { supabase } from "../infrastructure/database/supabase.client";
import {
  TeamMember,
  TeamMemberWithUser,
  CreateTeamMemberData,
  UpdateTeamMemberData,
} from "../types/teamMember.type";

class TeamMemberRepository {
  async findById(id: string): Promise<TeamMember | null> {
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!teamMember) return null;

    return teamMember;
  }

  async findByTeamAndUser(
    teamId: string,
    userId: string,
  ): Promise<TeamMember | null> {
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("*")
      .match({ team_id: teamId, user_id: userId })
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!teamMember) return null;

    return teamMember;
  }

  async findByTeamId(teamId: string): Promise<TeamMember[]> {
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);

    return teamMember;
  }

  async findActiveByTeamId(teamId: string): Promise<TeamMemberWithUser[]> {
    const { data: teamMembers, error } = await supabase
      .from("team_members")
      .select(
        `
          id,
          team_id,
          user_id,
          role,
          active,
          created_at,
          updated_at,
          user:users (
            id,
            name,
            email,
            slack_user_id,
            language,
            status
          )
        `,
      )
      .match({ team_id: teamId, active: true });

    if (error) throw new Error(error.message);

    return teamMembers as unknown as TeamMemberWithUser[];
  }

  async create(data: CreateTeamMemberData): Promise<TeamMember> {
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!teamMember) throw new Error("Failed to create team member");

    return teamMember;
  }

  async update(id: string, data: UpdateTeamMemberData): Promise<TeamMember> {
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!teamMember) throw new Error("Failed to update team member");

    return teamMember;
  }

  async deactivate(id: string): Promise<TeamMember> {
    return await this.update(id, { active: false });
  }
}

export const teamMemberRepository = new TeamMemberRepository();
