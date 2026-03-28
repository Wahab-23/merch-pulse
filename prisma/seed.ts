import { PrismaClient } from '../app/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Ensure "Admin" role exists
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
    },
  });

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash('Admin123', 10);

  // 3. Upsert the Admin user
  const adminEmail = 'admin@example.com';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin',
      password: hashedPassword,
      roleId: adminRole.id,
    },
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('Seed successful! Admin user details:');
  console.log({
    email: adminUser.email,
    name: adminUser.name,
    role: adminRole.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
