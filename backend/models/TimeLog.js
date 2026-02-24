import mongoose from 'mongoose';

const TimeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  timeIn: {
    type: Date,
    required: true
  },
  timeOut: {
    type: Date,
    default: null
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day'],
    default: 'present'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate hours worked
TimeLogSchema.methods.calculateHours = function() {
  if (this.timeOut) {
    const diffInMilliseconds = this.timeOut - this.timeIn;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    this.hoursWorked = Math.round(diffInHours * 100) / 100;
  }
  return this.hoursWorked;
};

export default mongoose.model('TimeLog', TimeLogSchema);
