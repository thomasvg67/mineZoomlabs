const BudgetHYearly = require('../models/BudgetHYearly');

exports.getAllBudgetHYearlys = async (req, res) => {
    try {
        const budgetHYearlys = await BudgetHYearly.find({ dltSts: false }).sort({ crtdOn: -1 }).lean();
        budgetHYearlys.forEach(m => {
            m.visions = (m.visions || []).filter(v => !v.dltSts);
        });
        res.json(budgetHYearlys);
    } catch {
        res.status(500).json({ message: 'Failed to fetch budgetHYearlys' });
    }
};

exports.addBudgetHYearly = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetHYearly = new BudgetHYearly({
            name: req.body.name,
            crtdBy: userId,
            crtdIp: ip
        });

        await budgetHYearly.save();
        res.json({ message: 'BudgetHYearly added', budgetHYearly });
    } catch {
        res.status(500).json({ message: 'Failed to add budgetHYearly' });
    }
};

exports.editBudgetHYearly = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await BudgetHYearly.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                updtBy: userId,
                updtIp: ip,
                updtOn: new Date()
            }
        }, { new: true });

        if (!updated) return res.status(404).json({ message: 'BudgetHYearly not found' });
        res.json({ message: 'BudgetHYearly updated', budgetHYearly: updated });
    } catch {
        res.status(500).json({ message: 'Failed to update budgetHYearly' });
    }
};

exports.deleteBudgetHYearly = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await BudgetHYearly.findByIdAndUpdate(req.params.id, {
            $set: {
                dltSts: true,
                dltBy: userId,
                dltIp: ip,
                dltOn: new Date()
            }
        }, { new: true });

        if (!deleted) return res.status(404).json({ message: 'BudgetHYearly not found' });
        res.json({ message: 'BudgetHYearly deleted', budgetHYearly: deleted });
    } catch {
        res.status(500).json({ message: 'Failed to delete budgetHYearly' });
    }
};

exports.addVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetHYearly = await BudgetHYearly.findById(req.params.id);
        if (!budgetHYearly) return res.status(404).json({ message: 'BudgetHYearly not found' });

        budgetHYearly.visions.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await budgetHYearly.save();
        res.json({ message: 'Vision added', budgetHYearly });
    } catch {
        res.status(500).json({ message: 'Failed to add vision' });
    }
};

exports.editVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetHYearly = await BudgetHYearly.findById(req.params.id);
        if (!budgetHYearly) return res.status(404).json({ message: 'BudgetHYearly not found' });

        const vision = budgetHYearly.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.title = req.body.title;
        vision.description = req.body.description;
        vision.updtBy = userId;
        vision.updtIp = ip;
        vision.updtOn = new Date();

        await budgetHYearly.save();
        res.json({ message: 'Vision updated', budgetHYearly });
    } catch {
        res.status(500).json({ message: 'Failed to update vision' });
    }
};

exports.deleteVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetHYearly = await BudgetHYearly.findById(req.params.id);
        if (!budgetHYearly) return res.status(404).json({ message: 'BudgetHYearly not found' });

        const vision = budgetHYearly.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.dltSts = true;
        vision.dltBy = userId;
        vision.dltIp = ip;
        vision.dltOn = new Date();

        await budgetHYearly.save();
        res.json({ message: 'Vision deleted', budgetHYearly });
    } catch {
        res.status(500).json({ message: 'Failed to delete vision' });
    }
};

exports.clearVisions = async (req, res) => {
    try {
        const budgetHYearly = await BudgetHYearly.findById(req.params.id);
        if (!budgetHYearly) return res.status(404).json({ message: 'BudgetHYearly not found' });

        budgetHYearly.visions = [];
        await budgetHYearly.save();

        res.json({ message: 'All visions cleared', budgetHYearly });
    } catch {
        res.status(500).json({ message: 'Failed to clear visions' });
    }
};
