import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true
    },
    tla: {
        type: String,
        required: true,
        maxLength: 3
    },
    crest: {
        type: String,
        required: true
    },
    founded: {
        type: Number,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    clubColors: {
        type: String,
        required: true
    },
    coach: {
        name: {
            type: String,
            required: true
        },
        nationality: {
            type: String,
            required: true
        }
    },
    squad: [{
        name: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        nationality: {
            type: String,
            required: true
        },
        shirtNumber: {
            type: Number
        }
    }]
});

// Fix the model overwrite error by checking if it's already defined
const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export default Team; 