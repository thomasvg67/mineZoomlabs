const Alert = require('../models/Alert');
const Contact = require('../models/Contact');

function getISTDayRange() {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const istNow = new Date(now.getTime() + istOffset);

  const startOfToday = new Date(istNow);
  startOfToday.setHours(0, 0, 0, 0);
  startOfToday.setTime(startOfToday.getTime() - istOffset);

  const endOfToday = new Date(istNow);
  endOfToday.setHours(23, 59, 59, 999);
  endOfToday.setTime(endOfToday.getTime() - istOffset);

  return { startOfToday, endOfToday };
}

exports.getTodayAlerts = async (req, res) => {
  try {
    const role = req.user?.role;
    const uid = req.user?.uId;

    const { startOfToday, endOfToday } = getISTDayRange();


    let query = {
      alertTime: { $gte: startOfToday, $lte: endOfToday },
      status: 0,
      dltSts: 0,
      assignedTo: uid
    };

    const alerts = await Alert.find(query).populate('contactId');
    res.json(alerts);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.editAlert = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user?.uId || 'system';

    const updated = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updtOn: new Date(),
        updtBy: userId,
        updtIp: ip
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.snoozeOneDay = async (req, res) => {
  try {
    const { id } = req.params;

    // first get the record
    const alertRecord = await Alert.findById(id);
    if (!alertRecord) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // remove from alrTbl
    await Alert.findByIdAndDelete(id);

    // update contact for next day
    const contactId = alertRecord.contactId;
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    await Contact.findByIdAndUpdate(contactId, {
      nxtAlrt: nextDay
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
