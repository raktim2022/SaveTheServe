import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@savetheserve.com';
  const password = 'password123';
  
  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('⚠️ A user already exists with this email:', email);
      
      // If it exists but isn't an admin, let's just make them an admin
      if (existingUser.role !== 'ADMIN') {
         await prisma.user.update({
             where: { email },
             data: { role: 'ADMIN', isVerified: true }
         });
         
         const existingAdminRecord = await prisma.admin.findUnique({ where: { userId: existingUser.id }});
         if (!existingAdminRecord) {
             await prisma.admin.create({ data: { userId: existingUser.id }});
         }
         console.log('✅ Updated existing user to ADMIN role.');
      } else {
         console.log('✅ User is already an ADMIN.');
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        isVerified: true,
      },
    });

    await prisma.admin.create({
      data: {
        userId: adminUser.id,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
