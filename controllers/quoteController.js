const Quote = require('../models/Quote');
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const FRONTEND_URL = process.env.FRONTEND_URL;
const FILES_BASE_URL = process.env.FILES_BASE_URL;

async function uploadImageToCpanel(file, remoteFolder = '/mine/uplds/quts') {
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

    fs.unlinkSync(tempFile);

    return `${FILES_BASE_URL}/uplds/quts/${encodeURIComponent(uniqueName)}`;

  } finally {
    client.close();
  }
}

exports.getAllQuotes = async (req, res) => {
  try {
    const { page = 1, category = '', search = '' } = req.query;
    const PAGE_SIZE = 25;
    const skip = (page - 1) * PAGE_SIZE;

    const query = {
      dltSts: false,
    };

    if (category) query.subCategory = category;
    if (search && search.length >= 3) {
      query.$or = [
        { writtenBy: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Quote.countDocuments(query);
    const quotes = await Quote.find(query)
      // .sort({ crtdOn: -1 })
      .sort({ isFavourite: -1, crtdOn: -1 })
      .skip(skip)
      .limit(PAGE_SIZE);

    res.json({ quotes, totalPages: Math.ceil(total / PAGE_SIZE), currentPage: +page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch quotes' });
  }
};

exports.addQuote = async (req, res) => {
  try {
    const userId = req.user?.uId || 'system';
    const ip = req.ip;

    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadImageToCpanel(req.file);
    }

    if (req.body.isFavourite) {
      const favCount = await Quote.countDocuments({ isFavourite: true, dltSts: false });
      if (favCount >= 12) {
        return res.status(400).json({ message: 'Maximum 12 favourites allowed' });
      }
    }

    const newQuote = new Quote({
      subCategory: req.body.subCategory,
      writtenBy: req.body.writtenBy,
      source: req.body.source || '',
      quote: req.body.quote || '',
      image: imageUrl,
      isFavourite: req.body.isFavourite || false,
      sts: req.body.sts ?? true,
      crtdBy: userId,
      crtdIp: ip,
    });

    await newQuote.save();
    res.json({ message: 'Quote added successfully', quote: newQuote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add quote' });
  }
};

exports.editQuote = async (req, res) => {
  try {
    const userId = req.user?.uId || 'system';
    const ip = req.ip;

    if (req.body.isFavourite) {
      const favCount = await Quote.countDocuments({
        isFavourite: true,
        dltSts: false,
        _id: { $ne: req.params.id }
      });

      if (favCount >= 12) {
        return res.status(400).json({ message: 'Maximum 12 favourites allowed' });
      }
    }

    let imageUrl = req.body.image || "";

    if (req.file) {
      imageUrl = await uploadImageToCpanel(req.file);
    }

    const updated = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          subCategory: req.body.subCategory,
          writtenBy: req.body.writtenBy,
          source: req.body.source,
          quote: req.body.quote,
          image: imageUrl,
          isFavourite: req.body.isFavourite,
          sts: req.body.sts,
          updtBy: userId,
          updtIp: ip,
          updtOn: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Quote not found' });

    res.json({ message: 'Quote updated successfully', quote: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.deleteQuote = async (req, res) => {
  try {
    const userId = req.user?.uId || 'system';
    const ip = req.ip;

    const deleted = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dltSts: true,
          dltBy: userId,
          dltIp: ip,
          dltOn: new Date(),
        },
      },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ message: 'Quote not found' });

    res.json({ message: 'Quote soft-deleted successfully', quote: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Deletion failed' });
  }
};
