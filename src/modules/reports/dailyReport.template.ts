import { DateTime } from "luxon";
import {
  DailyReport,
  DailyReportEmail,
  REPORT_STATUS,
  TeamReport,
} from "./dailyReport.types";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatReportDate = (date: string): string =>
  DateTime.fromISO(date, { zone: "Europe/Kyiv" })
    .setLocale("uk")
    .toFormat("dd.MM.yyyy");

const formatGeneratedAt = (date: string): string =>
  DateTime.fromISO(date)
    .setZone("Europe/Kyiv")
    .setLocale("uk")
    .toFormat("dd.MM.yyyy, HH:mm");

const buildNonRespondersHtml = (team: TeamReport): string => {
  if (team.nonResponders.length === 0) {
    return "";
  }

  const rows = team.nonResponders
    .map(
      (member) => `
        <tr>
          <td
            style="
              padding: 10px 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              color: #111827;
            "
          >
            ${escapeHtml(member.name)}
          </td>

          <td
            style="
              padding: 10px 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            "
          >
            <a
              href="mailto:${escapeHtml(member.email)}"
              style="color: #2563eb; text-decoration: none;"
            >
              ${escapeHtml(member.email)}
            </a>
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="margin-top: 16px;">
      <p
        style="
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 600;
          color: #991b1b;
        "
      >
        Не відповіли:
      </p>

      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        "
      >
        <thead>
          <tr>
            <th
              align="left"
              style="
                padding: 10px 12px;
                background-color: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
              "
            >
              Ім’я
            </th>

            <th
              align="left"
              style="
                padding: 10px 12px;
                background-color: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
              "
            >
              Email
            </th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

const getTeamStatusHtml = (team: TeamReport): string => {
  switch (team.status) {
    case REPORT_STATUS.ALL_RESPONDED:
      return `
        <div
          style="
            padding: 12px 14px;
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 6px;
            color: #065f46;
            font-size: 14px;
          "
        >
          Усі учасники відповіли.
        </div>
      `;

    case REPORT_STATUS.HAS_NON_RESPONDERS:
      return `
        <div
          style="
            padding: 12px 14px;
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            color: #991b1b;
            font-size: 14px;
          "
        >
          Є учасники, які не відповіли.
        </div>
      `;

    case REPORT_STATUS.CHECKIN_NOT_CREATED:
      return `
        <div
          style="
            padding: 12px 14px;
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 6px;
            color: #92400e;
            font-size: 14px;
          "
        >
          Перевірку на сьогодні не було створено.
        </div>
      `;

    case REPORT_STATUS.CHECKIN_FAILED:
      return `
        <div
          style="
            padding: 12px 14px;
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            color: #991b1b;
            font-size: 14px;
          "
        >
          Під час проведення перевірки сталася технічна помилка.
        </div>
      `;
  }
};

const buildTeamHtml = (team: TeamReport): string => `
  <div
    style="
      margin-top: 20px;
      padding: 20px;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    "
  >
    <h2
      style="
        margin: 0 0 14px;
        font-size: 18px;
        line-height: 24px;
        color: #111827;
      "
    >
      ${escapeHtml(team.teamName)}
    </h2>

    ${getTeamStatusHtml(team)}

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="margin-top: 16px; width: 100%;"
    >
      <tr>
        <td
          style="
            padding: 6px 0;
            font-size: 14px;
            color: #6b7280;
          "
        >
          Усього учасників
        </td>

        <td
          align="right"
          style="
            padding: 6px 0;
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          "
        >
          ${team.totalMembers}
        </td>
      </tr>

      <tr>
        <td
          style="
            padding: 6px 0;
            font-size: 14px;
            color: #6b7280;
          "
        >
          Відповіли
        </td>

        <td
          align="right"
          style="
            padding: 6px 0;
            font-size: 14px;
            font-weight: 600;
            color: #065f46;
          "
        >
          ${team.respondedCount}
        </td>
      </tr>

      <tr>
        <td
          style="
            padding: 6px 0;
            font-size: 14px;
            color: #6b7280;
          "
        >
          Не відповіли
        </td>

        <td
          align="right"
          style="
            padding: 6px 0;
            font-size: 14px;
            font-weight: 600;
            color: #991b1b;
          "
        >
          ${team.nonResponderCount}
        </td>
      </tr>
    </table>

    ${buildNonRespondersHtml(team)}
  </div>
`;

const buildDailyReportSubject = (report: DailyReport): string =>
  `Щоденний звіт з безпеки — ${formatReportDate(report.reportDate)}`;

const buildDailyReportHtml = (report: DailyReport): string => {
  const teamReportsHtml = report.teams.map(buildTeamHtml).join("");

  const technicalWarnings =
    report.totals.teamsWithoutCheckinCount > 0 ||
    report.totals.failedCheckinCount > 0
      ? `
        <div
          style="
            margin-top: 16px;
            padding: 14px;
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 6px;
          "
        >
          <p
            style="
              margin: 0 0 8px;
              font-size: 14px;
              font-weight: 600;
              color: #92400e;
            "
          >
            Технічні попередження
          </p>

          ${
            report.totals.teamsWithoutCheckinCount > 0
              ? `
                <p
                  style="
                    margin: 4px 0;
                    font-size: 14px;
                    color: #92400e;
                  "
                >
                  Перевірку не створено для команд:
                  ${report.totals.teamsWithoutCheckinCount}
                </p>
              `
              : ""
          }

          ${
            report.totals.failedCheckinCount > 0
              ? `
                <p
                  style="
                    margin: 4px 0;
                    font-size: 14px;
                    color: #92400e;
                  "
                >
                  Перевірок із помилкою:
                  ${report.totals.failedCheckinCount}
                </p>
              `
              : ""
          }
        </div>
      `
      : "";

  return `
    <!doctype html>
    <html lang="uk">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Щоденний звіт з безпеки</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="width: 100%; background-color: #f3f4f6;"
        >
          <tr>
            <td align="center" style="padding: 24px 12px;">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 640px;
                  margin: 0 auto;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 24px;
                      background-color: #1f2937;
                      border-radius: 8px 8px 0 0;
                    "
                  >
                    <h1
                      style="
                        margin: 0;
                        font-size: 24px;
                        line-height: 32px;
                        color: #ffffff;
                      "
                    >
                      Щоденний звіт з безпеки
                    </h1>

                    <p
                      style="
                        margin: 8px 0 0;
                        font-size: 14px;
                        line-height: 20px;
                        color: #d1d5db;
                      "
                    >
                      Дата перевірки:
                      ${formatReportDate(report.reportDate)}
                    </p>

                    <p
                      style="
                        margin: 4px 0 0;
                        font-size: 14px;
                        line-height: 20px;
                        color: #d1d5db;
                      "
                    >
                      Сформовано:
                      ${formatGeneratedAt(report.generatedAt)}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 24px;
                      background-color: #ffffff;
                      border-bottom: 1px solid #e5e7eb;
                    "
                  >
                    <h2
                      style="
                        margin: 0 0 16px;
                        font-size: 18px;
                        color: #111827;
                      "
                    >
                      Загальний результат
                    </h2>

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="width: 100%;"
                    >
                      <tr>
                        <td
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            color: #6b7280;
                          "
                        >
                          Команд
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            font-weight: 600;
                            color: #111827;
                          "
                        >
                          ${report.totals.totalTeams}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            color: #6b7280;
                          "
                        >
                          Учасників
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            font-weight: 600;
                            color: #111827;
                          "
                        >
                          ${report.totals.totalMembers}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            color: #6b7280;
                          "
                        >
                          Відповіли
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            font-weight: 600;
                            color: #065f46;
                          "
                        >
                          ${report.totals.respondedCount}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            color: #6b7280;
                          "
                        >
                          Не відповіли
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 8px 0;
                            font-size: 14px;
                            font-weight: 600;
                            color: #991b1b;
                          "
                        >
                          ${report.totals.nonResponderCount}
                        </td>
                      </tr>
                    </table>

                    ${technicalWarnings}
                  </td>
                </tr>

                <tr>
                  <td style="padding-top: 4px;">
                    ${teamReportsHtml}
                  </td>
                </tr>

                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 12px;
                      font-size: 12px;
                      line-height: 18px;
                      color: #6b7280;
                    "
                  >
                    Це автоматичний звіт Team Pulse.
                    Відповідати на цей лист не потрібно.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const buildDailyReportText = (report: DailyReport): string => {
  const lines: string[] = [];

  lines.push("ЩОДЕННИЙ ЗВІТ З БЕЗПЕКИ");
  lines.push("");

  lines.push(`Дата перевірки: ${formatReportDate(report.reportDate)}`);
  lines.push(`Сформовано: ${formatGeneratedAt(report.generatedAt)}`);
  lines.push("");

  lines.push("ЗАГАЛЬНИЙ РЕЗУЛЬТАТ");
  lines.push("------------------------------");
  lines.push(`Команд: ${report.totals.totalTeams}`);
  lines.push(`Учасників: ${report.totals.totalMembers}`);
  lines.push(`Відповіли: ${report.totals.respondedCount}`);
  lines.push(`Не відповіли: ${report.totals.nonResponderCount}`);

  if (report.totals.teamsWithoutCheckinCount > 0) {
    lines.push(
      `Перевірку не створено: ${report.totals.teamsWithoutCheckinCount}`,
    );
  }

  if (report.totals.failedCheckinCount > 0) {
    lines.push(`Перевірок з помилкою: ${report.totals.failedCheckinCount}`);
  }

  lines.push("");

  for (const team of report.teams) {
    lines.push("========================================");
    lines.push(`Команда: ${team.teamName}`);
    lines.push("");

    switch (team.status) {
      case REPORT_STATUS.ALL_RESPONDED:
        lines.push("Статус: Усі учасники відповіли.");
        break;

      case REPORT_STATUS.HAS_NON_RESPONDERS:
        lines.push("Статус: Є учасники, які не відповіли.");
        break;

      case REPORT_STATUS.CHECKIN_NOT_CREATED:
        lines.push("Статус: Перевірку на сьогодні не було створено.");
        break;

      case REPORT_STATUS.CHECKIN_FAILED:
        lines.push(
          "Статус: Під час проведення перевірки сталася технічна помилка.",
        );
        break;
    }

    lines.push("");
    lines.push(`Усього учасників: ${team.totalMembers}`);
    lines.push(`Відповіли: ${team.respondedCount}`);
    lines.push(`Не відповіли: ${team.nonResponderCount}`);

    if (team.nonResponders.length > 0) {
      lines.push("");
      lines.push("Не відповіли:");

      for (const member of team.nonResponders) {
        lines.push(`- ${member.name} <${member.email}>`);
      }
    }

    lines.push("");
  }

  lines.push("========================================");
  lines.push("");
  lines.push("Це автоматичний звіт Team Pulse.");
  lines.push("Відповідати на цей лист не потрібно.");

  return lines.join("\n");
};

export const buildDailyReportEmail = (
  report: DailyReport,
): DailyReportEmail => {
  return {
    subject: buildDailyReportSubject(report),
    html: buildDailyReportHtml(report),
    text: buildDailyReportText(report),
  };
};
