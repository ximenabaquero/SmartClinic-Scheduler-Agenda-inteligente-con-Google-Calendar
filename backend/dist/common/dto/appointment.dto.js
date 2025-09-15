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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmAppointmentDto = exports.CreateAppointmentDto = void 0;
const class_validator_1 = require("class-validator");
class CreateAppointmentDto {
}
exports.CreateAppointmentDto = CreateAppointmentDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "patientEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "patientFirstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "patientLastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "patientPhone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "serviceId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateAppointmentDto.prototype, "preferredTimeRanges", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "notes", void 0);
class ConfirmAppointmentDto {
}
exports.ConfirmAppointmentDto = ConfirmAppointmentDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ConfirmAppointmentDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmAppointmentDto.prototype, "notes", void 0);
//# sourceMappingURL=appointment.dto.js.map