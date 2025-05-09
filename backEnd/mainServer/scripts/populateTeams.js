import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from '../models/Team.js';

dotenv.config();

const LALIGA_TEAMS = [
    {
        name: 'Athletic Club',
        logo: 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Atlético Madrid',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Barcelona',
        logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Celta Vigo',
        logo: 'https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Getafe',
        logo: 'https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_CF_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Girona',
        logo: 'https://upload.wikimedia.org/wikipedia/en/9/90/For_article_Girona_FC.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Granada',
        logo: 'https://upload.wikimedia.org/wikipedia/en/d/d5/Granada_CF_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Las Palmas',
        logo: 'https://upload.wikimedia.org/wikipedia/en/4/4a/UD_Las_Palmas_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Mallorca',
        logo: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Rcd_mallorca.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Osasuna',
        logo: 'https://upload.wikimedia.org/wikipedia/en/8/88/Osasuna_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Rayo Vallecano',
        logo: 'https://upload.wikimedia.org/wikipedia/en/1/17/Rayo_Vallecano_logo.png',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Real Betis',
        logo: 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Real Madrid',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Real Sociedad',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Sevilla',
        logo: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Valencia',
        logo: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Villarreal',
        logo: 'https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Deportivo Alavés',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Deportivo_Alaves_logo_%282020%29.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Cádiz',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/58/C%C3%A1diz_CF_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    },
    {
        name: 'Almería',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/f0/UD_Almer%C3%ADa_logo.svg',
        country: 'Spain',
        league: 'La Liga'
    }
];

const populateTeams = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing teams
        await Team.deleteMany({});
        console.log('Cleared existing teams');

        // Insert new teams
        const result = await Team.insertMany(LALIGA_TEAMS);
        console.log(`Successfully inserted ${result.length} teams`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error populating teams:', error);
        process.exit(1);
    }
};

populateTeams(); 