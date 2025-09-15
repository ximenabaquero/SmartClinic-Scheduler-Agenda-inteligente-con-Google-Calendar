"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const calendar_service_1 = require("./calendar.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let CalendarController = class CalendarController {
    constructor(calendarService) {
        this.calendarService = calendarService;
    }
    getAuthUrl() {
        return {
            authUrl: this.calendarService.getAuthUrl(),
        };
    }
    async connectCalendar(req, code) {
        return this.calendarService.handleCallback(code, req.user.sub);
    }
    async syncCalendar(req) {
        return this.calendarService.syncCalendar(req.user.sub);
    }
    async getFreeBusy(req, timeMin, timeMax) {
        return this.calendarService.getFreeBusy(req.user.sub, timeMin, timeMax);
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)('auth-url'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Post)('connect'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "connectCalendar", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "syncCalendar", null);
__decorate([
    (0, common_1.Get)('free-busy'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('timeMin')),
    __param(2, (0, common_1.Query)('timeMax')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getFreeBusy", null);
exports.CalendarController = CalendarController = __decorate([
    (0, common_1.Controller)('calendar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map