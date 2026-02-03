const Bible = require('../models/Bible');

exports.getAllBibles = async (req, res) => {
    try {
        const bibles = await Bible.find({ dltSts: false }).sort({ crtdOn: -1 }).lean();
        bibles.forEach(m => {
            m.visions = (m.visions || []).filter(v => !v.dltSts);
        });
        res.json(bibles);
    } catch {
        res.status(500).json({ message: 'Failed to fetch bibles' });
    }
};

exports.addBible = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const bible = new Bible({
            name: req.body.name,
            crtdBy: userId,
            crtdIp: ip
        });

        await bible.save();
        res.json({ message: 'Bible added', bible });
    } catch {
        res.status(500).json({ message: 'Failed to add bible' });
    }
};

exports.editBible = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await Bible.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                updtBy: userId,
                updtIp: ip,
                updtOn: new Date()
            }
        }, { new: true });

        if (!updated) return res.status(404).json({ message: 'Bible not found' });
        res.json({ message: 'Bible updated', bible: updated });
    } catch {
        res.status(500).json({ message: 'Failed to update bible' });
    }
};

exports.deleteBible = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await Bible.findByIdAndUpdate(req.params.id, {
            $set: {
                dltSts: true,
                dltBy: userId,
                dltIp: ip,
                dltOn: new Date()
            }
        }, { new: true });

        if (!deleted) return res.status(404).json({ message: 'Bible not found' });
        res.json({ message: 'Bible deleted', bible: deleted });
    } catch {
        res.status(500).json({ message: 'Failed to delete bible' });
    }
};

exports.addVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const bible = await Bible.findById(req.params.id);
        if (!bible) return res.status(404).json({ message: 'Bible not found' });

        bible.visions.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await bible.save();
        res.json({ message: 'Vision added', bible });
    } catch {
        res.status(500).json({ message: 'Failed to add vision' });
    }
};

exports.editVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const bible = await Bible.findById(req.params.id);
        if (!bible) return res.status(404).json({ message: 'Bible not found' });

        const vision = bible.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.title = req.body.title;
        vision.description = req.body.description;
        vision.updtBy = userId;
        vision.updtIp = ip;
        vision.updtOn = new Date();

        await bible.save();
        res.json({ message: 'Vision updated', bible });
    } catch {
        res.status(500).json({ message: 'Failed to update vision' });
    }
};

exports.deleteVision = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const bible = await Bible.findById(req.params.id);
        if (!bible) return res.status(404).json({ message: 'Bible not found' });

        const vision = bible.visions.id(req.params.visionId);
        if (!vision) return res.status(404).json({ message: 'Vision not found' });

        vision.dltSts = true;
        vision.dltBy = userId;
        vision.dltIp = ip;
        vision.dltOn = new Date();

        await bible.save();
        res.json({ message: 'Vision deleted', bible });
    } catch {
        res.status(500).json({ message: 'Failed to delete vision' });
    }
};

exports.clearVisions = async (req, res) => {
    try {
        const bible = await Bible.findById(req.params.id);
        if (!bible) return res.status(404).json({ message: 'Bible not found' });

        bible.visions = [];
        await bible.save();

        res.json({ message: 'All visions cleared', bible });
    } catch {
        res.status(500).json({ message: 'Failed to clear visions' });
    }
};
