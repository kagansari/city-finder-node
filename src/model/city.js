import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
  name: {
    type: String,
    index: 'text'
  },
  slug: {
    type: String,
    index: 'text'
  },
  country: String
});

const SmallCity = mongoose.model('SmallCity', schema);
const LargeCity = mongoose.model('LargeCity', schema);

export {SmallCity, LargeCity};
