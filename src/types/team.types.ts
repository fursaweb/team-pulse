type Team = {
  id: string;
  name: string;
  timezone: string;
  check_in_time: string;
  reminder_delay_hours: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type CreateTeamData = {
  name: string;
  timezone?: string;
  check_in_time?: string;
  reminder_delay_hours?: number;
  active?: boolean;
};

type UpdateTeamData = {
  name?: string;
  timezone?: string;
  check_in_time?: string;
  reminder_delay_hours?: number;
  active?: boolean;
};

export { Team, CreateTeamData, UpdateTeamData };
