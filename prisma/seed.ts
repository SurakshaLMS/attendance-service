import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample institutes
  const institute1 = await prisma.institute.upsert({
    where: { externalId: 'inst_001' },
    update: {},
    create: {
      externalId: 'inst_001',
      name: 'Sample University',
      code: 'SU',
      description: 'A sample university for testing',
      isActive: true,
    },
  });

  const institute2 = await prisma.institute.upsert({
    where: { externalId: 'inst_002' },
    update: {},
    create: {
      externalId: 'inst_002',
      name: 'Tech Institute',
      code: 'TI',
      description: 'Technology focused institute',
      isActive: true,
    },
  });

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { externalId: 'user_001' },
    update: {},
    create: {
      externalId: 'user_001',
      email: 'john.doe@example.com',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { externalId: 'user_002' },
    update: {},
    create: {
      externalId: 'user_002',
      email: 'jane.smith@example.com',
      username: 'janesmith',
      firstName: 'Jane',
      lastName: 'Smith',
      isActive: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { externalId: 'user_003' },
    update: {},
    create: {
      externalId: 'user_003',
      email: 'bob.wilson@example.com',
      username: 'bobwilson',
      firstName: 'Bob',
      lastName: 'Wilson',
      isActive: true,
    },
  });

  // Create sample institute organization
  const instituteOrg = await prisma.instituteOrganization.create({
    data: {
      instituteId: institute1.id,
      name: 'Computer Science Club',
      description: 'A club for computer science students',
      enrollmentKey: 'cs-club-2024',
      requiresVerification: false,
    },
  });

  // Create sample global organization
  const globalOrg = await prisma.globalOrganization.create({
    data: {
      name: 'Global Tech Community',
      description: 'A global community for tech enthusiasts',
      enrollmentKey: 'global-tech-2024',
      requiresVerification: true,
    },
  });

  // Hash password for organization users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create institute organization users
  await prisma.instituteOrganizationUser.create({
    data: {
      userId: user1.id,
      organizationId: instituteOrg.id,
      role: 'PRESIDENT',
      hashedPassword,
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.instituteOrganizationUser.create({
    data: {
      userId: user2.id,
      organizationId: instituteOrg.id,
      role: 'VICE_PRESIDENT',
      hashedPassword,
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.instituteOrganizationUser.create({
    data: {
      userId: user3.id,
      organizationId: instituteOrg.id,
      role: 'MEMBER',
      hashedPassword,
      verificationStatus: 'PENDING',
    },
  });

  // Create global organization users
  await prisma.globalOrganizationUser.create({
    data: {
      userId: user1.id,
      organizationId: globalOrg.id,
      role: 'ADMIN',
      hashedPassword,
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.globalOrganizationUser.create({
    data: {
      userId: user2.id,
      organizationId: globalOrg.id,
      role: 'MEMBER',
      hashedPassword,
      verificationStatus: 'PENDING',
    },
  });

  // Create sample lectures
  await prisma.lecture.create({
    data: {
      title: 'Introduction to TypeScript',
      description: 'Learn the basics of TypeScript programming',
      content: 'This is a comprehensive introduction to TypeScript...',
      visibility: 'PUBLIC',
      level: 'GLOBAL',
    },
  });

  await prisma.lecture.create({
    data: {
      title: 'Advanced JavaScript Patterns',
      description: 'Deep dive into JavaScript design patterns',
      content: 'In this lecture, we will explore advanced patterns...',
      visibility: 'PRIVATE',
      level: 'INSTITUTE_ORGANIZATION',
      instituteOrganizationId: instituteOrg.id,
    },
  });

  await prisma.lecture.create({
    data: {
      title: 'Global Tech Trends 2024',
      description: 'Overview of technology trends in 2024',
      content: 'The technology landscape is constantly evolving...',
      visibility: 'PRIVATE',
      level: 'GLOBAL',
      globalOrganizationId: globalOrg.id,
    },
  });

  // Create sample causes
  const cause1 = await prisma.cause.create({
    data: {
      title: 'Climate Action Initiative',
      description: 'Join us in fighting climate change through technology',
      content: 'This cause focuses on developing sustainable technology solutions to combat climate change. We organize workshops, hackathons, and research projects.',
      coverImage: 'https://example.com/climate-action-cover.jpg',
      visibility: 'PUBLIC',
      requiresVerification: false,
      enrollmentKey: 'climate-2024',
      instituteOrganizationId: instituteOrg.id,
    },
  });

  const cause2 = await prisma.cause.create({
    data: {
      title: 'AI for Social Good',
      description: 'Using artificial intelligence to solve social problems',
      content: 'This private cause brings together AI researchers and practitioners to work on projects that benefit society.',
      coverImage: 'https://example.com/ai-social-cover.jpg',
      visibility: 'PRIVATE',
      requiresVerification: true,
      enrollmentKey: 'ai-social-2024',
      globalOrganizationId: globalOrg.id,
    },
  });

  // Create sample cause lectures
  const causeLecture1 = await prisma.causeLecture.create({
    data: {
      causeId: cause1.id,
      title: 'Introduction to Sustainable Computing',
      description: 'Learn about green computing practices',
      content: 'In this lecture, we will explore how to make computing more environmentally friendly...',
      type: 'RECORDED',
      status: 'COMPLETED',
      recordingUrl: 'https://example.com/sustainable-computing-recording.mp4',
      recordingAvailableAfter: new Date('2024-01-01'),
      visibility: 'PUBLIC',
      requiresEnrollment: false,
    },
  });

  const causeLecture2 = await prisma.causeLecture.create({
    data: {
      causeId: cause2.id,
      title: 'AI Ethics Workshop',
      description: 'Live workshop on ethical AI development',
      content: 'A hands-on workshop covering the ethical implications of AI development...',
      type: 'LIVE',
      status: 'SCHEDULED',
      liveStreamUrl: 'https://example.com/live-stream/ai-ethics',
      scheduledAt: new Date('2025-02-01T14:00:00Z'),
      visibility: 'PRIVATE',
      requiresEnrollment: true,
    },
  });

  // Create sample lecture documents
  await prisma.lectureDocument.create({
    data: {
      causeLectureId: causeLecture1.id,
      title: 'Sustainable Computing Guidelines',
      description: 'Comprehensive guide to sustainable computing practices',
      documentUrl: 'https://example.com/documents/sustainable-computing-guide.pdf',
      documentType: 'PDF',
      fileSize: 2048000, // 2MB
      uploadedBy: user1.id,
    },
  });

  await prisma.lectureDocument.create({
    data: {
      causeLectureId: causeLecture2.id,
      title: 'AI Ethics Presentation',
      description: 'Slides for the AI ethics workshop',
      documentUrl: 'https://example.com/documents/ai-ethics-presentation.pptx',
      documentType: 'PPTX',
      fileSize: 5120000, // 5MB
      uploadedBy: user2.id,
    },
  });

  // Create sample cause enrollments
  await prisma.causeEnrollment.create({
    data: {
      userId: user1.id,
      causeId: cause1.id,
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  await prisma.causeEnrollment.create({
    data: {
      userId: user2.id,
      causeId: cause2.id,
      verificationStatus: 'PENDING',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Summary:');
  console.log('- Created 3 users');
  console.log('- Created 1 institute organization');
  console.log('- Created 1 global organization');
  console.log('- Created 2 causes with lectures and documents');
  console.log('- Created cause enrollments for notification system');
  console.log('');
  console.log('🔐 Test credentials:');
  console.log('- Users: john.doe@example.com, jane.smith@example.com, bob.wilson@example.com');
  console.log('- Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
