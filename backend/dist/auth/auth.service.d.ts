import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { LoginDto, RegisterDto } from '../common/dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: any;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
        token: string;
    }>;
    private generateToken;
    validateUser(userId: string): Promise<any>;
}
