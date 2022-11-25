const express = require('express')
const data = require('./data')
const seed = require('./data/seed')
const cors = require('cors')
const dayjs = require('dayjs')
const CustomParseFormatPlugin = require('dayjs/plugin/customParseFormat')
const TimezonePlugin = require('dayjs/plugin/timezone')

dayjs.extend(CustomParseFormatPlugin)
dayjs.extend(TimezonePlugin)

const dotenv = require('dotenv')
dotenv.config()

const app = express()

app.use(cors())

const PORT = Number.parseInt(process.env.PORT)
async function main() {
    await data.connect(process.env.MONGODB_URL)
    await seed.initialize()
    
    app.use(express.json())
    
    require('./controllers/account')(app)
    require('./controllers/group')(app)
    require('./controllers/announcement')(app)
    require('./controllers/schedule')(app)
    require('./controllers/assignment')(app)
    require('./controllers/submission')(app)
    require('./controllers/comment')(app)
    require('./controllers/process')(app)
    
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    })
}

main()
