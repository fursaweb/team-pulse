enum LANG {
  UK = "uk",
  EN = "en",
}

enum GLOBAL_ROLE {
  ADMIN = "ADMIN",
  USER = "USER",
}

enum STATUS {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  DISABLED = "DISABLED",
}

type User = {
  id: string;
  name: string;
  email: string;
  slack_user_id: string | null;
  language: LANG;
  global_role: GLOBAL_ROLE;
  status: STATUS;
  created_at: string;
  updated_at: string;
};

type CreateUserData = {
  name: string;
  email: string;
  slack_user_id?: string | null;
  language?: LANG;
  global_role?: GLOBAL_ROLE;
  status?: STATUS;
};

type UpdateUserData = {
  name?: string;
  email?: string;
  slack_user_id?: string | null;
  language?: LANG;
  global_role?: GLOBAL_ROLE;
  status?: STATUS;
};

export { LANG, GLOBAL_ROLE, STATUS, User, CreateUserData, UpdateUserData };
