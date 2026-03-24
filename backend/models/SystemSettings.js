const mongoose = require('mongoose');

const systemSettingsSchema = mongoose.Schema({
    brandingName: { type: String, default: 'CoachingPro Elite' },
    academicCycle: { type: String, default: 'March 2026' },
    supportPhone: { type: String, default: '+91 91234 56780' },
    timezone: { type: String, default: 'Asia/Kolkata (GMT +5:30)' },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
