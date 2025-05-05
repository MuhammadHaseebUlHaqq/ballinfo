import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
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
    dateTime: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    competition: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed'],
        default: 'upcoming'
    },
    score: {
        homeScore: {
            type: Number,
            default: 0
        },
        awayScore: {
            type: Number,
            default: 0
        }
    },
    highlights: {
        type: String
    },
    events: [{
        minute: Number,
        type: {
            type: String,
            enum: ['goal', 'yellow-card', 'red-card', 'substitution', 'penalty']
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        },
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
        },
        description: String
    }]
}, {
    timestamps: true
});

const Match = mongoose.model('Match', matchSchema);

export default Match; 