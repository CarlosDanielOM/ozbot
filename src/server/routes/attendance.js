const express = require('express');
const router = express.Router();
const Attendance = require('../../../models/attendance');

// Get weekly attendance statistics for a user
router.get('/weekly/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)

        // Get records for the current week
        const records = await Attendance.find({
            login: username,
            'date.year': today.getFullYear(),
            'date.month': today.getMonth() + 1,
            'date.day': { $gte: startOfWeek.getDate() - 7, $lte: today.getDate() }
        }).sort({ 'date.day': 1 });

        // Calculate statistics
        const weeklyStats = {
            total_possible: 0,
            total_attended: 0,
            daily_stats: {}
        };

        // Initialize daily stats for the week
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            weeklyStats.daily_stats[dayKey] = {
                attended: 0,
                possible: 0,
                percentage: 0
            };
        }

        // Fill in the actual data
        records.forEach(record => {
            const date = new Date(record.date.year, record.date.month - 1, record.date.day);
            const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            weeklyStats.daily_stats[dayKey] = {
                attended: record.present,
                possible: record.total,
                percentage: (record.present / record.total) * 100
            };
            weeklyStats.total_possible += record.total;
            weeklyStats.total_attended += record.present;
        });

        // Calculate overall percentage
        weeklyStats.overall_percentage = weeklyStats.total_possible > 0 
            ? (weeklyStats.total_attended / weeklyStats.total_possible) * 100 
            : 0;

        res.json(weeklyStats);
    } catch (error) {
        console.error('Error fetching weekly attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 