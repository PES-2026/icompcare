import { Professor } from "@domain/entities/professor";
import { RoleEnum } from "@domain/enum/role";
import { UserStatusEnum } from "@domain/enum/userStatus";
import { UserFilters } from "@domain/repositories/filters/userFilters";
import { IProfessorRepository } from "@domain/repositories/professorRepository";
import { UserAuthResult } from "@domain/repositories/results/userAuthResult";
import { UserResult } from "@domain/repositories/results/userResult";
import { PaginatedResult } from "@domain/shared/pagination";
import { Prisma, PrismaClient } from "@prisma/src/infrastructure/database/generated/client";

export class PrismaProfessorRepository implements IProfessorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(filters: UserFilters, page: number, limit: number): Promise<PaginatedResult<UserResult>> {
    const skip = (page - 1) * limit;

    const where: Prisma.ProfessorWhereInput = {
      removed: false,
    };

    if (filters.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }

    if (filters.userStatus) {
      where.userStatus = filters.userStatus;
    }

    const [totalItems, professors] = await Promise.all([
      this.prisma.professor.count({ where }),
      this.prisma.professor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
    ]);

    const items: UserResult[] = professors.map((p) => ({
      id: p.externalId,
      name: p.name,
      email: p.email,
      phoneNumber: p.phoneNumber || "",
      registrationNumber: p.registration,
      role: RoleEnum.PROFESSOR,
      userStatus: p.userStatus,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      items,
    };
  }

  async save(professor: Professor): Promise<void> {
    const externalId = professor.id.value;

    const baseData = {
      externalId,
      registration: professor.registrationNumber.value,
      name: professor.name.value,
      email: professor.email.value,
      phoneNumber: professor.phoneNumber.value,
      userStatus: professor.userStatus.value,
      password: professor.password!.value,
    };
    await this.prisma.professor.create({
      data: {
        ...baseData,
      },
    });
  }

  async findById(id: string): Promise<UserResult | null> {
    const raw = await this.prisma.professor.findFirst({
      where: { externalId: id, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber || "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      role: RoleEnum.PROFESSOR,
    };
  }

  async findByIdWithPassword(id: string): Promise<UserAuthResult | null> {
    const raw = await this.prisma.professor.findFirst({
      where: { externalId: id, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber || "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      role: RoleEnum.PROFESSOR,
      password: raw.password,
    };
  }

  async findByEmail(email: string): Promise<UserResult | null> {
    const raw = await this.prisma.professor.findFirst({
      where: { email, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber || "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      role: RoleEnum.PROFESSOR,
    };
  }

  async update(professor: Professor): Promise<void> {
    const passwordValue = professor.password ? professor.password.value : undefined;

    await this.prisma.professor.update({
      where: { externalId: professor.id.value },
      data: {
        name: professor.name.value,
        email: professor.email.value,
        phoneNumber: professor.phoneNumber.value,
        registration: professor.registrationNumber.value,
        userStatus: professor.userStatus.value,
      },
    });
    if (passwordValue) {
      await this.prisma.professor.update({
        where: { externalId: professor.id.value },
        data: {
          password: passwordValue,
        },
      });
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.professor.update({
      where: { externalId: id },
      data: { password: passwordHash },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const account = await this.prisma.professor.findFirst({
      where: {
        email: email,
        removed: false,
      },
    });

    return !!account;
  }

  async existsByRegistrationNumber(registrationNumber: string): Promise<boolean> {
    const account = await this.prisma.professor.findFirst({
      where: {
        registration: registrationNumber,
        removed: false,
      },
    });

    return !!account;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.professor.update({
      where: { externalId: id },
      data: {
        removed: true,
        userStatus: UserStatusEnum.DISABLED,
      },
    });
  }

  async activate(id: string): Promise<void> {
    await this.prisma.professor.update({
      where: { externalId: id },
      data: {
        removed: false,
        userStatus: UserStatusEnum.ENABLED,
      },
    });
  }

  async findByEmailWithPassword(email: string): Promise<UserAuthResult | null> {
    const raw = await this.prisma.professor.findFirst({
      where: { email, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber || "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      role: RoleEnum.PROFESSOR,
      password: raw.password,
    };
  }
}
