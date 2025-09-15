import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../common/dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<any>;
}
