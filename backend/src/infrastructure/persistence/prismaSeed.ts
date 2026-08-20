import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";

import { UserStatus } from "@prisma/src/infrastructure/database/generated/client";

import { prisma } from "./prisma";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const existingPedagogue = await prisma.pedagogue.findFirst({
    where: { email: "pedagogue@icomp.ufam.edu.br" },
  });

  if (!existingPedagogue) {
    await prisma.pedagogue.create({
      data: {
        externalId: randomUUID(),
        registration: "12345678",
        name: "Ana Lúcia Machado dos Santos",
        email: "pedagogue@icomp.ufam.edu.br",
        phoneNumber: "92999998888",
        password: passwordHash,
        userStatus: UserStatus.APPROVED,
        removed: false,
      },
    });
  }

  const courses = [
    { name: "Engenharia de Software", acronym: "ES" },
    { name: "Ciência da Computação", acronym: "CC" },
    { name: "Sistemas de Informação", acronym: "SI" },
    { name: "Engenharia da Computação", acronym: "EC" },
    { name: "Inteligência Artificial", acronym: "IA" },
  ];

  for (const course of courses) {
    const existing = await prisma.course.findFirst({
      where: { name: course.name },
    });
    if (!existing) {
      await prisma.course.create({
        data: {
          externalId: randomUUID(),
          name: course.name,
          acronym: course.acronym,
          removed: false,
        },
      });
    }
  }

  const attendanceTypes = [
    "Orientação Pedagógica",
    "Acolhimento Pedagógico",
    "Adaptação Curricular",
    "Acompanhamento de Rendimento",
  ];

  for (const type of attendanceTypes) {
    const existing = await prisma.attendanceType.findFirst({
      where: { name: type },
    });
    if (!existing) {
      await prisma.attendanceType.create({
        data: {
          externalid: randomUUID(),
          name: type,
          removed: false,
        },
      });
    }
  }

  const diagnoses = [
    { name: "Transtorno do Espectro Autista", acronym: "TEA", CID: "F84.0" },
    { name: "Transtorno do Déficit de Atenção com Hiperatividade", acronym: "TDAH", CID: "F90.0" },
    { name: "Transtorno de Ansiedade Generalizada", acronym: "TAG", CID: "F41.1" },
    { name: "Dislexia", acronym: "DISLEXIA", CID: "F81.0" },
  ];

  for (const diagnosis of diagnoses) {
    const existing = await prisma.diagnosis.findFirst({
      where: { name: diagnosis.name },
    });
    if (!existing) {
      await prisma.diagnosis.create({
        data: {
          externalId: randomUUID(),
          name: diagnosis.name,
          acronym: diagnosis.acronym,
          CID: diagnosis.CID,
          removed: false,
        },
      });
    }
  }
}

main()
  .then(async () => {
    console.log("Database seeded successfully");
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Database seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
