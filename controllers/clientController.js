// controllers/clientController.js

const Alert = require('../models/Alert');
const Client = require('../models/Client');
const TdyAlert = require('../models/TdyAlert');
const FdBack = require('../models/FdBack');
const { encrypt, decrypt } = require('../routes/encrypt');
const moment = require("moment-timezone");
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const FRONTEND_URL = process.env.FRONTEND_URL;

// Upload audio buffer to cPanel
async function uploadAudioToCpanel(file, remoteFolder = '/uploads/audios') {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    
     const MAX_SIZE = 333 * 1024; 
    if (file.size > MAX_SIZE) {
      throw new Error("Audio file size exceeds 333 KB limit");
    }

    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: false
    });

     console.log('FTP Connected successfully');
     
    await client.ensureDir(remoteFolder);

    const ext = path.extname(file.originalname) || ".mp3";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, uniqueName);

    // Save buffer temporarily
    fs.writeFileSync(tempFilePath, file.buffer);

    // Upload
    await client.uploadFrom(tempFilePath, `${remoteFolder}/${uniqueName}`);

    // Return public URL
    return `${FRONTEND_URL}/uploads/audios/${encodeURIComponent(uniqueName)}`;
  } finally {
    client.close();
  }
}

async function uploadImageToCpanel(file, remoteFolder = '/uploads/images') {
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

    return `${FRONTEND_URL}/uploads/images/${encodeURIComponent(uniqueName)}`;

  } finally {
    client.close();
  }
}

async function uploadImageToLocal(file, subFolder = 'client/images') {
  if (!file || !file.buffer) return null;

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_SIZE) {
    throw new Error('Image size exceeds 2MB limit');
  }

  const baseUploadDir = path.join(__dirname, '..', 'uploads');
  const uploadDir = path.join(baseUploadDir, subFolder);

  // ✅ Create ONLY if missing
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname) || '.png';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  fs.writeFileSync(filePath, file.buffer);

  return `/uploads/${subFolder}/${uniqueName}`;
}


function getISTDayRange() {
  const istStart = moment().tz("Asia/Kolkata").startOf("day").toDate(); // Today 00:00 IST
  const istEnd = moment().tz("Asia/Kolkata").endOf("day").toDate();     // Today 23:59:59.999 IST
  return { startOfToday: istStart, endOfToday: istEnd };
}

function safeDecrypt(value) {
  try {
    if (!value) return "";
    return decrypt(value) || "";
  } catch (err) {
    console.warn("⚠️ Decryption failed, returning raw value:", value);
    return value; // fallback to raw DB value
  }
}


exports.addClient = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uid || 'system';
    const { fdback, startTime, endTime, subject, ...clientData } = req.body;

    if (clientData.email) clientData.email = encrypt(clientData.email);
    if (clientData.ph) clientData.ph = encrypt(clientData.ph);

      if (req.file) {
      const audioUrl = await uploadAudioToCpanel(req.file);
      clientData.audio = [{ file: audioUrl, uploadedOn: new Date() }];
    }

    clientData.images = [];
    if (req.files?.imageFile) {
      // Handle single image file
      const imageUrl = await uploadImageToCpanel(req.files.imageFile[0]);
      // const imageUrl = await uploadImageToLocal(req.files.imageFile[0]);
      clientData.images.push({
        file: imageUrl,
        uploadedOn: new Date(),
        uploadedBy: userId,
        uploadIp: ip
      });
    }

    const client = new Client({
      ...clientData,
      fdback: fdback ? [{
        content: fdback,
        crtdOn: new Date(),
        crtdBy: userId,
        crtdIp: ip
      }] : [],
      crtdOn: new Date(),
      crtdBy: userId,
      crtdIp: ip,
      assignedTo: clientData.assignedTo || userId
    });

    const savedClient = await client.save();

    // Always create alert record
    if (startTime) {
      const alertDoc = {
        clientId: savedClient._id,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        subject: subject && subject.trim() !== "" ? subject : `Reminder for ${clientData.name}`,
        status: 0,
        assignedTo: savedClient.assignedTo,
        crtdOn: new Date(),
        crtdBy: userId,
        crtdIp: ip
      };

      await Alert.create(alertDoc);

      // ✅ If alert is today, also store in tdyAlrt
      const { startOfToday, endOfToday } = getISTDayRange();
      if (alertDoc.startTime >= startOfToday && alertDoc.startTime <= endOfToday) {
        await TdyAlert.create({
          clientId: savedClient._id,
          alertTime: alertDoc.startTime,
          subject: alertDoc.subject,
          assignedTo: savedClient.assignedTo,
          status: alertDoc.status,
          crtdOn: new Date(),
          crtdBy: userId,
          crtdIp: ip
        });
      }
    }

    const responseClient = {
      ...savedClient.toObject(),
      ph: safeDecrypt(savedClient.ph),
      email: safeDecrypt(savedClient.email)
    };

    res.json(responseClient);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const role = req.user?.role;
    const uid = req.user?.uid;
    const category = req.query.category;
    const hasDOB = req.query.hasDOB;
    const hasWedding = req.query.hasWedding;
    const hasSpecial = req.query.hasSpecial;

    let query = { dltSts: 0 };
    if (role !== 'adm') query.assignedTo = uid;
    if (category && category !== 'All') query.category = category;

    // DOB filter if requested
    if (hasDOB === 'true') {
      query.dob = { $ne: null, $exists: true };
    }

    // Wedding filter if requested
    if (hasWedding === 'true') {
      query.weddingDay = { $ne: null, $exists: true };
    }

    // Special filter if requested
    if (hasSpecial === 'true') {
      query.specialDay = { $ne: null, $exists: true };
    }

    const search = req.query.search || "";
    if (search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { ph: { $regex: search, $options: "i" } },
        { loc: { $regex: search, $options: "i" } }
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      Client.find(query).sort({ crtdOn: -1 }).skip(skip).limit(limit),
      Client.countDocuments(query)
    ]);

    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const alert = await Alert.findOne(
          { clientId: client._id, dltSts: 0 },
          { startTime: 1, endTime: 1, subject: 1, status: 1 }
        ).sort({ crtdOn: -1 });

        return {
          ...client.toObject(),
          ph: safeDecrypt(client.ph),
          email: safeDecrypt(client.email),
          images: client.images || [],
          startTime: alert ? alert.startTime : null,
          endTime: alert ? alert.endTime : null,
          subject: alert ? alert.subject : null,
          alertStatus: alert ? alert.status : null,
        };
      })
    );

    res.json({
      clients: enrichedClients,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.editClient = async (req, res) => {
  try {
    console.log('=== Edit Client Request ===');
    console.log('Request Body:', req.body);
    console.log('Files:', req.files);
    console.log('Image File exists:', !!req.files?.imageFile?.[0]);

    if (req.files?.imageFile?.[0]) {
      console.log('Image File details:', {
        originalname: req.files.imageFile[0].originalname,
        size: req.files.imageFile[0].size,
        mimetype: req.files.imageFile[0].mimetype
      });
    }
    const ip = req.ip;
    const userId = req.user?.uid || 'system';
    const { fdback, startTime, endTime, subject,existingImages, ...clientData } = req.body;
    

    if (clientData.email) clientData.email = encrypt(clientData.email);
    if (clientData.ph) clientData.ph = encrypt(clientData.ph);

    const updateData = {
      ...clientData,
      updtOn: new Date(),
      updtBy: userId,
      updtIp: ip,
    };

    if (req.user?.role === 'adm') {
      updateData.assignedTo = clientData.assignedTo;
    }

    const pushData = {};

    if (fdback) pushData.fdback = { content: fdback, crtdOn: new Date(), crtdBy: userId, crtdIp: ip };
    if (req.files?.audioFile?.[0]) {
      const audioUrl = await uploadAudioToCpanel(req.files.audioFile[0]);
      pushData.audio = { file: audioUrl, uploadedOn: new Date() };
    }


    // If existingImages is provided (from frontend), parse it and update
    let existingImagesArray = [];
    if (existingImages) {
      try {
        existingImagesArray = JSON.parse(existingImages);
      } catch (err) {
        console.error('Error parsing existingImages:', err);
      }
    }

    // Get the current client to preserve existing images
    const currentClient = await Client.findById(req.params.id);
    let currentImages = currentClient.images || [];

    // If we have existing images from frontend, use those
    if (existingImagesArray.length > 0) {
      currentImages = existingImagesArray;
      console.log('Parsed existing images:', currentImages.length);
    }

    // Add new image if uploaded
    if (req.files?.imageFile?.[0]) {
      const imageUrl = await uploadImageToCpanel(req.files.imageFile[0]);
      // const imageUrl = await uploadImageToLocal(req.files.imageFile[0]);
      currentImages.push({
        file: imageUrl,
        uploadedOn: new Date(),
        uploadedBy: userId,
        uploadIp: ip
      });
    }

    // Update the images array
    updateData.images = currentImages;

    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      { ...updateData, ...(Object.keys(pushData).length ? { $push: pushData } : {}) },
      { new: true }
    );

    // Update alerts if new startTime provided
    if (startTime) {
      const nxtAlrtDate = new Date(startTime);
      const { startOfToday, endOfToday } = getISTDayRange();

      await Alert.updateOne(
        { clientId: req.params.id, dltSts: 0 },
        {
          clientId: req.params.id,
          startTime: nxtAlrtDate,
          endTime: endTime || null,
          subject: subject || `Reminder for ${clientData.name}`,
          assignedTo: clientData.assignedTo || userId,
          status: 0,
          updtOn: new Date(),
          updtBy: userId,
          updtIp: ip,
        },
        { upsert: true }
      );

      // Mirror to TdyAlert if today's alert
      await TdyAlert.deleteMany({ clientId: req.params.id });
      if (nxtAlrtDate >= startOfToday && nxtAlrtDate <= endOfToday) {
        await TdyAlert.create({
          clientId: req.params.id,
          alertTime: nxtAlrtDate,
          subject: subject || `Reminder for ${clientData.name}`,
          assignedTo: clientData.assignedTo || userId,
          status: 0,
          crtdOn: new Date(),
          crtdBy: userId,
          crtdIp: ip
        });
      }
    }

    const responseClient = {
      ...updated.toObject(),
      ph: safeDecrypt(updated.ph),
      email: safeDecrypt(updated.email)
    };

    res.json(responseClient);
  } catch (err) {
    console.error('Edit Client Error:', err);
    res.status(500).send(err.message);
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uid || 'system';

    const deleted = await Client.findByIdAndUpdate(req.params.id, {
      dltOn: new Date(),
      dltBy: userId,
      dltIp: ip,
      dltSts: 1
    }, { new: true });

    await Alert.updateMany(
      { clientId: req.params.id, dltSts: 0 },
      { dltOn: new Date(), dltBy: userId, dltIp: ip, dltSts: 1 }
    );

    await TdyAlert.deleteMany({ clientId: req.params.id });

    res.json(deleted);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { name, ph, email } = req.query;
    let suggestions = {};

    if (name && name.length >= 3) {
      suggestions.names = (await Client.find({
        name: { $regex: name, $options: 'i' }, dltSts: 0
      }).limit(5).select('name ph email')).map(c => ({
        ...c.toObject(),
        ph: safeDecrypt(c.ph) || '',
        email: safeDecrypt(c.email) || ''

      }));
    }

    if (ph && ph.length >= 5) {
      suggestions.phones = (await Client.find({
        ph: { $regex: `^${ph}`, $options: 'i' }, dltSts: 0
      }).limit(5).select('name ph loc')).map(c => ({
        ...c.toObject(),
        ph: safeDecrypt(c.ph) || '',
      }));

      if (ph.length === 10) {
        const exact = await Client.findOne({ ph, dltSts: 0 });
        if (exact) suggestions.existingPhone = true;
      }
    }

    if (email && email.length >= 5) {
      suggestions.emails = (await Client.find({
        email: { $regex: `^${email}`, $options: 'i' }, dltSts: 0
      }).limit(5).select('name email loc')).map(c => ({
        ...c.toObject(),
        email: safeDecrypt(c.email) || ''
      }));

      if (/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        const exact = await Client.findOne({ email, dltSts: 0 });
        if (exact) suggestions.existingEmail = true;
      }
    }

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching suggestions");
  }
};

exports.bulkDeleteClients = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No client IDs provided' });
    }

    const result = await Client.updateMany(
      { _id: { $in: ids }, dltSts: 0 },
      { $set: { dltSts: 1, dltOn: new Date() } }
    );

    await Alert.updateMany(
      { clientId: { $in: ids }, dltSts: 0 },
      { dltSts: 1, dltOn: new Date() }
    );

    await TdyAlert.deleteMany({ clientId: { $in: ids } });

    res.json({ message: `${result.modifiedCount} client(s) soft-deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Bulk deletion failed' });
  }
};


exports.updateFeedback = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uid || 'system';
    const clientId = req.params.id;
    const { feedbackId, fdback, type } = req.body;
    const currentDate = new Date();

    // Find the client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Find the specific feedback to update
    const feedbackIndex = client.fdback.findIndex(f => f._id.toString() === feedbackId);
    if (feedbackIndex === -1) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const feedback = client.fdback[feedbackIndex];
    
    // Check if feedback is within last 3 days
    const feedbackDate = new Date(feedback.crtdOn);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    if (feedbackDate < threeDaysAgo) {
      return res.status(400).json({ 
        message: 'You can only edit feedbacks created within the last 3 days' 
      });
    }

    // Update feedback content and add update info
    client.fdback[feedbackIndex].content = fdback || feedback.content;
    client.fdback[feedbackIndex].updtOn = currentDate;
    client.fdback[feedbackIndex].updtBy = userId;
    client.fdback[feedbackIndex].updtIp = ip;

    // Update client type if provided
    if (type) {
      client.type = type;
    }

    // Update client's updtOn field
    client.updtOn = currentDate;
    client.updtBy = userId;
    client.updtIp = ip;

    // Handle audio upload if provided
    if (req.file) {
      try {
        const audioUrl = await uploadAudioToCpanel(req.file);
        client.audio.push({
          file: audioUrl,
          uploadedOn: currentDate,
          uploadedBy: userId,
          uploadIp: ip
        });
        
        // Start background upload (optional optimization)
        handleAudioUploadAsync(clientId, req.file, userId, ip)
          .catch(err => console.error('Background audio upload error:', err));
      } catch (error) {
        console.error('Audio upload error:', error);
        // Continue without audio if upload fails
      }
    }

    // Save the updated client
    await client.save();

    // Prepare response
    const responseClient = {
      ...client.toObject(),
      ph: safeDecrypt(client.ph),
      email: safeDecrypt(client.email)
    };

    res.json(responseClient);

  } catch (err) {
    console.error('Error updating feedback:', err);
    res.status(500).json({ message: err.message || 'Failed to update feedback' });
  }
};
