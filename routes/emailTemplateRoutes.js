const express = require('express');
const router = express.Router();

const emailTemplateController = require('../controllers/emailTemplateController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, emailTemplateController.addEmailTemplate);
router.get('/', verifyToken, emailTemplateController.getAllEmailTemplates);
router.put('/edit/:id', verifyToken, emailTemplateController.editEmailTemplate);
router.delete('/delete/:id', verifyToken, emailTemplateController.deleteEmailTemplate);
router.get('/:id', verifyToken, emailTemplateController.getEmailTemplateById);

module.exports = router;