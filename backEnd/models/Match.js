import mongoose from 'mongoose';

const matchEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['goal', 'yellowCard', 'redCard', 'substitution', 'penalty', 'kickoff', 'halftime', 'fulltime'],
    required: true
  },
  minute: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  team: {
    type: String,
    enum: ['home', 'away'],
    required: true
  },
  player: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const matchSchema = new mongoose.Schema({
  competition: {
    type: String,
    required: true
  },
  season: {
    type: String,
    required: true
  },
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  homeScore: {
    type: Number,
    default: 0,
    min: 0
  },
  awayScore: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELED'],
    default: 'SCHEDULED'
  },
  minute: {
    type: Number,
    default: 0,
    min: 0,
    max: 120
  },
  startTime: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    default: ''
  },
  referee: {
    type: String,
    default: ''
  },
  events: [matchEventSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
matchSchema.index({ status: 1, startTime: -1 });
matchSchema.index({ homeTeam: 1, awayTeam: 1, startTime: 1 });

// Virtual for full match name
matchSchema.virtual('fullName').get(function() {
  return `${this.homeTeam.name || 'Home'} vs ${this.awayTeam.name || 'Away'}`;
});

// Make sure we don't try to redefine the model
const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

export default Match; 