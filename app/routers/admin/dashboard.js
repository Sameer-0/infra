const router = require('express').Router();

const dashboard = require('../../controllers/admin/dashboard');

router.get('/dashboard', dashboard.getDashboard); 
router.get('/dashboard/stepform', dashboard.dashboardStepForm)

module.exports = router;