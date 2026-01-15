const Vission = require('../models/Vission');

exports.getAllVissions = async (req, res) => {
    try {
        const vissions = await Vission.find({ dltSts: false }).sort({ crtdOn: -1 }).lean();
        vissions.forEach(m => {
            m.visions = (m.visions || []).filter(v => !v.dltSts);
        });
        res.json(vissions);
    } catch {
        res.status(500).json({ message: 'Failed to fetch vissions' });
    }
};

exports.addVission = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const vission = new Vission({
            name: req.body.name,
            crtdBy: userId,
            crtdIp: ip
        });

        await vission.save();
        res.json({ message: 'Vission added', vission });
    } catch {
        res.status(500).json({ message: 'Failed to add vission' });
    }
};

exports.editVission = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await Vission.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                updtBy: userId,
                updtIp: ip,
                updtOn: new Date()
            }
        }, { new: true });

        if (!updated) return res.status(404).json({ message: 'Vission not found' });
        res.json({ message: 'Vission updated', vission: updated });
    } catch {
        res.status(500).json({ message: 'Failed to update vission' });
    }
};

exports.deleteVission = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await Vission.findByIdAndUpdate(req.params.id, {
            $set: {
                dltSts: true,
                dltBy: userId,
                dltIp: ip,
                dltOn: new Date()
            }
        }, { new: true });

        if (!deleted) return res.status(404).json({ message: 'Vission not found' });
        res.json({ message: 'Vission deleted', vission: deleted });
    } catch {
        res.status(500).json({ message: 'Failed to delete vission' });
    }
};

exports.addVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const vission = await Vission.findById(req.params.id);
        if (!vission) return res.status(404).json({ message: 'Vission not found' });

        vission.visions.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await vission.save();
        res.json({ message: 'Vision added', vission });
    } catch {
        res.status(500).json({ message: 'Failed to add vision' });
    }
};

exports.editVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const vission = await Vission.findById(req.params.id);
        if (!vission) return res.status(404).json({ message: 'Vission not found' });

        const vision = vission.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.title = req.body.title;
        vision.description = req.body.description;
        vision.updtBy = userId;
        vision.updtIp = ip;
        vision.updtOn = new Date();

        await vission.save();
        res.json({ message: 'Vision updated', vission });
    } catch {
        res.status(500).json({ message: 'Failed to update vision' });
    }
};

exports.deleteVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const vission = await Vission.findById(req.params.id);
        if (!vission) return res.status(404).json({ message: 'Vission not found' });

        const vision = vission.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.dltSts = true;
        vision.dltBy = userId;
        vision.dltIp = ip;
        vision.dltOn = new Date();

        await vission.save();
        res.json({ message: 'Vision deleted', vission });
    } catch {
        res.status(500).json({ message: 'Failed to delete vision' });
    }
};

exports.clearVisions = async (req, res) => {
    try {
        const vission = await Vission.findById(req.params.id);
        if (!vission) return res.status(404).json({ message: 'Vission not found' });

        vission.visions = [];
        await vission.save();

        res.json({ message: 'All visions cleared', vission });
    } catch {
        res.status(500).json({ message: 'Failed to clear visions' });
    }
};
