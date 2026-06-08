import { supabase } from "./../infrastructure/database/supabase.client";
import {
  CheckinResponse,
  CreateCheckinResponseData,
} from "../types/checkinResponse.types";

class CheckinResponseRepository {
  async findById(id: string): Promise<CheckinResponse | null> {
    const { data: checkinResponse, error } = await supabase
      .from("checkin_responses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!checkinResponse) return null;

    return checkinResponse;
  }

  async findByCheckinAndUser(
    checkinId: string,
    userId: string,
  ): Promise<CheckinResponse | null> {
    const { data: checkinResponse, error } = await supabase
      .from("checkin_responses")
      .select("*")
      .match({ checkin_id: checkinId, user_id: userId })
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!checkinResponse) return null;

    return checkinResponse;
  }

  async findByCheckinId(checkinId: string): Promise<CheckinResponse[]> {
    const { data: checkinResponses, error } = await supabase
      .from("checkin_responses")
      .select("*")
      .eq("checkin_id", checkinId);

    if (error) throw new Error(error.message);

    return checkinResponses;
  }

  async create(data: CreateCheckinResponseData): Promise<CheckinResponse> {
    const { data: checkinResponse, error } = await supabase
      .from("checkin_responses")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!checkinResponse) throw new Error("Failed to create checkin response");

    return checkinResponse;
  }
}

export const checkinResponseRepository = new CheckinResponseRepository();
