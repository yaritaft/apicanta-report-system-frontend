import type { StudentStatus } from "@/types";

const firstNames = [
  "Lucía", "Martín", "Valentina", "Santiago", "Camila", "Mateo", "Sofía",
  "Benjamín", "Isabella", "Tomás", "Emma", "Nicolás", "Mía", "Juan",
  "Catalina", "Agustín", "Renata", "Sebastián", "Victoria", "Facundo",
  "Florencia", "Lautaro", "Julieta", "Joaquín", "Delfina", "Felipe",
  "Antonella", "Bautista", "Alma", "Thiago", "Olivia", "Emiliano",
  "Bianca", "Maximiliano", "Abril", "Francisco", "Lola", "Pedro",
  "Pilar", "Bruno", "Clara", "León", "Rosario", "Daniel", "Malena",
  "Ignacio", "Milagros", "Ramiro", "Zoe", "Gonzalo",
];

const lastNames = [
  "García", "Rodríguez", "Martínez", "López", "González", "Pérez",
  "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez",
  "Díaz", "Hernández", "Morales", "Ortiz", "Silva", "Romero",
  "Álvarez", "Ruiz", "Mendoza", "Vargas", "Castro", "Fernández",
  "Medina", "Herrera", "Gutiérrez", "Ramos", "Reyes", "Molina",
  "Acosta", "Navarro", "Campos", "Domínguez", "Santos", "Rojas",
  "Cruz", "Aguilar", "Vega", "Sosa", "Peralta", "Cabrera",
  "Figueroa", "Ríos", "Ibarra", "Suárez", "Bustos", "Córdoba",
  "Ponce", "Ledesma",
];

const domains = [
  "universidad.edu", "uba.edu.ar", "utn.edu.ar", "unlp.edu.ar",
  "unr.edu.ar", "unc.edu.ar", "unsam.edu.ar", "utdt.edu",
];

const statuses: StudentStatus["weekStatus"][] = [
  "completed", "completed", "completed", "completed",
  "pending", "pending",
  "not_sent",
  "expired", "expired",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateMockStudents(count: number): StudentStatus[] {
  const rand = seededRandom(42);
  const students: StudentStatus[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(rand() * firstNames.length)];
    const lastName = lastNames[Math.floor(rand() * lastNames.length)];
    const domain = domains[Math.floor(rand() * domains.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const isActive = rand() > 0.15;

    const weekStatus = isActive ? status : "not_sent";

    const completedAt =
      weekStatus === "completed"
        ? new Date(
            Date.now() - Math.floor(rand() * 6 * 24 * 60 * 60 * 1000),
          ).toISOString()
        : null;

    let consecutiveWeeksMissed = 0;
    if (weekStatus === "expired") {
      consecutiveWeeksMissed = 1 + Math.floor(rand() * 7);
    } else if (weekStatus === "pending" || weekStatus === "not_sent") {
      consecutiveWeeksMissed = Math.floor(rand() * 5);
    }

    const mockToken = `mock-token-${String(i + 1).padStart(4, "0")}`;
    const magicLink =
      weekStatus === "pending"
        ? `http://localhost:3001/forms/${mockToken}`
        : null;

    students.push({
      studentId: `mock-${String(i + 1).padStart(4, "0")}`,
      externalId: `STU-${String(i + 1).padStart(4, "0")}`,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@${domain}`,
      isActive,
      weekStatus,
      completedAt,
      consecutiveWeeksMissed,
      magicLink,
    });
  }

  return students;
}

export const mockStudentsStatus: StudentStatus[] = generateMockStudents(1000);
