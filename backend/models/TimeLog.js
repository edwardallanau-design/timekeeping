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

    const diffInMilliseconds = this.timeOut - this.timeIn;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    this.hoursWorked = Math.round(diffInHours * 100) / 100;

    if (this.hoursWorked <= 4) {
        this.status = 'absent';
    } else if (this.hoursWorked < 8) {
        this.status = 'half-day';
    } else {
        this.status = 'present';
    }

    return this;
};

export default mongoose.model('TimeLog', TimeLogSchema);
