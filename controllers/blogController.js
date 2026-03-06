const Blog = require('../models/Blog');

exports.addBlog = async (req, res) => {
    try {
        const ip = req.ip;
        const userId = req.user?.uId || 'system';

        const { title, source, description } = req.body;

        if (!source || !title) {
            return res.status(400).json({
                message: 'Title and Subject are required'
            });
        }

        const template = new Blog({
            title,
            source,
            description,
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

exports.getAllBlogs = async (req, res) => {
    try {
        let query = { dltSts: 0 };

        const search = req.query.search || "";

        if (search.trim() !== "") {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { source: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const draw = parseInt(req.query.draw) || 1;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [templates, total] = await Promise.all([
            Blog.find(query)
                .sort({ crtdOn: -1 })
                .skip(skip)
                .limit(limit),

            Blog.countDocuments(query)
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

exports.editBlog = async (req, res) => {
    try {
        const ip = req.ip;
        const userId = req.user?.uId || 'system';

        const { title, source, description } = req.body;

        if (!source || !title) {
            return res.status(400).json({
                message: 'Title and Subject are required'
            });
        }

        const updated = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                title,
                source,
                description,
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

exports.deleteBlog = async (req, res) => {
    try {

        const userId = req.user?.uId || 'system';

        const deleted = await Blog.findByIdAndUpdate(
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

exports.getBlogById = async (req, res) => {
    try {

        const template = await Blog.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.json({ success: true, template });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.bulkDeleteBlogs = async (req, res) => {
    try {

        const { ids } = req.body;
        const userId = req.user?.uId || 'system';

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided' });
        }

        const result = await Blog.updateMany(
            { _id: { $in: ids }, dltSts: 0 },
            {
                dltSts: 1,
                dltOn: new Date(),
                dltBy: userId,
                dltIp: req.ip
            }
        );

        res.json({
            message: `${result.modifiedCount} blog(s) deleted successfully`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Bulk deletion failed' });
    }
};