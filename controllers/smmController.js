const Smm = require('../models/Smm');

exports.getAllSmms = async (req, res) => {
    try {
        const businesses = await Smm.find({ dltSts: false })
            .sort({ crtdOn: -1 })
            .lean();

        businesses.forEach(business => {
            business.ideas = (business.ideas || []).filter(idea => !idea.dltSts);
        });

        res.json(businesses);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch businesses' });
    }
};


exports.addSmm = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const newSmm = new Smm({
            name: req.body.name,
            crtdBy: userId,
            crtdIp: ip
        });

        await newSmm.save();
        res.json({ message: 'Smm added', business: newSmm });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add business' });
    }
};

exports.editSmm = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const updated = await Smm.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name: req.body.name,
                    updtBy: userId,
                    updtIp: ip,
                    updtOn: new Date()
                }
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Smm not found' });

        res.json({ message: 'Smm updated', business: updated });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
};

exports.deleteSmm = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const deleted = await Smm.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    dltSts: true,
                    dltBy: userId,
                    dltIp: ip,
                    dltOn: new Date()
                }
            },
            { new: true }
        );

        if (!deleted) return res.status(404).json({ message: 'Smm not found' });

        res.json({ message: 'Smm soft-deleted', business: deleted });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

exports.addIdea = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const business = await Smm.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Smm not found' });

        business.ideas.push({
            title: req.body.title,
            description: req.body.description,
            crtdBy: userId,
            crtdIp: ip
        });

        await business.save();
        res.json({ message: 'Idea added', business });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add idea' });
    }
};

exports.editIdea = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const business = await Smm.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Smm not found' });

        const idea = business.ideas.id(req.params.ideaId);
        if (!idea) return res.status(404).json({ message: 'Idea not found' });

        idea.title = req.body.title;
        idea.description = req.body.description;
        idea.updtBy = userId;
        idea.updtIp = ip;
        idea.updtOn = new Date();

        await business.save();
        res.json({ message: 'Idea updated', business });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update idea' });
    }
};

exports.deleteIdea = async (req, res) => {
    try {
        const userId = req.user?.uId || 'system';
        const ip = req.ip;

        const business = await Smm.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Smm not found' });

        const idea = business.ideas.id(req.params.ideaId);
        if (!idea) return res.status(404).json({ message: 'Idea not found' });

        idea.dltSts = true;
        idea.dltBy = userId;
        idea.dltIp = ip;
        idea.dltOn = new Date();

        await business.save();
        res.json({ message: 'Idea deleted', business });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete idea' });
    }
};

exports.clearIdeas = async (req, res) => {
    try {
        const business = await Smm.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Smm not found' });

        business.ideas = [];
        await business.save();

        res.json({ message: 'All ideas cleared', business });
    } catch (err) {
        res.status(500).json({ message: 'Failed to clear ideas' });
    }
};
