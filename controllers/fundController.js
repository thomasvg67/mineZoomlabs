const Fund = require('../models/Fund');

exports.getAllFunds = async (req, res) => {
    try {

         const { type } = req.query;

         const filter = {
            dltSts: false,
            ...(type && { type })  
        };


        const funds = await Fund.find(filter).sort({ crtdOn: -1 }).lean();
        funds.forEach(m => {
            m.visions = (m.visions || []).filter(v => !v.dltSts);
        });
        res.json(funds);
    } catch {
        res.status(500).json({ message: 'Failed to fetch funds' });
    }
};

exports.addFund = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const fund = new Fund({
            name: req.body.name,
             type: req.body.type,
            crtdBy: userId,
            crtdIp: ip
        });

        await fund.save();
        res.json({ message: 'Fund added', fund });
    } catch {
        res.status(500).json({ message: 'Failed to add fund' });
    }
};

exports.editFund = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await Fund.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                updtBy: userId,
                updtIp: ip,
                updtOn: new Date()
            }
        }, { new: true });

        if (!updated) return res.status(404).json({ message: 'Fund not found' });
        res.json({ message: 'Fund updated', fund: updated });
    } catch {
        res.status(500).json({ message: 'Failed to update fund' });
    }
};

exports.deleteFund = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await Fund.findByIdAndUpdate(req.params.id, {
            $set: {
                dltSts: true,
                dltBy: userId,
                dltIp: ip,
                dltOn: new Date()
            }
        }, { new: true });

        if (!deleted) return res.status(404).json({ message: 'Fund not found' });
        res.json({ message: 'Fund deleted', fund: deleted });
    } catch {
        res.status(500).json({ message: 'Failed to delete fund' });
    }
};

exports.addVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const fund = await Fund.findById(req.params.id);
        if (!fund) return res.status(404).json({ message: 'Fund not found' });

        fund.visions.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await fund.save();
        res.json({ message: 'Vision added', fund });
    } catch {
        res.status(500).json({ message: 'Failed to add vision' });
    }
};

exports.editVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const fund = await Fund.findById(req.params.id);
        if (!fund) return res.status(404).json({ message: 'Fund not found' });

        const vision = fund.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.title = req.body.title;
        vision.description = req.body.description;
        vision.updtBy = userId;
        vision.updtIp = ip;
        vision.updtOn = new Date();

        await fund.save();
        res.json({ message: 'Vision updated', fund });
    } catch {
        res.status(500).json({ message: 'Failed to update vision' });
    }
};

exports.deleteVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const fund = await Fund.findById(req.params.id);
        if (!fund) return res.status(404).json({ message: 'Fund not found' });

        const vision = fund.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.dltSts = true;
        vision.dltBy = userId;
        vision.dltIp = ip;
        vision.dltOn = new Date();

        await fund.save();
        res.json({ message: 'Vision deleted', fund });
    } catch {
        res.status(500).json({ message: 'Failed to delete vision' });
    }
};

exports.clearVisions = async (req, res) => {
    try {
        const fund = await Fund.findById(req.params.id);
        if (!fund) return res.status(404).json({ message: 'Fund not found' });

        fund.visions = [];
        await fund.save();

        res.json({ message: 'All visions cleared', fund });
    } catch {
        res.status(500).json({ message: 'Failed to clear visions' });
    }
};
