import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: false,
    default: 'Unknown'
  },
  publishedAt: {
    type: Date,
    required: true
  },
  source: {
    id: String,
    name: String
  },
  imageUrl: {
    type: String,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  category: {
    type: String,
    enum: ['transfer', 'match_report', 'injury', 'preview', 'general'],
    default: 'general'
  },
  tags: [String],
  relatedTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
NewsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const News = mongoose.model('News', NewsSchema);

export default News; 