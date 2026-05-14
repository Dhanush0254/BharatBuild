const express = require('express');
const chatController = require('./chat.controller');
const authenticate = require('../../middleware/authenticate');

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

router.get('/', chatController.getUserChats);
router.post('/', chatController.getOrCreateChat);
router.get('/:id/messages', chatController.getChatMessages);
router.post('/:id/messages', chatController.sendMessage);
router.patch('/:id/read', chatController.markAsRead);

module.exports = router;
