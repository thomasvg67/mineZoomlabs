const EmailTemplate = require('../models/EmailTemplate');

exports.addEmailTemplate = async (req, res) => {
    try {
        const ip = req.ip;
        const userId = req.user?.uId || 'system';

        const { note, subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                message: 'Subject and Message are required'
            });
        }

        const template = new EmailTemplate({
            note,
            subject,
            message,
            crtdOn: new Date(),
            crtdBy: userId,
            crtdIp: ip,
            dltSts: 0
        });

        const saved = await template.save();

        res.json(saved);
    } catch (err) {
        console.error('Error adding template:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllEmailTemplates = async (req, res) => {
    try {
        let query = { dltSts: 0 };

        const search = req.query.search || "";

        if (search.trim() !== "") {
            query.$or = [
                { note: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } }
            ];
        }

        const draw = parseInt(req.query.draw) || 1;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [templates, total] = await Promise.all([
            EmailTemplate.find(query)
                .sort({ crtdOn: -1 })
                .skip(skip)
                .limit(limit),

            EmailTemplate.countDocuments(query)
        ]);

        res.json({
            draw,
            recordsTotal: total,
            recordsFiltered: total,
            data: templates
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.editEmailTemplate = async (req, res) => {
    try {
        const ip = req.ip;
        const userId = req.user?.uId || 'system';

        const { note, subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                message: 'Subject and Message are required'
            });
        }

        const updated = await EmailTemplate.findByIdAndUpdate(
            req.params.id,
            {
                note,
                subject,
                message,
                updtOn: new Date(),
                updtBy: userId,
                updtIp: ip
            },
            { new: true }
        );

        res.json(updated);

    } catch (err) {
        console.error('Error editing template:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEmailTemplate = async (req, res) => {
    try {

        const userId = req.user?.uId || 'system';

        const deleted = await EmailTemplate.findByIdAndUpdate(
            req.params.id,
            {
                dltSts: 1,
                dltOn: new Date(),
                dltBy: userId,
                dltIp: req.ip
            },
            { new: true }
        );

        res.json(deleted);

    } catch (err) {
        console.error('Error deleting template:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getEmailTemplateById = async (req, res) => {
    try {

        const template = await EmailTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        res.json({ success: true, template });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.bulkDeleteEmailTemplates = async (req, res) => {
    try {

        const { ids } = req.body;
        const userId = req.user?.uId || 'system';

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided' });
        }

        const result = await EmailTemplate.updateMany(
            { _id: { $in: ids }, dltSts: 0 },
            {
                dltSts: 1,
                dltOn: new Date(),
                dltBy: userId,
                dltIp: req.ip
            }
        );

        res.json({
            message: `${result.modifiedCount} template(s) deleted successfully`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Bulk deletion failed' });
    }
};