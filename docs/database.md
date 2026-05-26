```mermaid
erDiagram
  TEAMS ||--o{ TEAM_MEMBERS : has
  USERS ||--o{ TEAM_MEMBERS : belongs_to

  TEAMS ||--o{ CHECKINS : has
  CHECKINS ||--o{ CHECKIN_RESPONSES : has
  USERS ||--o{ CHECKIN_RESPONSES : submits

  CHECKINS ||--o{ NOTIFICATION_LOGS : has
  USERS ||--o{ NOTIFICATION_LOGS : receives

  TEAMS {
    uuid id PK
    string name UK
    string timezone
    time check_in_time
    int reminder_delay_hours
    boolean active
    timestamp created_at
    timestamp updated_at
  }

  USERS {
    uuid id PK
    string name
    string email UK
    string slack_user_id UK
    string language
    string global_role
    string status
    timestamp created_at
    timestamp updated_at
  }

  TEAM_MEMBERS {
    uuid id PK
    uuid team_id FK
    uuid user_id FK
    string role
    boolean active
    timestamp created_at
    timestamp updated_at
  }

  CHECKINS {
    uuid id PK
    uuid team_id FK
    date date
    timestamp scheduled_at
    timestamp sent_at
    timestamp reminder_scheduled_at
    timestamp reminder_sent_at
    string status
    timestamp created_at
    timestamp updated_at
  }

  CHECKIN_RESPONSES {
    uuid id PK
    uuid checkin_id FK
    uuid user_id FK
    string status
    timestamp responded_at
    timestamp created_at
    timestamp updated_at
  }

  NOTIFICATION_LOGS {
    uuid id PK
    uuid checkin_id FK
    uuid user_id FK
    string channel
    string type
    string status
    string slack_channel_id
    string slack_message_ts
    timestamp sent_at
    string error_message
    timestamp created_at
  }
```

## Constraints

- `teams.name` — unique
- `users.email` — unique
- `users.slack_user_id` — unique, nullable
- `team_members(team_id, user_id)` — unique
- `checkins(team_id, date)` — unique
- `checkin_responses(checkin_id, user_id)` — unique
- `notification_logs(checkin_id, user_id, type)` — unique
