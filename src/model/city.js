import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
  name: String,
  country: String
});

export default mongoose.model('City', schema);
