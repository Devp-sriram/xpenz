import connectDb from '../config/db.ts'

async function init() {
    try{
        await connectDb()
    } 
}
