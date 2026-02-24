import express from 'express';
import {
  timeIn,
  timeOut,
  getDailyLog,
  getMonthlyAttendance,
  getYearlyStats
} from '../controllers/timeLogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/time-in', protect, timeIn);
router.post('/time-out', protect, timeOut);
router.get('/daily', protect, getDailyLog);
router.get('/monthly', protect, getMonthlyAttendance);
router.get('/yearly', protect, getYearlyStats);

export default router;
