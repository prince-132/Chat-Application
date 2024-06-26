const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { sendMessage, allMessage } = require('../controllers/messageControllers')

const router = express.Router()

router.post('/', protect, sendMessage)
router.get('/:chatId', protect, allMessage)

module.exports = router;