const router = require("express").Router();
const {
    isLoggedIn,
    check,
    checkPermission
} = require("../../middlewares/user")

function Management(app) {

    const building = require("../../routers/management/building")
    const campus = require("../../routers/management/campus")
    const organization = require("../../routers/management/organization")
    const dashboard = require('../../routers/management/dashboard')
    const adminDashboard = require('../../routers/admin/dashboard')
    const slug = require('../../routers/management/slug')
    const academic = require('../../routers/management/academic')
    const slotInterval = require('../../routers/management/slotInterval')
    const room = require('../../routers/management/room')
    const booking = require('../../routers/management/booking')
    const todos = require('../../routers/management/todos')
    const divisions = require('../../routers/management/divisions')
    const program = require('../../routers/management/program')
    const holidays = require('../../routers/management/holidays')
    const faculties = require('../../routers/management/faculties')

    app.use('/management/', isLoggedIn, checkPermission, building)
    app.use('/management/', isLoggedIn, checkPermission, campus)
    app.use('/management/', isLoggedIn, checkPermission, organization)
    app.use('/management/', isLoggedIn, checkPermission, dashboard)
    app.use('/management/', isLoggedIn, checkPermission, slug)
    app.use('/management/', isLoggedIn, checkPermission, academic)
    app.use('/management/', isLoggedIn, checkPermission, slotInterval)
    app.use('/management/', isLoggedIn, checkPermission, room)
    app.use('/management/', isLoggedIn, checkPermission, booking)
    app.use('/management/', isLoggedIn, checkPermission, todos)
    app.use('/management/', isLoggedIn, checkPermission, divisions)
    app.use('/management/', isLoggedIn, checkPermission, program)
    app.use('/management/', isLoggedIn, checkPermission, holidays)
    app.use('/management/', isLoggedIn, checkPermission, faculties)
}
module.exports = Management