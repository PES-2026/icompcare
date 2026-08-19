import { Pedagogue } from "@domain/entities/pedagogue";
import { RoleEnum } from "@domain/enum/role";
import { UserStatusEnum } from "@domain/enum/userStatus";
import { UserFilters } from "@domain/repositories/filters/userFilters";
import { IPedagogueRepository } from "@domain/repositories/pedagogueRepository";
import { UserAuthResult } from "@domain/repositories/results/userAuthResult";
import { UserResult } from "@domain/repositories/results/userResult";
import { PaginatedResult } from "@domain/shared/pagination";
import { Prisma, PrismaClient } from "@prisma/src/infrastructure/database/generated/client";

export class PrismaPedagogueRepository implements IPedagogueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(filters: UserFilters, page: number, limit: number): Promise<PaginatedResult<UserResult>> {
    const skip = (page - 1) * limit;

    const where: Prisma.PedagogueWhereInput = {
      removed: false,
    };

    if (filters.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }

    if (filters.userStatus) {
      where.userStatus = filters.userStatus;
    }

    const [totalItems, pedagogues] = await Promise.all([
      this.prisma.pedagogue.count({ where }),
      this.prisma.pedagogue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
    ]);

    const items: UserResult[] = pedagogues.map((p) => ({
      id: p.externalId,
      name: p.name,
      email: p.email,
      phoneNumber: p.phoneNumber ?? "",
      registrationNumber: p.registration,
      role: RoleEnum.PEDAGOGUE,
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

  async save(pedagogue: Pedagogue): Promise<void> {
    const externalId = pedagogue.id.value;

    const baseData = {
      externalId,
      registration: pedagogue.registrationNumber.value,
      name: pedagogue.name.value,
      email: pedagogue.email.value,
      phoneNumber: pedagogue.phoneNumber.value,
      userStatus: pedagogue.userStatus.value,
      password: pedagogue.password!.value,
    };

    await this.prisma.pedagogue.create({
      data: {
        ...baseData,
      },
    });
  }

  async findById(id: string): Promise<UserResult | null> {
    const raw = await this.prisma.pedagogue.findFirst({
      where: { externalId: id, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber ?? "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      role: RoleEnum.PEDAGOGUE,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async findByIdWithPassword(id: string): Promise<UserAuthResult | null> {
    const raw = await this.prisma.pedagogue.findFirst({
      where: { externalId: id, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber ?? "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      role: RoleEnum.PEDAGOGUE,
      password: raw.password,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<UserResult | null> {
    const raw = await this.prisma.pedagogue.findFirst({
      where: { email, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber ?? "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      role: RoleEnum.PEDAGOGUE,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async update(pedagogue: Pedagogue): Promise<void> {
    const passwordValue = pedagogue.password ? pedagogue.password.value : undefined;

    await this.prisma.pedagogue.update({
      where: { externalId: pedagogue.id.value },
      data: {
        name: pedagogue.name.value,
        email: pedagogue.email.value,
        phoneNumber: pedagogue.phoneNumber.value,
        registration: pedagogue.registrationNumber.value,
        userStatus: pedagogue.userStatus.value,
      },
    });
    if (passwordValue) {
      await this.prisma.pedagogue.update({
        where: { externalId: pedagogue.id.value },
        data: { password: passwordValue },
      });
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.pedagogue.update({
      where: { externalId: id },
      data: { password: passwordHash },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const account = await this.prisma.pedagogue.findFirst({
      where: {
        email: email,
        removed: false,
      },
    });

    return !!account;
  }

  async existsByRegistrationNumber(registrationNumber: string): Promise<boolean> {
    const account = await this.prisma.pedagogue.findFirst({
      where: {
        registration: registrationNumber,
        removed: false,
      },
    });

    return !!account;
  }

  async existsByUUID(externalId: string): Promise<boolean> {
    const pedagogue = await this.prisma.pedagogue.findFirst({
      where: { externalId, removed: false },
    });

    return !!pedagogue;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.pedagogue.update({
      where: { externalId: id },
      data: {
        removed: true,
        userStatus: UserStatusEnum.DISABLED,
      },
    });
  }

  async activate(id: string): Promise<void> {
    await this.prisma.pedagogue.update({
      where: { externalId: id },
      data: {
        removed: false,
        userStatus: UserStatusEnum.ENABLED,
      },
    });
  }

  async findByEmailWithPassword(email: string): Promise<UserAuthResult | null> {
    const raw = await this.prisma.pedagogue.findFirst({
      where: { email, removed: false },
    });

    if (!raw) return null;

    return {
      id: raw.externalId,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber ?? "",
      registrationNumber: raw.registration,
      userStatus: raw.userStatus,
      role: RoleEnum.PEDAGOGUE,
      password: raw.password,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
