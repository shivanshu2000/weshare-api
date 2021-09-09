import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: {},
      required: [true, 'content is a required field'],
    },

    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },

    image: {
      url: String,
      public_id: String,
    },
    likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    comments: [
      {
        comment: String,
        created: { type: Date, default: Date.now },
        postedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', PostSchema);

export default Post;
