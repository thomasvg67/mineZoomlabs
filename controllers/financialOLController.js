const FinancialOL = require('../models/FinancialOL');

exports.getAllFinancialOLs = async (req, res) => {
    try {

         const { type } = req.query;

         const filter = {
            dltSts: false,
            ...(type && { type })  
        };


        const financialOLs = await FinancialOL.find(filter).sort({ crtdOn: -1 }).lean();
        financialOLs.forEach(m => {
            m.visions = (m.visions || []).filter(v => !v.dltSts);
        });
        res.json(financialOLs);
    } catch {
        res.status(500).json({ message: 'Failed to fetch financialOLs' });
    }
};

exports.addFinancialOL = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const financialOL = new FinancialOL({
            name: req.body.name,
             type: req.body.type,
            crtdBy: userId,
            crtdIp: ip
        });

        await financialOL.save();
        res.json({ message: 'FinancialOL added', financialOL });
    } catch {
        res.status(500).json({ message: 'Failed to add financialOL' });
    }
};

exports.editFinancialOL = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await FinancialOL.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                updtBy: userId,
                updtIp: ip,
                updtOn: new Date()
            }
        }, { new: true });

        if (!updated) return res.status(404).json({ message: 'FinancialOL not found' });
        res.json({ message: 'FinancialOL updated', financialOL: updated });
    } catch {
        res.status(500).json({ message: 'Failed to update financialOL' });
    }
};

exports.deleteFinancialOL = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await FinancialOL.findByIdAndUpdate(req.params.id, {
            $set: {
                dltSts: true,
                dltBy: userId,
                dltIp: ip,
                dltOn: new Date()
            }
        }, { new: true });

        if (!deleted) return res.status(404).json({ message: 'FinancialOL not found' });
        res.json({ message: 'FinancialOL deleted', financialOL: deleted });
    } catch {
        res.status(500).json({ message: 'Failed to delete financialOL' });
    }
};

exports.addVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const financialOL = await FinancialOL.findById(req.params.id);
        if (!financialOL) return res.status(404).json({ message: 'FinancialOL not found' });

        financialOL.visions.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await financialOL.save();
        res.json({ message: 'Vision added', financialOL });
    } catch {
        res.status(500).json({ message: 'Failed to add vision' });
    }
};

exports.editVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const financialOL = await FinancialOL.findById(req.params.id);
        if (!financialOL) return res.status(404).json({ message: 'FinancialOL not found' });

        const vision = financialOL.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.title = req.body.title;
        vision.description = req.body.description;
        vision.updtBy = userId;
        vision.updtIp = ip;
        vision.updtOn = new Date();

        await financialOL.save();
        res.json({ message: 'Vision updated', financialOL });
    } catch {
        res.status(500).json({ message: 'Failed to update vision' });
    }
};

exports.deleteVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const financialOL = await FinancialOL.findById(req.params.id);
        if (!financialOL) return res.status(404).json({ message: 'FinancialOL not found' });

        const vision = financialOL.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.dltSts = true;
        vision.dltBy = userId;
        vision.dltIp = ip;
        vision.dltOn = new Date();

        await financialOL.save();
        res.json({ message: 'Vision deleted', financialOL });
    } catch {
        res.status(500).json({ message: 'Failed to delete vision' });
    }
};

exports.clearVisions = async (req, res) => {
    try {
        const financialOL = await FinancialOL.findById(req.params.id);
        if (!financialOL) return res.status(404).json({ message: 'FinancialOL not found' });

        financialOL.visions = [];
        await financialOL.save();

        res.json({ message: 'All visions cleared', financialOL });
    } catch {
        res.status(500).json({ message: 'Failed to clear visions' });
    }
};
