import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    stats: {
        goals: {
            type: Number,
            default: 0
        },
        assists: {
            type: Number,
            default: 0
        },
        appearances: {
            type: Number,
            default: 0
        },
        yellowCards: {
            type: Number,
            default: 0
        },
        redCards: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

const Player = mongoose.model('Player', playerSchema);

export default Player; 