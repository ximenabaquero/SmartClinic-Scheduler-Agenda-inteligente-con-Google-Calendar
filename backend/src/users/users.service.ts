import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        googleCalendarId: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        googleCalendarId: true,
        services: true,
        availability: true,
      },
    });
  }

  async updateGoogleCalendarId(userId: string, googleCalendarId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleCalendarId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        googleCalendarId: true,
      },
    });
  }
}