const Career = require('../models/Career');
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FILES_BASE_URL = process.env.FILES_BASE_URL;

async function uploadAudioToCpanel(file) {
    const client = new ftp.Client(30000);
    client.ftp.verbose = true;
    try {
        const MAX_SIZE = 340 * 1024; // 340 KB
        if (file.size > MAX_SIZE) {
            throw new Error("Audio file size exceeds 340 KB limit");
        }

        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false
        });

        await client.ensureDir('mine/uplds/careers/audios');

        const ext = path.extname(file.originalname) || '.mp3';
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const tempFile = path.join(os.tmpdir(), uniqueName);

        fs.writeFileSync(tempFile, file.buffer);
        await client.uploadFrom(tempFile, uniqueName);

        return `${FILES_BASE_URL}/uplds/careers/audios/${encodeURIComponent(uniqueName)}`;
    } finally {
        client.close();
    }
}

async function uploadImageToCpanel(file) {
    const client = new ftp.Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false
        });

        await client.ensureDir('mine/uplds/careers/imgs');

        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const tempFile = path.join(os.tmpdir(), uniqueName);

        fs.writeFileSync(tempFile, file.buffer);
        await client.uploadFrom(tempFile, uniqueName);

        return `${FILES_BASE_URL}/uplds/careers/imgs/${encodeURIComponent(uniqueName)}`;
    } finally {
        client.close();
    }
}

async function uploadDocToCpanel(file) {
    const client = new ftp.Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false
        });

        await client.ensureDir('mine/uplds/careers/docs');

        const ext = path.extname(file.originalname) || '.pdf';
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const tempFile = path.join(os.tmpdir(), uniqueName);

        fs.writeFileSync(tempFile, file.buffer);
        await client.uploadFrom(tempFile, uniqueName);

        return `${FILES_BASE_URL}/uplds/careers/docs/${encodeURIComponent(uniqueName)}`;
    } finally {
        client.close();
    }
}

async function deleteFileFromCpanel(fileUrl, folder) {
    const client = new ftp.Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false
        });

        const filename = decodeURIComponent(fileUrl.split('/').pop());
        const filePath = `mine/uplds/careers/${folder}/${filename}`;

        await client.remove(filePath);
    } catch (err) {
        console.error("FTP delete failed:", err.message);
    } finally {
        client.close();
    }
}


exports.addCareer = async (req, res) => {
    try {
        const ip = req.ip;
        const userId = req.user?.uId || 'system';

        // Validate required fields
        const { name, address, location, experience, skills, description } = req.body;

        if (!name || !location || !experience) {
            return res.status(400).json({
                message: 'Name, Location and Experience are required'
            });
        }

        const careerData = {
            name,
            address,
            location,
            experience,
            skills: skills || '',
            description: description || '',
            crtdOn: new Date(),
            crtdBy: userId,
            crtdIp: ip
        };

        // Handle image upload
        careerData.img = [];
        if (req.files?.imageFile) {
            const imageUrl = await uploadImageToCpanel(req.files.imageFile[0]);
            careerData.img.push({
                file: imageUrl,
                uploadedOn: new Date(),
                // uploadedBy: userId,
                // uploadIp: ip
            });
        }

        // Handle audio upload as array (like P&L)
        if (req.files?.audioFile) {
            const audioUrl = await uploadAudioToCpanel(req.files.audioFile[0]);
            careerData.audio = [{
                file: audioUrl,
                uploadedOn: new Date(),
                // uploadedBy: userId,
                // uploadIp: ip
            }];
        }

        // Handle documents upload
        if (req.files?.documents && req.files.documents.length > 0) {
            careerData.documents = [];
            for (const doc of req.files.documents) {
                const docUrl = await uploadDocToCpanel(doc);
                careerData.documents.push({
                    filename: docUrl,
                    originalName: doc.originalname,
                    uploadedOn: new Date(),
                    // uploadedBy: userId,
                    // uploadIp: ip
                });
            }
        }

        const career = new Career(careerData);
        const savedCareer = await career.save();

        res.json(savedCareer);
    } catch (err) {
        console.error('Error adding career:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCareers = async (req, res) => {
    try {
        let query = { dltSts: 0 };

        const search = req.query.search || "";
        const typeFilter = req.query.type || "";

        if (typeFilter.trim() !== "") {
            query.type = typeFilter;
        }

        if (search.trim() !== "") {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { experience: { $regex: search, $options: "i" } },
                { skills: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // ✅ DataTables params
        const draw = parseInt(req.query.draw) || 1;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'crtdOn';
        const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

        const allowedSortFields = [
            'name', 'address', 'location', 'experience', 'skills', 'crtdOn'
        ];

        const finalSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'crtdOn';

        const [careers, total] = await Promise.all([
            Career.find(query)
                .collation({ locale: 'en', strength: 2 })
                .sort({ [finalSortBy]: sortDir })
                .skip(skip)
                .limit(limit),
            Career.countDocuments(query)
        ]);

        // ✅ DataTables REQUIRED response
        res.json({
            draw,
            recordsTotal: total,
            recordsFiltered: total,
            data: careers
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.editCareer = async (req, res) => {
    try {
        const ip = req.ip;
        const userId = req.user?.uId || 'system';

        // Validate required fields
        const { name, address, location, experience, skills, description, existingImages } = req.body;

        if (!name || !location || !experience) {
            return res.status(400).json({
                message: 'Name, Location and Experience are required'
            });
        }

        const updateData = {
            name,
            address,
            location,
            experience,
            skills: skills || '',
            description: description || '',
            updtOn: new Date(),
            updtBy: userId,
            updtIp: ip
        };

        // Get current career entry
        const currentCareer = await Career.findById(req.params.id);
        let currentImages = currentCareer.img || [];

        // Parse existing images if provided
        if (existingImages) {
            try {
                currentImages = JSON.parse(existingImages);
            } catch (err) {
                console.error('Error parsing existingImages:', err);
            }
        }

        // // Add new image if uploaded
        if (req.files?.imageFile?.[0]) {
            // Delete existing images from FTP
            for (const img of currentCareer.img || []) {
                await deleteFileFromCpanel(img.file, 'imgs');
            }

            // Upload new image
            const imageUrl = await uploadImageToCpanel(req.files.imageFile[0]);
            updateData.img = [{
                file: imageUrl,
                uploadedOn: new Date(),
            }];
        }

        // Add new audio if uploaded (using $push like P&L)
        if (req.files?.audioFile?.[0]) {
            const audioUrl = await uploadAudioToCpanel(req.files.audioFile[0]);
            updateData.$push = {
                audio: {
                    file: audioUrl,
                    uploadedOn: new Date(),
                    // uploadedBy: userId,
                    // uploadIp: ip
                }
            };
        }

        // Handle new documents upload
        if (req.files?.documents && req.files.documents.length > 0) {
            // Delete existing documents from FTP
            for (const doc of currentCareer.documents || []) {
                await deleteFileFromCpanel(doc.filename, 'docs');
            }

            // Upload new documents
            const newDocuments = [];
            for (const doc of req.files.documents) {
                const docUrl = await uploadDocToCpanel(doc);
                newDocuments.push({
                    filename: docUrl,
                    originalName: doc.originalname,
                    uploadedOn: new Date()
                });
            }
            updateData.documents = newDocuments;
        }

        // Handle deleted images
        if (req.body.deletedImages) {
            let deletedImgs = [];
            try {
                deletedImgs = JSON.parse(req.body.deletedImages);
            } catch { }

            for (const img of deletedImgs) {
                await deleteFileFromCpanel(img, 'imgs');
            }
        }

        // Handle deleted documents
        if (req.body.deletedDocuments) {
            let deletedDocs = [];
            try {
                deletedDocs = JSON.parse(req.body.deletedDocuments);
            } catch (e) {
                console.error("Invalid deletedDocuments JSON");
            }

            for (const doc of deletedDocs) {
                // delete from FTP
                await deleteFileFromCpanel(doc.filename, 'docs');
            }

            // remove from MongoDB
            updateData.$pull = {
                documents: {
                    filename: { $in: deletedDocs.map(d => d.filename) }
                }
            };
        }

        // Handle deleted audios
        if (req.body.deletedAudios) {
            let deletedAudios = [];
            try {
                deletedAudios = JSON.parse(req.body.deletedAudios);
            } catch { }

            for (const audio of deletedAudios) {
                await deleteFileFromCpanel(audio.file, 'audios');
            }

            updateData.$pull = {
                ...(updateData.$pull || {}),
                audio: {
                    file: { $in: deletedAudios.map(a => a.file) }
                }
            };
        }


        const updated = await Career.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        console.error('Error editing career:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCareer = async (req, res) => {
    try {
        const ip = req.ip;
        const userId = req.user?.uId || 'system';

        const deleted = await Career.findByIdAndUpdate(
            req.params.id,
            {
                dltOn: new Date(),
                dltBy: userId,
                dltIp: ip,
                dltSts: 1
            },
            { new: true }
        );

        res.json(deleted);
    } catch (err) {
        console.error('Error deleting career:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getCareerById = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);

        if (!career) {
            return res.status(404).json({ message: "Career not found" });
        }

        res.status(200).json({ success: true, career });
    } catch (err) {
        console.error("Error fetching career:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Bulk delete Careers
exports.bulkDeleteCareers = async (req, res) => {
    try {
        const { ids } = req.body;
        const userId = req.user?.uId || 'system';

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided' });
        }

        const result = await Career.updateMany(
            { _id: { $in: ids }, dltSts: 0 },
            {
                dltSts: 1,
                dltOn: new Date(),
                dltBy: userId,
                dltIp: req.ip
            }
        );

        res.json({ message: `${result.modifiedCount} career(s) deleted successfully` });
    } catch (err) {
        console.error('Bulk Delete Error:', err);
        res.status(500).json({ message: 'Bulk deletion failed' });
    }
};