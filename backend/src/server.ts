import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { ApproveAccountRequest } from "@application/useCases/accountRequest/approveAccountRequest";
import { CreateAccountRequest } from "@application/useCases/accountRequest/createAccountRequest";
import { ListPendingAccountRequests } from "@application/useCases/accountRequest/listPendingAccountRequests";
import { AppointmentById } from "@application/useCases/appointment/appointmentById";
import { AppointmentResolver } from "@application/useCases/appointment/appointmentResolver";
import { CancelAppointment } from "@application/useCases/appointment/cancelAppointment";
import { CancelAppointmentPedagogue } from "@application/useCases/appointment/cancelAppointmentPedagogue";
import { CancelAppointmentStudent } from "@application/useCases/appointment/cancelAppointmentStudent";
import { ConfirmAppointment } from "@application/useCases/appointment/confirmAppointment";
import { GetAppointmentByToken } from "@application/useCases/appointment/getAppointmentByToken";
import { ListAppointmentsByPedagogue } from "@application/useCases/appointment/listAppointmentsByPedagogue";
import { RequestAppointment } from "@application/useCases/appointment/requestAppointment";
import { RescheduleAppointment } from "@application/useCases/appointment/rescheduleAppointment";
import { RescheduleAppointmentPedagogue } from "@application/useCases/appointment/rescheduleAppointmentPedagogue";
import { RescheduleAppointmentStudent } from "@application/useCases/appointment/rescheduleAppointmentStudent";
import { VerifyMissedExpiredStatus } from "@application/useCases/appointment/verifyMissedExpiredStatus";
import { AttendanceById } from "@application/useCases/attendance/attendanceById";
import { AttendancesByStudent } from "@application/useCases/attendance/attendanceByStudent";
import { CreateAttendance } from "@application/useCases/attendance/createAttendance";
import { ListAttendances } from "@application/useCases/attendance/listAttendances";
import { RemoveAttendance } from "@application/useCases/attendance/removeAttendance";
import { UpdateAttendance } from "@application/useCases/attendance/updateAttendance";
import { AttendanceTypeById } from "@application/useCases/attendanceType/attendanceTypeById";
import { CreateAttendanceType } from "@application/useCases/attendanceType/createAttendanceType";
import { ListAttendanceTypes } from "@application/useCases/attendanceType/listAttendanceType";
import { RemoveAttendanceType } from "@application/useCases/attendanceType/removeAttendanceType";
import { UpdateAttendanceType } from "@application/useCases/attendanceType/updateAttendanceType";
import { CreateAvailability } from "@application/useCases/availability/createAvailability";
import { GetWeekdayFromDate } from "@application/useCases/availability/getWeekdayFromDate";
import { ListAvailabilitiesByPedagogue } from "@application/useCases/availability/listAvailabilitiesByPedagogue";
import { PreviewAvailability } from "@application/useCases/availability/previewAvailability";
import { ReleaseAvailability } from "@application/useCases/availability/releaseAvailability";
import { RemoveAvailability } from "@application/useCases/availability/removeAvailability";
import { RemoveManyAvailabilities } from "@application/useCases/availability/removeManyAvailabilities";
import { ValidateAvailability } from "@application/useCases/availability/validateAvailability";
import { CourseById } from "@application/useCases/course/courseById";
import { CreateCourse } from "@application/useCases/course/createCourse";
import { ListCourse } from "@application/useCases/course/listCourse";
import { RemoveCourse } from "@application/useCases/course/removeCourse";
import { UpdateCourse } from "@application/useCases/course/updateCourse";
import { CreateDiagnosis } from "@application/useCases/diagnoses/createDiagnosis";
import { DiagnosisById } from "@application/useCases/diagnoses/diagnosisById";
import { ListDiagnoses } from "@application/useCases/diagnoses/listDiagnoses";
import { RemoveDiagnosis } from "@application/useCases/diagnoses/removeDiagnosis";
import { UpdateDiagnosis } from "@application/useCases/diagnoses/updateDiagnosis";
import { CreateReport } from "@application/useCases/report/createReport";
import { GetReportById } from "@application/useCases/report/getReportById";
import { GetReportInitialData } from "@application/useCases/report/getReportInitialData";
import { ListReportsByStudent } from "@application/useCases/report/listReportsByStudent";
import { RemoveReport } from "@application/useCases/report/removeReport";
import { UpdateReport } from "@application/useCases/report/updateReport";
import { CreateStudent } from "@application/useCases/student/createStudent";
import { ListStudents } from "@application/useCases/student/listStudents";
import { RemoveStudent } from "@application/useCases/student/removeStudent";
import { StudentById } from "@application/useCases/student/studentById";
import { UpdateStudent } from "@application/useCases/student/updateStudent";
import { ActivateUser } from "@application/useCases/user/activateUser";
import { AuthenticateUser } from "@application/useCases/user/authenticateUser";
import { GetAuthenticatedUser } from "@application/useCases/user/getAuthenticatedUser";
import { GetUserById } from "@application/useCases/user/getUserById";
import { ListUsers } from "@application/useCases/user/listUsers";
import { RemoveUser } from "@application/useCases/user/removeUser";
import { RequestPasswordReset } from "@application/useCases/user/requestPasswordReset";
import { ResetPassword } from "@application/useCases/user/resetPassword";
import { UpdateUser } from "@application/useCases/user/updateUser";
import { UpdateUserPassword } from "@application/useCases/user/updateUserPassword";
import { UserResolver } from "@application/useCases/user/userResolver";
import { env } from "@infrastructure/config/env";
import { prisma } from "@infrastructure/persistence/prisma";
import { PrismaAccountRequestRepository } from "@infrastructure/persistence/repositories/prismaAccountRequestRepository";
import { PrismaAppointmentGuestRepository } from "@infrastructure/persistence/repositories/prismaAppointmentGuestRepository";
import { PrismaAppointmentRepository } from "@infrastructure/persistence/repositories/prismaAppointmentWithStudentRepository";
import { PrismaAttendanceRepository } from "@infrastructure/persistence/repositories/prismaAttendanceRepository";
import { PrismaAttendanceTypeRepository } from "@infrastructure/persistence/repositories/prismaAttendanceTypeRepository";
import { PrismaAvailabilityRepository } from "@infrastructure/persistence/repositories/prismaAvailabilityRepository";
import { PrismaCourseRepository } from "@infrastructure/persistence/repositories/prismaCourseRepository";
import { PrismaDiagnosesRepository } from "@infrastructure/persistence/repositories/prismaDiagnosesRepository";
import { PrismaPasswordResetRepository } from "@infrastructure/persistence/repositories/prismaPasswordResetRepository";
import { PrismaPedagogueRepository } from "@infrastructure/persistence/repositories/prismaPedagogueRepository";
import { PrismaProfessorRepository } from "@infrastructure/persistence/repositories/prismaProfessorRepository";
import { PrismaReportRepository } from "@infrastructure/persistence/repositories/prismaReportRepository";
import { PrismaStudentRepository } from "@infrastructure/persistence/repositories/prismaStudentRepository";
import { BcryptHashService } from "@infrastructure/services/bcryptHashService";
import { EmailService } from "@infrastructure/services/email/providers/gmailService";
import { JwtTokenService } from "@infrastructure/services/jwtTokenService";
import { AccountRequestController } from "@presentation/controllers/accountRequestController";
import { AppointmentController } from "@presentation/controllers/appointmentController";
import { AttendanceController } from "@presentation/controllers/attendanceController";
import { AttendanceTypeController } from "@presentation/controllers/attendanceTypeController";
import { AuthController } from "@presentation/controllers/authController";
import { AvailabilityController } from "@presentation/controllers/availabilityController";
import { CourseController } from "@presentation/controllers/courseController";
import { DiagnosesController } from "@presentation/controllers/diagnosesController";
import { ReportController } from "@presentation/controllers/reportController";
import { StudentController } from "@presentation/controllers/studentController";
import { UserController } from "@presentation/controllers/userController";
import { csrfProtection } from "@presentation/middlewares/csrf";
import { errorHandler } from "@presentation/middlewares/errorHandler";
import { accountRequestRoutes } from "@presentation/routes/accountRequestRoutes";
import { appointmentRoutes } from "@presentation/routes/appointmentRoutes";
import { attendanceRoutes } from "@presentation/routes/attendanceRoutes";
import { attendanceTypeRoutes } from "@presentation/routes/attendanceTypeRoutes";
import { authRoutes } from "@presentation/routes/authRoutes";
import { availabilityRoutes } from "@presentation/routes/availabilityRoutes";
import { courseRoutes } from "@presentation/routes/courseRoutes";
import { diagnosesRoutes } from "@presentation/routes/diagnosesRoutes";
import { reportRoutes } from "@presentation/routes/reportRoutes";
import { studentRoutes } from "@presentation/routes/studentRoutes";
import { userRoutes } from "@presentation/routes/userRoutes";

const app = express();

const allowedOrigins = [
  `https://${env.FRONTEND_HOST}`,
  `http://${env.FRONTEND_HOST}`,
  `http://${env.FRONTEND_HOST}:${env.FRONTEND_PORT}`,
];

const courseRepository = new PrismaCourseRepository(prisma);

const courseController = new CourseController(
  new CreateCourse(courseRepository),
  new UpdateCourse(courseRepository),
  new ListCourse(courseRepository),
  new CourseById(courseRepository),
  new RemoveCourse(courseRepository),
);

const studentRepository = new PrismaStudentRepository(prisma);
const studentController = new StudentController(
  new CreateStudent(studentRepository),
  new ListStudents(studentRepository),
  new UpdateStudent(studentRepository),
  new StudentById(studentRepository),
  new RemoveStudent(studentRepository),
);

const attendanceTypeRepository = new PrismaAttendanceTypeRepository(prisma);

const attendanceTypeController = new AttendanceTypeController(
  new CreateAttendanceType(attendanceTypeRepository),
  new UpdateAttendanceType(attendanceTypeRepository),
  new ListAttendanceTypes(attendanceTypeRepository),
  new RemoveAttendanceType(attendanceTypeRepository),
  new AttendanceTypeById(attendanceTypeRepository),
);

const availabilityRepository = new PrismaAvailabilityRepository(prisma);

const pedagogueRepository = new PrismaPedagogueRepository(prisma);

const getWeekdayFromDateUseCase = new GetWeekdayFromDate();
const createAvailabilityUseCase = new CreateAvailability(
  availabilityRepository,
  pedagogueRepository,
  getWeekdayFromDateUseCase,
);
const releaseAvailabilityUseCase = new ReleaseAvailability(availabilityRepository, createAvailabilityUseCase);

const accountRequestRepository = new PrismaAccountRequestRepository(prisma);
const professorRepository = new PrismaProfessorRepository(prisma);
const hashService = new BcryptHashService();

const accountRequestController = new AccountRequestController(
  new CreateAccountRequest(accountRequestRepository, pedagogueRepository, professorRepository, hashService),
  new ApproveAccountRequest(accountRequestRepository, pedagogueRepository, professorRepository),
  new ListPendingAccountRequests(accountRequestRepository),
);

const userController = new UserController(
  new ListUsers(pedagogueRepository, professorRepository),
  new UpdateUser(pedagogueRepository, professorRepository, studentRepository),
  new UpdateUserPassword(pedagogueRepository, professorRepository, hashService),
  new GetUserById(pedagogueRepository, professorRepository),
  new RemoveUser(pedagogueRepository, professorRepository),
  new ActivateUser(pedagogueRepository, professorRepository),
);

const tokenService = new JwtTokenService();
const emailService = new EmailService();
const passwordResetRepository = new PrismaPasswordResetRepository();
const userResolver = new UserResolver(professorRepository, pedagogueRepository);
const authenticateUserUseCase = new AuthenticateUser(userResolver, hashService, tokenService);
const getAuthenticatedUserUseCase = new GetAuthenticatedUser(userResolver);
const requestPasswordResetUseCase = new RequestPasswordReset(userResolver, emailService, passwordResetRepository);
const resetPasswordUseCase = new ResetPassword(
  hashService,
  professorRepository,
  pedagogueRepository,
  passwordResetRepository,
);

const authController = new AuthController(
  authenticateUserUseCase,
  getAuthenticatedUserUseCase,
  requestPasswordResetUseCase,
  resetPasswordUseCase,
);

const attendanceRepository = new PrismaAttendanceRepository(prisma);
const attendanceController = new AttendanceController(
  new CreateAttendance(attendanceRepository, studentRepository),
  new ListAttendances(attendanceRepository),
  new UpdateAttendance(attendanceRepository),
  new AttendancesByStudent(attendanceRepository),
  new RemoveAttendance(attendanceRepository),
  new AttendanceById(attendanceRepository),
);

const diagnosisRepository = new PrismaDiagnosesRepository(prisma);
const diagnosesController = new DiagnosesController(
  new CreateDiagnosis(diagnosisRepository),
  new UpdateDiagnosis(diagnosisRepository),
  new ListDiagnoses(diagnosisRepository),
  new RemoveDiagnosis(diagnosisRepository),
  new DiagnosisById(diagnosisRepository),
);

const reportRepository = new PrismaReportRepository(prisma);
const reportController = new ReportController(
  new GetReportInitialData(studentRepository),
  new CreateReport(reportRepository, attendanceRepository),
  new UpdateReport(reportRepository),
  new RemoveReport(reportRepository, hashService),
  new ListReportsByStudent(reportRepository),
  new GetReportById(reportRepository),
);

const appointmentRepository = new PrismaAppointmentRepository(prisma);

const appointmentGuestRepository = new PrismaAppointmentGuestRepository(prisma);

const verifyMissedExpiredUseCase = new VerifyMissedExpiredStatus(appointmentRepository, appointmentGuestRepository);

const listAppointmentsUseCase = new ListAppointmentsByPedagogue(
  appointmentRepository,
  appointmentGuestRepository,
  verifyMissedExpiredUseCase,
);

const appointmentResolverUseCase = new AppointmentResolver(
  appointmentRepository,
  appointmentGuestRepository,
  verifyMissedExpiredUseCase,
);

const appointmentByIdUseCase = new AppointmentById(appointmentResolverUseCase);

const confirmAppointmentUseCase = new ConfirmAppointment(
  appointmentResolverUseCase,
  appointmentRepository,
  appointmentGuestRepository,
  pedagogueRepository,
  emailService,
);

const cancelAppointmentUseCase = new CancelAppointment(
  appointmentResolverUseCase,
  releaseAvailabilityUseCase,
  appointmentRepository,
  appointmentGuestRepository,
  availabilityRepository,
  pedagogueRepository,
  emailService,
);

const validateAvailabilityUseCase = new ValidateAvailability(availabilityRepository, pedagogueRepository);

const rescheduleAppointment = new RescheduleAppointment(
  appointmentResolverUseCase,
  validateAvailabilityUseCase,
  appointmentRepository,
  appointmentGuestRepository,
  availabilityRepository,
  pedagogueRepository,
  emailService,
  releaseAvailabilityUseCase,
);

const rescheduleAppointmentPedagogueUseCase = new RescheduleAppointmentPedagogue(rescheduleAppointment);

const rescheduleAppointmentStudentUseCase = new RescheduleAppointmentStudent(rescheduleAppointment);

const getAppointmentByTokenUseCase = new GetAppointmentByToken(
  appointmentResolverUseCase,
  pedagogueRepository,
  courseRepository,
);

const requestAppointmentUseCase = new RequestAppointment(
  appointmentRepository,
  appointmentGuestRepository,
  availabilityRepository,
  pedagogueRepository,
  studentRepository,
  courseRepository,
  emailService,
  validateAvailabilityUseCase,
);

const cancelAppointmentPedagogueUseCase = new CancelAppointmentPedagogue(cancelAppointmentUseCase);

const cancelAppointmentStudentUseCase = new CancelAppointmentStudent(cancelAppointmentUseCase);

const appointmentController = new AppointmentController(
  appointmentByIdUseCase,
  cancelAppointmentPedagogueUseCase,
  cancelAppointmentStudentUseCase,
  confirmAppointmentUseCase,
  requestAppointmentUseCase,
  listAppointmentsUseCase,
  rescheduleAppointmentPedagogueUseCase,
  rescheduleAppointmentStudentUseCase,
  getAppointmentByTokenUseCase,
);

const previewAvailabilityUseCase = new PreviewAvailability(availabilityRepository, getWeekdayFromDateUseCase);
const listAvailabilitiesByPedagogueUseCase = new ListAvailabilitiesByPedagogue(availabilityRepository);
const removeAvailabilityUseCase = new RemoveAvailability(availabilityRepository);
const removeManyAvailabilitiesUseCase = new RemoveManyAvailabilities(availabilityRepository);

const availabililtyController = new AvailabilityController(
  previewAvailabilityUseCase,
  createAvailabilityUseCase,
  listAvailabilitiesByPedagogueUseCase,
  removeAvailabilityUseCase,
  removeManyAvailabilitiesUseCase,
);

app.use(cookieParser());
app.use(csrfProtection);

app.use(express.json());

app.set("trust proxy", 1);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);

app.use(attendanceTypeRoutes(attendanceTypeController, tokenService));

app.use(accountRequestRoutes(accountRequestController, tokenService));

app.use(userRoutes(userController, tokenService));

app.use(authRoutes(authController, tokenService));

app.use(attendanceRoutes(attendanceController, tokenService));

app.use(diagnosesRoutes(diagnosesController, tokenService));

app.use(reportRoutes(reportController, tokenService));

app.use(appointmentRoutes(appointmentController, tokenService));

app.use(studentRoutes(studentController, tokenService));

app.use(courseRoutes(courseController, tokenService));

app.use(availabilityRoutes(availabililtyController, tokenService));

app.use(errorHandler);

const PORT = env.BACKEND_PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
