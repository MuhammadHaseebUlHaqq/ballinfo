import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    league: {
        type: String,
        required: true
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    stats: {
        wins: {
            type: Number,
            default: 0
        },
        draws: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        goalsFor: {
            type: Number,
            default: 0
        },
        goalsAgainst: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

export default Team; 