const PandL = require('../models/PandL');
const Client = require('../models/Client');
const { encrypt, decrypt } = require('../routes/encrypt');
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const FILES_BASE_URL = process.env.FILES_BASE_URL;

// Upload audio to cPanel
async function uploadAudioToCpanel(file, remoteFolder = 'mine/uplds/audios') {
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

    await client.ensureDir(remoteFolder);

    const ext = path.extname(file.originalname) || ".mp3";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, uniqueName);

    fs.writeFileSync(tempFilePath, file.buffer);
    await client.uploadFrom(tempFilePath, uniqueName);

    return `${FILES_BASE_URL}/uplds/audios/${encodeURIComponent(uniqueName)}`;
  } finally {
    client.close();
  }
}

// Upload image to cPanel
async function uploadImageToCpanel(file, remoteFolder = '/mine/uplds/imgs') {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: false
    });

    await client.ensureDir(remoteFolder);

    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const tempFile = path.join(os.tmpdir(), uniqueName);

    fs.writeFileSync(tempFile, file.buffer);
    await client.uploadFrom(tempFile, `${remoteFolder}/${uniqueName}`);

    return `${FILES_BASE_URL}/uplds/imgs/${encodeURIComponent(uniqueName)}`;
  } finally {
    client.close();
  }
}

// Helper to determine pandlTyp
function getPandlTyp(trnstnTyp) {
  if (trnstnTyp === 'sales' || trnstnTyp === 'income') {
    return 'cr';
  } else if (trnstnTyp === 'expense') {
    return 'db';
  }
  return null;
}

// Add new PandL entry
exports.addPandL = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uid || 'system';
    const {
      nme, clntId, adrs, title, amnt,
      trnstnTyp, pymntTyp, desc
    } = req.body;

    // Validate required fields
    if (!amnt || !trnstnTyp || !pymntTyp) {
      return res.status(400).json({ message: 'Amount, Transaction Type and Payment Type are required' });
    }

    const pandlTyp = getPandlTyp(trnstnTyp);

    const pandlData = {
      nme,
      clntId: clntId || null,
      adrs,
      title,
      amnt: parseFloat(amnt),
      trnstnTyp,
      pymntTyp,
      pandlTyp,
      desc,
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip
    };

    // Handle image upload
    pandlData.img = [];
    if (req.files?.imageFile) {
      const imageUrl = await uploadImageToCpanel(req.files.imageFile[0]);
      pandlData.img.push({
        file: imageUrl,
        uploadedOn: new Date(),
        uploadedBy: userId,
        uploadIp: ip
      });
    }

    // Handle audio upload
    if (req.files?.audioFile) {
      const audioUrl = await uploadAudioToCpanel(req.files.audioFile[0]);
      pandlData.audio = [{
        file: audioUrl,
        uploadedOn: new Date(),
        uploadedBy: userId,
        uploadIp: ip
      }];
    }

    const newPandL = new PandL(pandlData);
    const savedPandL = await newPandL.save();

    res.json(savedPandL);
  } catch (err) {
    console.error('Add PandL Error:', err);
    res.status(500).send(err.message);
  }
};

// Get all PandL entries with filtering
exports.getAllPandL = async (req, res) => {
  try {
    const role = req.user?.role;
    const uid = req.user?.uid;
    const category = req.query.category || 'All';
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { dltSts: 0 };
    
    // Filter by category (Transaction Type)
    if (category !== 'All') {
      query.trnstnTyp = category;
    }

    // Search functionality
    if (search.trim() !== "") {
      query.$or = [
        { nme: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { adrs: { $regex: search, $options: "i" } }
      ];
    }

    // Non-admin users can only see their own entries
    if (role !== 'adm') {
      query.crtdBy = uid;
    }

    const [pandlEntries, total] = await Promise.all([
      PandL.find(query)
        .sort({ crtdOn: -1 })
        .skip(skip)
        .limit(limit),
      PandL.countDocuments(query)
    ]);

    // Get client names for entries with clntId
    const enrichedEntries = await Promise.all(
      pandlEntries.map(async (entry) => {
        let clientName = entry.nme;
        
        // If we have clntId, fetch client details
        if (entry.clntId) {
          const client = await Client.findById(entry.clntId).select('name');
          if (client) {
            clientName = client.name;
          }
        }

        return {
          ...entry.toObject(),
          clientName: clientName
        };
      })
    );

    res.json({
      pandlEntries: enrichedEntries,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error('Get All PandL Error:', err);
    res.status(500).send(err.message);
  }
};

// Edit PandL entry
exports.editPandL = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uid || 'system';
    const {
      nme, clntId, adrs, title, amnt,
      trnstnTyp, pymntTyp, desc, existingImages
    } = req.body;

    const pandlTyp = getPandlTyp(trnstnTyp);

    const updateData = {
      nme,
      clntId: clntId || null,
      adrs,
      title,
      amnt: parseFloat(amnt),
      trnstnTyp,
      pymntTyp,
      pandlTyp,
      desc,
      updtOn: new Date(),
      updtBy: userId,
      updtIp: ip
    };

    // Get current entry
    const currentEntry = await PandL.findById(req.params.id);
    let currentImages = currentEntry.img || [];

    // Parse existing images if provided
    if (existingImages) {
      try {
        currentImages = JSON.parse(existingImages);
      } catch (err) {
        console.error('Error parsing existingImages:', err);
      }
    }

    // Add new image if uploaded
    if (req.files?.imageFile?.[0]) {
      const imageUrl = await uploadImageToCpanel(req.files.imageFile[0]);
      currentImages.push({
        file: imageUrl,
        uploadedOn: new Date(),
        uploadedBy: userId,
        uploadIp: ip
      });
    }

    updateData.img = currentImages;

    // Add new audio if uploaded
    if (req.files?.audioFile?.[0]) {
      const audioUrl = await uploadAudioToCpanel(req.files.audioFile[0]);
      updateData.$push = {
        audio: {
          file: audioUrl,
          uploadedOn: new Date(),
          uploadedBy: userId,
          uploadIp: ip
        }
      };
    }

    const updatedPandL = await PandL.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedPandL);
  } catch (err) {
    console.error('Edit PandL Error:', err);
    res.status(500).send(err.message);
  }
};

// Delete PandL entry
exports.deletePandL = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uid || 'system';

    const deleted = await PandL.findByIdAndUpdate(
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
    console.error('Delete PandL Error:', err);
    res.status(500).send(err.message);
  }
};

// Bulk delete PandL entries
exports.bulkDeletePandL = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user?.uid || 'system';
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    const result = await PandL.updateMany(
      { _id: { $in: ids }, dltSts: 0 },
      {
        dltSts: 1,
        dltOn: new Date(),
        dltBy: userId,
        dltIp: req.ip
      }
    );

    res.json({ message: `${result.modifiedCount} entry(s) deleted successfully` });
  } catch (err) {
    console.error('Bulk Delete Error:', err);
    res.status(500).json({ message: 'Bulk deletion failed' });
  }
};

// Search clients by name for suggestions
exports.searchClientsByName = async (req, res) => {
  try {
    const search = req.query.search || "";
    
    if (search.length < 3) {
      return res.json([]);
    }

    const clients = await Client.find({
      name: { $regex: search, $options: 'i' },
      dltSts: 0
    })
    .select('name email ph loc')
    .limit(10);

    const decryptedClients = clients.map(client => ({
      _id: client._id,
      name: client.name,
      email: safeDecrypt(client.email),
      ph: safeDecrypt(client.ph),
      loc: client.loc
    }));

    res.json(decryptedClients);
  } catch (err) {
    console.error('Search Clients Error:', err);
    res.status(500).send(err.message);
  }
};

// Get client suggestions for name field
exports.getClientSuggestions = async (req, res) => {
  try {
    const { name } = req.query;
    const suggestions = { names: [] };

    if (name && name.length >= 3) {
      const clients = await Client.find({
        name: { $regex: name, $options: 'i' },
        dltSts: 0
      })
      .limit(5)
      .select('name ph email loc');

      suggestions.names = clients.map(client => ({
        ...client.toObject(),
        ph: safeDecrypt(client.ph),
        email: safeDecrypt(client.email)
      }));
    }

    res.json(suggestions);
  } catch (err) {
    console.error('Get Suggestions Error:', err);
    res.status(500).send("Error fetching suggestions");
  }
};

// Helper function for decryption
function safeDecrypt(value) {
  try {
    if (!value) return "";
    return decrypt(value) || "";
  } catch (err) {
    return value;
  }
}