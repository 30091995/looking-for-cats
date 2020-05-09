const mongoose = require("mongoose");
const Schema   = mongoose.Schema;


const catSchema = {
    name: String,
    description : String,
    imgUrl: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
}

const Cat = mongoose.model('Cat', catSchema)
module.exports = Cat