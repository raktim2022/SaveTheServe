// Global test teardown
export default async () => {
  // Close any open handles
  if (global.prisma) {
    await global.prisma.$disconnect();
  }
};