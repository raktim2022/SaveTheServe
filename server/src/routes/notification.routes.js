import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notification.service.js';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await getNotifications(req.user.id, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/unread/count', async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsRead(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(req.params.id, req.user.id);
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteNotification(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
