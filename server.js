const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { initSocket } = require('./middleware/socket');
const createDailyAlerts = require("./middleware/crnJbAlrt");

dotenv.config();

const app = express();

const server = http.createServer(app);
initSocket(server);
// app.use(cors({
//   origin: 'https://personalr.zoomlabs.in', // or use '*' for testing (not for production)
//   credentials: true // if using cookies or auth headers
// }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads/pdfs', express.static(path.join(__dirname, 'uploads/pdfs')));
app.use('/uploads/audio', express.static(path.join(__dirname, 'uploads/audio')));


// const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {console.log('MongoDB connected');createDailyAlerts();
})
  .catch(err => console.error('MongoDB connection error:', err));
  
// Routes
app.use('/api/notes', require('./routes/notes'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/feedbacks', require('./routes/FdBack'));
app.use('/api/messages', require('./routes/MessageRoutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/scrum-board', require('./routes/scrumBoardRoutes'));
app.use('/api/todolist', require('./routes/todolistRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/names', require('./routes/nameRoutes'));
app.use('/api/medical-stats', require('./routes/medicalStatRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/dictionary', require('./routes/dictionaryRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/diary', require('./routes/diaryRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/business', require('./routes/businessIdeaRoutes'));
app.use('/api/mission', require('./routes/missionRoutes'));
app.use('/api/vission', require('./routes/vissionRoutes'));
app.use('/api/calendar', require('./routes/calendarEventRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/shares', require('./routes/shareRoutes'));
app.use('/api/mutualFund', require('./routes/mutualFundRoutes'));
app.use('/api/memories', require('./routes/memoriesRoutes'));
app.use('/api/timeline', require('./routes/timelineRoutes'));
app.use('/api/budgetYearly', require('./routes/budgetYearlyRoutes'));
app.use('/api/budgetHYearly', require('./routes/budgetHYearlyRoutes'));
app.use('/api/fund', require('./routes/fundRoutes'));
app.use('/api/financialOL', require('./routes/financialOLRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/budgetQtr', require('./routes/budgetQtrRoutes'));
app.use('/api/plan', require('./routes/planRoutes'));
app.use('/api/planQtr', require('./routes/planQtrRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));


// Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
