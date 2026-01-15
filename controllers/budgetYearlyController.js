const BudgetYearly = require('../models/BudgetYearly');

exports.getAllBudgetYearlys = async (req, res) => {
    try {
        const budgetYearlys = await BudgetYearly.find({ dltSts: false }).sort({ crtdOn: -1 }).lean();
        budgetYearlys.forEach(m => {
            m.visions = (m.visions || []).filter(v => !v.dltSts);
        });
        res.json(budgetYearlys);
    } catch {
        res.status(500).json({ message: 'Failed to fetch budgetYearlys' });
    }
};

exports.addBudgetYearly = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetYearly = new BudgetYearly({
            name: req.body.name,
            crtdBy: userId,
            crtdIp: ip
        });

        await budgetYearly.save();
        res.json({ message: 'BudgetYearly added', budgetYearly });
    } catch {
        res.status(500).json({ message: 'Failed to add budgetYearly' });
    }
};

exports.editBudgetYearly = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await BudgetYearly.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                updtBy: userId,
                updtIp: ip,
                updtOn: new Date()
            }
        }, { new: true });

        if (!updated) return res.status(404).json({ message: 'BudgetYearly not found' });
        res.json({ message: 'BudgetYearly updated', budgetYearly: updated });
    } catch {
        res.status(500).json({ message: 'Failed to update budgetYearly' });
    }
};

exports.deleteBudgetYearly = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await BudgetYearly.findByIdAndUpdate(req.params.id, {
            $set: {
                dltSts: true,
                dltBy: userId,
                dltIp: ip,
                dltOn: new Date()
            }
        }, { new: true });

        if (!deleted) return res.status(404).json({ message: 'BudgetYearly not found' });
        res.json({ message: 'BudgetYearly deleted', budgetYearly: deleted });
    } catch {
        res.status(500).json({ message: 'Failed to delete budgetYearly' });
    }
};

exports.addVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetYearly = await BudgetYearly.findById(req.params.id);
        if (!budgetYearly) return res.status(404).json({ message: 'BudgetYearly not found' });

        budgetYearly.visions.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await budgetYearly.save();
        res.json({ message: 'Vision added', budgetYearly });
    } catch {
        res.status(500).json({ message: 'Failed to add vision' });
    }
};

exports.editVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetYearly = await BudgetYearly.findById(req.params.id);
        if (!budgetYearly) return res.status(404).json({ message: 'BudgetYearly not found' });

        const vision = budgetYearly.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.title = req.body.title;
        vision.description = req.body.description;
        vision.updtBy = userId;
        vision.updtIp = ip;
        vision.updtOn = new Date();

        await budgetYearly.save();
        res.json({ message: 'Vision updated', budgetYearly });
    } catch {
        res.status(500).json({ message: 'Failed to update vision' });
    }
};

exports.deleteVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budgetYearly = await BudgetYearly.findById(req.params.id);
        if (!budgetYearly) return res.status(404).json({ message: 'BudgetYearly not found' });

        const vision = budgetYearly.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.dltSts = true;
        vision.dltBy = userId;
        vision.dltIp = ip;
        vision.dltOn = new Date();

        await budgetYearly.save();
        res.json({ message: 'Vision deleted', budgetYearly });
    } catch {
        res.status(500).json({ message: 'Failed to delete vision' });
    }
};

exports.clearVisions = async (req, res) => {
    try {
        const budgetYearly = await BudgetYearly.findById(req.params.id);
        if (!budgetYearly) return res.status(404).json({ message: 'BudgetYearly not found' });

        budgetYearly.visions = [];
        await budgetYearly.save();

        res.json({ message: 'All visions cleared', budgetYearly });
    } catch {
        res.status(500).json({ message: 'Failed to clear visions' });
    }
};
