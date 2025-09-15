import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a sample doctor
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@smartclinic.com' },
    update: {},
    create: {
      email: 'doctor@smartclinic.com',
      password: hashedPassword,
      firstName: 'Dr. John',
      lastName: 'Smith',
      role: 'DOCTOR',
    },
  });

  // Create sample services
  const consultation = await prisma.service.upsert({
    where: { id: 'consultation-1' },
    update: {},
    create: {
      id: 'consultation-1',
      name: 'General Consultation',
      description: 'General medical consultation',
      duration: 30,
      buffer: 15,
      color: '#3174ad',
      doctorId: doctor.id,
    },
  });

  const checkup = await prisma.service.upsert({
    where: { id: 'checkup-1' },
    update: {},
    create: {
      id: 'checkup-1',
      name: 'Annual Checkup',
      description: 'Comprehensive annual health checkup',
      duration: 60,
      buffer: 15,
      color: '#10b981',
      doctorId: doctor.id,
    },
  });

  // Create sample availability (Monday to Friday, 9 AM to 5 PM)
  const availability = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
  ];

  for (const avail of availability) {
    await prisma.availability.upsert({
      where: {
        doctorId_dayOfWeek: {
          doctorId: doctor.id,
          dayOfWeek: avail.dayOfWeek,
        },
      },
      update: {},
      create: {
        doctorId: doctor.id,
        ...avail,
      },
    });
  }

  // Create a sample patient
  const patient = await prisma.patient.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1-555-0123',
    },
  });

  console.log('Seed data created successfully!');
  console.log('Doctor:', doctor);
  console.log('Services:', [consultation, checkup]);
  console.log('Patient:', patient);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });