import TimeLog from '../models/TimeLog.js';

export const timeIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already timed in today
    const existingLog = await TimeLog.findOne({
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingLog && existingLog.timeIn) {
      return res.status(400).json({ message: 'Already timed in today' });
    }

    const timeLog = await TimeLog.create({
      userId,
      date: new Date(),
      timeIn: new Date(),
      status: 'present'
    });

    res.status(201).json({
      success: true,
      message: 'Time in recorded',
      timeLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const timeOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeLog = await TimeLog.findOne({
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!timeLog) {
      return res.status(404).json({ message: 'No time in record found for today' });
    }

    if (timeLog.timeOut) {
      return res.status(400).json({ message: 'Already timed out today' });
    }

    timeLog.timeOut = new Date();
    timeLog.calculateHours();
    await timeLog.save();

    res.status(200).json({
      success: true,
      message: 'Time out recorded',
      timeLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const startDate = new Date(date || new Date());
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const timeLog = await TimeLog.findOne({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    res.status(200).json({
      success: true,
      timeLog: timeLog || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const logs = await TimeLog.find({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getYearlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const logs = await TimeLog.find({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const totalHours = logs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);
    const presentDays = logs.filter(log => log.status === 'present').length;
    const absentDays = logs.filter(log => log.status === 'absent').length;

    res.status(200).json({
      success: true,
      stats: {
        totalHours,
        presentDays,
        absentDays,
        workingDays: logs.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
