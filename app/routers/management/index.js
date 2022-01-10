const router = require('express').Router();
const {
    check,
    validationResult
} = require('express-validator');
const buildingcontroller = require('../../controllers/management/building');
const campuscontroller = require('../../controllers/management/campus');
const orgcontroller = require('../../controllers/management/organization');


router.get('/academic-year', buildingcontroller.getIAcadYearPage);
router.post('/academic-year', buildingcontroller.updateAcadYear)

// BUILDING ROUTER
router.get('/building', buildingcontroller.getBuildingPage)
router.post('/building/add', buildingcontroller.getAdd)
router.post('/building/fetch-single', buildingcontroller.getSingleBuilding)
router.post('/building/update', buildingcontroller.updateBuilding)

// CAMPUS ROUTER
router.get('/campus',campuscontroller.getCampusPage)
router.post('/campus/add',campuscontroller.createCampus)
router.post('/campus/fetch-single',campuscontroller.getCampusById)
router.post('/campus/update',campuscontroller.updateCampus)
router.post('/campus/delete-single',campuscontroller.deleteById)

// ORGANIZATION ROUTER
router.get('/organization',orgcontroller.getPage)
router.post('/organization/add',orgcontroller.createOrg)
router.post('/organization/fetch-single',orgcontroller.getOrgById)
router.post('/organization/update-single',orgcontroller.updateOrgById)
router.post('/organization/delete-single',orgcontroller.deleteById)
module.exports = router;