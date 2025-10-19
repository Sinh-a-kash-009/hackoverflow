const mongoose=require('mongoose');

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["human", "animal"], required: true },
  symptoms: [String],
  diagnosis: String,
  prescription: String,
  date: { type: Date, default: Date.now },
  location: String,
});

const recordModel = mongoose.model('recordModel',recordSchema);
module.exports=recordModel;