const Cron = require('croner')

const j = Cron('* * * * * *')
console.log(j.msToNext())
