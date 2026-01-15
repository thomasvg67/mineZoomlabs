const Budget = require('../models/Budget');

exports.getAllBudgets = async (req, res) => {
    try {

         const { type } = req.query;

         const filter = {
            dltSts: false,
            ...(type && { type })  
        };


        const budgets = await Budget.find(filter).sort({ crtdOn: -1 }).lean();
        budgets.forEach(m => {
            m.visions = (m.visions || []).filter(v => !v.dltSts);
        });
        res.json(budgets);
    } catch {
        res.status(500).json({ message: 'Failed to fetch budgets' });
    }
};

exports.addBudget = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budget = new Budget({
            name: req.body.name,
             type: req.body.type,
            crtdBy: userId,
            crtdIp: ip
        });

        await budget.save();
        res.json({ message: 'Budget added', budget });
    } catch {
        res.status(500).json({ message: 'Failed to add budget' });
    }
};

exports.editBudget = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await Budget.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                updtBy: userId,
                updtIp: ip,
                updtOn: new Date()
            }
        }, { new: true });

        if (!updated) return res.status(404).json({ message: 'Budget not found' });
        res.json({ message: 'Budget updated', budget: updated });
    } catch {
        res.status(500).json({ message: 'Failed to update budget' });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await Budget.findByIdAndUpdate(req.params.id, {
            $set: {
                dltSts: true,
                dltBy: userId,
                dltIp: ip,
                dltOn: new Date()
            }
        }, { new: true });

        if (!deleted) return res.status(404).json({ message: 'Budget not found' });
        res.json({ message: 'Budget deleted', budget: deleted });
    } catch {
        res.status(500).json({ message: 'Failed to delete budget' });
    }
};

exports.addVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        budget.visions.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await budget.save();
        res.json({ message: 'Vision added', budget });
    } catch {
        res.status(500).json({ message: 'Failed to add vision' });
    }
};

exports.editVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        const vision = budget.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.title = req.body.title;
        vision.description = req.body.description;
        vision.updtBy = userId;
        vision.updtIp = ip;
        vision.updtOn = new Date();

        await budget.save();
        res.json({ message: 'Vision updated', budget });
    } catch {
        res.status(500).json({ message: 'Failed to update vision' });
    }
};

exports.deleteVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        const vision = budget.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.dltSts = true;
        vision.dltBy = userId;
        vision.dltIp = ip;
        vision.dltOn = new Date();

        await budget.save();
        res.json({ message: 'Vision deleted', budget });
    } catch {
        res.status(500).json({ message: 'Failed to delete vision' });
    }
};

exports.clearVisions = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        budget.visions = [];
        await budget.save();

        res.json({ message: 'All visions cleared', budget });
    } catch {
        res.status(500).json({ message: 'Failed to clear visions' });
    }
};
