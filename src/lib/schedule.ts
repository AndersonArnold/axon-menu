import { GradeHorarios, DiasSemana } from "./types";

const DIAS: DiasSemana[] = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

/**
 * Determines whether the store is currently open based on its schedule.
 * Compares current local time (Brazil/São Paulo) against the schedule.
 */
export function isStoreOpen(grade: GradeHorarios): boolean {
  try {
    // Use Brazil/São_Paulo timezone for accuracy in production
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );

    const diaSemana = DIAS[now.getDay()];
    const horario = grade[diaSemana];

    if (!horario || !horario.aberto) return false;

    const [abrH, abrM] = horario.abertura.split(":").map(Number);
    const [fecH, fecM] = horario.fechamento.split(":").map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const aberturaMinutes = abrH * 60 + abrM;
    let fechamentoMinutes = fecH * 60 + fecM;

    // Handle overnight schedules (e.g., opens 18:00, closes 02:00)
    if (fechamentoMinutes < aberturaMinutes) {
      fechamentoMinutes += 24 * 60;
    }

    return currentMinutes >= aberturaMinutes && currentMinutes < fechamentoMinutes;
  } catch {
    return false;
  }
}

/**
 * Returns the today's schedule entry label, e.g. "09:00 – 22:00".
 */
export function getTodayScheduleLabel(grade: GradeHorarios): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const diaSemana = DIAS[now.getDay()];
  const horario = grade[diaSemana];

  if (!horario || !horario.aberto) return "Fechado hoje";
  return `${horario.abertura} – ${horario.fechamento}`;
}
