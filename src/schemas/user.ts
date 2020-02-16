import {Document, Schema} from 'mongoose';
import mongoose = require("mongoose");

export interface UserInterface extends Document {
  chatId: string,
  userNextStatus: string,
  userCurrentStatus: string,
  chooseLocation: string,
  ejare: Number,
  rahn: Number,
  bedroom_count: Number,
  enter_phone_number: string,
};

export const userSchema = new Schema({
  chatId: {type: String, required: true},
  userNextStatus:  {type: String, required: false},
  userCurrentStatus: String,
  chooseLocation: String,
  ejare: Number,
  rahn: Number,
  bedroom_count: Number,
  enter_phone_number: {
    type: String,
    validate: {
        validator: function(v) {
            var re = /^\d{11}$/;
            return (v == null || v.trim().length < 1) || re.test(v)
        },
        message: 'Provided phone number is invalid.'
    }
  },
});

export default mongoose.model<UserInterface>('User', userSchema);