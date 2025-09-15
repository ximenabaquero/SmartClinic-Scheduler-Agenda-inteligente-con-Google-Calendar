import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any>;
    getMe(req: any): Promise<any>;
    findById(id: string): Promise<any>;
}
