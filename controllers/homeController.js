const Client = require('../models/Client');
const Todos = require('../models/Todos');

exports.getHomeStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        const stats = await Client.aggregate([
            {
                $match: {
                    category: { $in: ["wishlist", "followup", "snoozed", "active", "freezed", "rejected"] },
                    crtdOn: { $gte: startOfMonth, $lte: today },
                    dltSts: 0
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // default response (ensures 0 count)
        const result = {
            wishlist: 0,
            followup: 0,
            snoozed: 0,
            active: 0,
            freezed: 0,
            rejected: 0
        };

        stats.forEach(item => {
            result[item._id] = item.count;
        });

        return res.json({
            month: today.getMonth() + 1,
            from: startOfMonth,
            to: today,
            counts: result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

exports.getUniqueVisitorsStats = async (req, res) => {
    try {
        const year = new Date().getFullYear();

        const data = await Client.aggregate([
            {
                $match: {
                    dltSts: 0,
                    src: { $exists: true, $ne: null, $ne: "" },
                    crtdOn: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$crtdOn" },
                    type: {
                        $cond: [
                            { $in: ["$src", ["newspaper", "referral", "direct"]] },
                            "direct",
                            "organic"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: { month: "$month", type: "$type" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Initialize Jan–Dec with 0
        const direct = Array(12).fill(0);
        const organic = Array(12).fill(0);

        data.forEach(item => {
            const index = item._id.month - 1;
            if (item._id.type === "direct") {
                direct[index] = item.count;
            } else {
                organic[index] = item.count;
            }
        });

        res.json({
            year,
            direct,
            organic
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch unique visitors stats" });
    }
};

exports.getActivityLog = async (req, res) => {
    try {
        const todos = await Todos.find({})
            .sort({ createdOn: -1 })   // latest first
            .limit(8)                  // last 8
            .select('task task_done priority start_date createdOn');

        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch activity log' });
    }
};