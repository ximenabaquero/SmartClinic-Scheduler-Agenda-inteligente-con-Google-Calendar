import { PrismaService } from '../common/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findById(id: string): Promise<any>;
    updateGoogleCalendarId(userId: string, googleCalendarId: string): Promise<any>;
}
