const {
    isLoggedIn,
    check,
    checkPermission
} = require("../../middlewares/user");

function AdminRoute(app) {
    const adminDashboard = require('../../routers/admin/dashboard');
    const days = require('../../routers/admin/days');
    const program = require('../../routers/admin/program');
    const sessions = require('../../routers/admin/sessions');
    const events = require('../../routers/admin/events');
    const holidays = require('../../routers/admin/holidays');
    const courseworkload = require('../../routers/admin/courseworkload');
    const divisions = require('../../routers/admin/divisions');
    const roomtransacton = require('./rooms');
    const faculty = require('../../routers/admin/faculty');
    const weeklyConstraint = require('../../routers/admin/weeklyConstraint');

    const timeTableSimulation = require('../../routers/admin/timeTableSimulation');
    const schooltimings = require('../../routers/admin/schooltimings');
    const reschedule = require('../../routers/admin/reschedule');
    const timesheet = require('../../routers/admin/timesheet');
    const freezetimetable = require('../../routers/admin/freezetimetable');
    const mis = require('../../routers/admin/mis')

    app.use('/admin/', isLoggedIn, checkPermission, adminDashboard);
    app.use('/admin/', isLoggedIn, checkPermission, days);
    app.use('/admin/', isLoggedIn, checkPermission, program);
    app.use('/admin/', isLoggedIn, checkPermission, sessions);
    app.use('/admin/', isLoggedIn, checkPermission, events);
    app.use('/admin/', isLoggedIn, checkPermission, holidays);
    app.use('/admin/', isLoggedIn, checkPermission, courseworkload);
    app.use('/admin/', isLoggedIn, checkPermission, divisions);
    app.use('/admin/', isLoggedIn, checkPermission, roomtransacton);
    app.use('/admin/', isLoggedIn, checkPermission, faculty);
    app.use('/admin/', isLoggedIn, checkPermission, weeklyConstraint);
    app.use('/admin/', isLoggedIn, checkPermission, timeTableSimulation);
    app.use('/admin/', isLoggedIn, checkPermission, schooltimings);
    app.use('/admin/', isLoggedIn, checkPermission, reschedule);
    app.use('/admin/', isLoggedIn, checkPermission, timesheet);
    app.use('/admin/', isLoggedIn, checkPermission, freezetimetable);
    app.use('/admin/', isLoggedIn, checkPermission, mis)
}

module.exports = AdminRoute;