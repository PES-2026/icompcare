import { ApplicationError } from "@application/errors/applicationError";
import { InvalidCredentialsError } from "@application/errors/user/invalidCredentialsError";
import { UserStatusEnum } from "@domain/enum/userStatus";
import { AuthResult } from "@domain/repositories/results/authResult";
import { IHashService } from "@domain/services/hashService";
import { ITokenService } from "@domain/services/tokenService";
import { Result } from "@domain/shared/result";

import { AuthenticateUserRequestDTO } from "../../dtos/user/authenticateUserDto";

import { UserResolver } from "./userResolver";

export class AuthenticateUser {
  constructor(
    private readonly userResolver: UserResolver,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: AuthenticateUserRequestDTO): Promise<Result<AuthResult, ApplicationError>> {
    const resolvedData = await this.userResolver.execute(input.email);

    if (resolvedData.isFailure) {
      return Result.fail<AuthResult>(resolvedData.error!);
    }

    const { userData, role } = resolvedData.getValue();

    if (userData.userStatus !== UserStatusEnum.APPROVED && userData.userStatus !== UserStatusEnum.ENABLED) {
      return Result.fail<AuthResult>(new InvalidCredentialsError());
    }

    const isPasswordValid = await this.hashService.compare(input.password, userData.password);

    if (!isPasswordValid) {
      return Result.fail<AuthResult>(new InvalidCredentialsError());
    }

    const { password: _, ...userPayload } = userData;
    const token = this.tokenService.generateToken({ ...userPayload, role: role });

    const authResult: AuthResult = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber || "",
      registrationNumber: userData.registrationNumber,
      role: role,
      userStatus: userData.userStatus,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      token,
    };

    return Result.ok<AuthResult>(authResult);
  }
}
