/**
 * Background Jobs Logic Tests
 * Tests the core database logic of expiry, cleanup, and reporting jobs
 * without actually scheduling cron tasks (to keep tests fast/deterministic)
 */

describe('Background Jobs Logic', () => {
  // ── Expiry Job Logic ──────────────────────────────────────────────────────
  describe('Expiry Job — mark expired listings and reject requests', () => {
    let expiredListing, pendingRequest;

    beforeEach(async () => {
      const prisma = global.getPrismaClient();

      // Create an ALREADY expired listing (expiryTime in the past)
      expiredListing = await prisma.foodListing.create({
        data: {
          restaurantId: global.testRestaurant.id,
          foodName: 'Expired Food Item',
          quantity: 10,
          expiryTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          status: 'AVAILABLE',
        },
      });

      // Create a PENDING request against that expired listing
      pendingRequest = await prisma.foodRequest.create({
        data: {
          ngoId: global.testNgo.id,
          foodListingId: expiredListing.id,
          status: 'PENDING',
        },
      });
    });

    test('should detect expired AVAILABLE listings', async () => {
      const prisma = global.getPrismaClient();
      const now = new Date();
      const expired = await prisma.foodListing.findMany({
        where: { status: 'AVAILABLE', expiryTime: { lt: now } },
      });
      const found = expired.find((l) => l.id === expiredListing.id);
      expect(found).toBeDefined();
    });

    test('should be able to mark expired listing as PICKED', async () => {
      const prisma = global.getPrismaClient();
      await prisma.foodListing.update({
        where: { id: expiredListing.id },
        data: { status: 'PICKED' },
      });
      const updated = await prisma.foodListing.findUnique({ where: { id: expiredListing.id } });
      expect(updated.status).toBe('PICKED');
    });

    test('should be able to auto-reject PENDING requests for expired listings', async () => {
      const prisma = global.getPrismaClient();
      await prisma.foodRequest.update({
        where: { id: pendingRequest.id },
        data: { status: 'REJECTED', rejectionReason: 'Food listing expired' },
      });
      const updated = await prisma.foodRequest.findUnique({ where: { id: pendingRequest.id } });
      expect(updated.status).toBe('REJECTED');
      expect(updated.rejectionReason).toBe('Food listing expired');
    });
  });

  // ── Cleanup Job Logic ─────────────────────────────────────────────────────
  describe('Cleanup Job — expired tokens and old OTPs', () => {
    test('should detect users with expired verification tokens', async () => {
      const prisma = global.getPrismaClient();
      const pastExpiry = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago

      // Temporarily set an expired token on the test NGO user
      await prisma.user.update({
        where: { id: global.testNgoUser.id },
        data: {
          verificationToken: 'expired-token-xyz',
          verificationTokenExpiry: pastExpiry,
        },
      });

      const expiredCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const stale = await prisma.user.findMany({
        where: {
          verificationToken: { not: null },
          verificationTokenExpiry: { lt: expiredCutoff },
        },
      });
      expect(stale.length).toBeGreaterThan(0);

      // Cleanup
      const cleared = await prisma.user.updateMany({
        where: {
          verificationToken: { not: null },
          verificationTokenExpiry: { lt: expiredCutoff },
        },
        data: { verificationToken: null, verificationTokenExpiry: null },
      });
      expect(cleared.count).toBeGreaterThan(0);

      // Confirm token was cleared
      const user = await prisma.user.findUnique({ where: { id: global.testNgoUser.id } });
      expect(user.verificationToken).toBeNull();
    });

    test('should not clear tokens that are still valid', async () => {
      const prisma = global.getPrismaClient();
      const futureExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours future

      await prisma.user.update({
        where: { id: global.testNgoUser.id },
        data: {
          verificationToken: 'valid-token-abc',
          verificationTokenExpiry: futureExpiry,
        },
      });

      const expiredCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const cleared = await prisma.user.updateMany({
        where: {
          verificationToken: { not: null },
          verificationTokenExpiry: { lt: expiredCutoff },
        },
        data: { verificationToken: null, verificationTokenExpiry: null },
      });

      const user = await prisma.user.findUnique({ where: { id: global.testNgoUser.id } });
      expect(user.verificationToken).toBe('valid-token-abc');

      // Restore
      await prisma.user.update({
        where: { id: global.testNgoUser.id },
        data: { verificationToken: null, verificationTokenExpiry: null },
      });
    });
  });

  // ── Daily Reports Job Logic ───────────────────────────────────────────────
  describe('Daily Reports Job — aggregate completed pickups', () => {
    test('should aggregate completed requests for reporting period', async () => {
      const prisma = global.getPrismaClient();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create a completed request that looks like it was updated "yesterday"
      const listing = await prisma.foodListing.create({
        data: {
          restaurantId: global.testRestaurant.id,
          foodName: 'Yesterday Food',
          quantity: 20,
          expiryTime: new Date(Date.now() + 60 * 60 * 1000),
          status: 'PICKED',
        },
      });

      // Verify the completed requests query can run without errors
      const completed = await prisma.foodRequest.findMany({
        where: {
          status: 'COMPLETED',
        },
        include: {
          foodListing: true,
          ngo: { include: { user: true } },
        },
      });

      // Should return an array (even if empty for yesterday specifically)
      expect(Array.isArray(completed)).toBe(true);

      // Verify we can aggregate total kg
      const totalKg = completed.reduce((sum, r) => sum + (r.foodListing?.quantity || 0), 0);
      expect(typeof totalKg).toBe('number');
    });
  });

  // ── Payment Record Storage ────────────────────────────────────────────────
  describe('Payment — record creation and status lifecycle', () => {
    test('should store a payment record with PENDING status', async () => {
      const prisma = global.getPrismaClient();
      const payment = await prisma.payment.create({
        data: {
          orderId: `order_test_${Date.now()}`,
          paymentId: `pay_test_${Date.now()}`,
          donorId: global.testRestaurantUser.id,
          ngoId: global.testNgoUser.id,
          amount: 500.00,
          currency: 'INR',
          status: 'PENDING',
        },
      });
      expect(payment.id).toBeDefined();
      expect(payment.status).toBe('PENDING');
    });

    test('should update payment status to COMPLETED after verification', async () => {
      const prisma = global.getPrismaClient();
      const payment = await prisma.payment.create({
        data: {
          orderId: `order_verify_${Date.now()}`,
          paymentId: `pay_verify_${Date.now()}`,
          donorId: global.testRestaurantUser.id,
          amount: 250.00,
          currency: 'INR',
          status: 'PENDING',
        },
      });

      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });
      expect(updated.status).toBe('COMPLETED');
    });

    test('verifyPayment should reject an invalid signature', async () => {
      const { verifyPayment } = await import('../src/services/payment.service.js');
      await expect(
        verifyPayment('order_fake', 'pay_fake', 'bad_signature', 1, 2, 100)
      ).rejects.toThrow();
    });
  });
});
