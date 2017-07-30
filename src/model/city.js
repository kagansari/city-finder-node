import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
  name: {
    type: String,
    index: 'text'
  },
  country: String
});

export default mongoose.model('City', schema);
