const express = require('express');
const router = express.Router();
const { getFuelLogs, createFuelLog, updateFuelLog, deleteFuelLog } = require('../controllers/fuelLog.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getFuelLogs);
router.post('/', createFuelLog);
router.put('/:id', updateFuelLog);
router.delete('/:id', deleteFuelLog);

module.exports = router;
