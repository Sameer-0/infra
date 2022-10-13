const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const todos = require('../../controllers/management/todos');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// TODOS ROUTER
router.get('/todos', todos.getPage)
router.post('/todos/create', validate('createTodos'), todos.createTodos)
router.post('/todos/viewsingle', todos.viewDetails)
router.post('/todos/single', validate('updateTodos'), todos.updateTodosById)
router.post('/todos/single', todos.getTodosById)
router.post('/todos/delete', validate('delete'), todos.deleteTodosById)
router.post('/todos/search', validate('search'), todos.search)

module.exports = router;