import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    competition: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['SCHEDULED', 'LIVE', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELLED']
    },
    minute: {
        type: Number,
        default: 0
    },
    homeTeam: {
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            default: '/placeholder-team-logo.png'
        }
    },
    awayTeam: {
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            default: '/placeholder-team-logo.png'
        }
    },
    score: {
        homeTeam: {
            type: Number,
            default: 0
        },
        awayTeam: {
            type: Number,
            default: 0
        }
    },
    matchday: {
        type: Number,
        required: true
    },
    season: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create a compound index for unique matches
matchSchema.index({ 
    'homeTeam.name': 1, 
    'awayTeam.name': 1, 
    'date': 1 
}, { unique: true });

const Match = mongoose.model('Match', matchSchema);

export default Match; 