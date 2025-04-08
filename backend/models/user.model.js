import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  attempts: {
    type:[{type: mongoose.Schema.Types.ObjectId, ref:"Question"}],
    default: [],
  },
  plantowatch: [{
    type:String,
    default:[]
  }],
  score:{
    type:Number,
    default: 0
  }
},{timestamps: true});

userSchema.methods.verifyPassword = function(password) {
  return this.password === password;
};

const User = mongoose.model('User', userSchema);

export {User}