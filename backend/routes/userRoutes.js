const express = require('express')
const { registerUser, authUser, allUsers, changeStatus, getStatus } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');


const router = express.Router()

router.post('/',  registerUser);
router.get('/', protect, allUsers);
router.post('/login', authUser)
router.post('/status',  changeStatus);
router.get('/status', getStatus);


module.exports = router;