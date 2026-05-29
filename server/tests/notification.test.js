/**
 * Notification Service Tests
 * Tests CRUD operations, bulk send, and read-state management
 */
import {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendBulkNotification,
} from '../src/services/notification.service.js';

describe('Notification Service', () => {
  let testUserId;
  let testUserId2;

  beforeAll(() => {
    // Use pre-created test users from global setup
    testUserId = global.testNgoUser.id;
    testUserId2 = global.testRestaurantUser.id;
  });

  // ── createNotification ───────────────────────────────────────────────────
  describe('createNotification()', () => {
    test('should create an in-app notification and return it', async () => {
      const notif = await createNotification(
        testUserId,
        'food:new',
        'Test Title',
        'Test body text',
        { listingId: 999 },
        'IN_APP'
      );

      expect(notif).toBeDefined();
      expect(notif.id).toBeDefined();
      expect(notif.userId).toBe(testUserId);
      expect(notif.type).toBe('food:new');
      expect(notif.title).toBe('Test Title');
      expect(notif.isRead).toBe(false);
    });

    test('should default channel to IN_APP', async () => {
      const notif = await createNotification(
        testUserId,
        'notification',
        'Default Channel',
        'Body'
      );
      expect(notif.channel).toBe('IN_APP');
    });
  });

  // ── getNotifications ─────────────────────────────────────────────────────
  describe('getNotifications()', () => {
    beforeEach(async () => {
      // Create a few notifications
      await createNotification(testUserId, 'food:new', 'N1', 'B1');
      await createNotification(testUserId, 'request:new', 'N2', 'B2');
    });

    test('should return paginated notifications for the user', async () => {
      const result = await getNotifications(testUserId, 1, 10);
      expect(result.notifications.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
    });

    test('should respect the limit parameter', async () => {
      const result = await getNotifications(testUserId, 1, 1);
      expect(result.notifications.length).toBeLessThanOrEqual(1);
    });

    test('should not return other users\' notifications', async () => {
      const result = await getNotifications(testUserId2, 1, 10);
      result.notifications.forEach((n) => {
        expect(n.userId).toBe(testUserId2);
      });
    });
  });

  // ── getUnreadNotifications / getUnreadCount ───────────────────────────────
  describe('getUnreadNotifications() and getUnreadCount()', () => {
    test('should return only unread notifications', async () => {
      await createNotification(testUserId, 'food:new', 'Unread', 'Body');
      const unread = await getUnreadNotifications(testUserId);
      unread.forEach((n) => expect(n.isRead).toBe(false));
      expect(unread.length).toBeGreaterThan(0);
    });

    test('getUnreadCount() should match the unread list length', async () => {
      const unread = await getUnreadNotifications(testUserId);
      const count = await getUnreadCount(testUserId);
      expect(count).toBe(unread.length);
    });
  });

  // ── markNotificationAsRead ────────────────────────────────────────────────
  describe('markNotificationAsRead()', () => {
    test('should mark a specific notification as read', async () => {
      const notif = await createNotification(testUserId, 'food:new', 'Mark Me', 'Body');
      const updated = await markNotificationAsRead(notif.id, testUserId);
      expect(updated.isRead).toBe(true);
    });

    test('should throw when notification belongs to another user', async () => {
      const notif = await createNotification(testUserId, 'food:new', 'Other', 'Body');
      await expect(
        markNotificationAsRead(notif.id, testUserId2)
      ).rejects.toThrow('Unauthorized');
    });
  });

  // ── markAllNotificationsAsRead ────────────────────────────────────────────
  describe('markAllNotificationsAsRead()', () => {
    test('should mark all unread notifications as read', async () => {
      await createNotification(testUserId, 'food:new', 'A', 'Body');
      await createNotification(testUserId, 'request:new', 'B', 'Body');
      const result = await markAllNotificationsAsRead(testUserId);
      expect(result.count).toBeGreaterThan(0);
      const unread = await getUnreadNotifications(testUserId);
      expect(unread.length).toBe(0);
    });
  });

  // ── sendBulkNotification ──────────────────────────────────────────────────
  describe('sendBulkNotification()', () => {
    test('should send to all specified user IDs', async () => {
      const notifications = await sendBulkNotification(
        [testUserId, testUserId2],
        'notification',
        'Bulk Title',
        'Bulk Body'
      );
      expect(notifications).toHaveLength(2);
      const userIds = notifications.map((n) => n.userId);
      expect(userIds).toContain(testUserId);
      expect(userIds).toContain(testUserId2);
    });
  });

  // ── deleteNotification ────────────────────────────────────────────────────
  describe('deleteNotification()', () => {
    test('should delete the notification from the database', async () => {
      const notif = await createNotification(testUserId, 'food:new', 'Delete Me', 'Body');
      await deleteNotification(notif.id, testUserId);
      const prisma = global.getPrismaClient();
      const found = await prisma.notification.findUnique({ where: { id: notif.id } });
      expect(found).toBeNull();
    });

    test('should throw when trying to delete another user\'s notification', async () => {
      const notif = await createNotification(testUserId, 'food:new', 'Protected', 'Body');
      await expect(
        deleteNotification(notif.id, testUserId2)
      ).rejects.toThrow('Unauthorized');
    });
  });
});
