const router = require('express').Router();
const index =  require('../../controllers/admin/schooltimings/index')
const type =  require('../../controllers/admin/schooltimings/type')
const validate = require('../../middlewares/validate')
//INDEX
router.get('/schooltiming', index.getPage)
router.post('/schooltiming/create',  index.create) 
router.post('/schooltiming/search', index.search)
router.post('/schooltiming/pagination', index.pagination)
router.post('/schooltiming/update',  index.update) 
router.post('/schooltiming/delete',  index.delete) 
//TYPES 
router.get('/schooltiming/types', type.getPage)
router.post('/schooltiming/types/findone', type.findOne)
router.post('/schooltiming/types', type.create)
router.post('/schooltiming/types/update', type.update) 
router.post('/schooltiming/types/delete', type.delete)
 
module.exports = router; 