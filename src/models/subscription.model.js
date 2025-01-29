import mongoose from "mongoose";
const subcriptionSchema = new mongoose.Schema({
  subscriber:{
    tpye: Schema.Types.ObjectId,
    ref:"User"
  },
  channel:{
    tpye: Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subcriptionSchema);