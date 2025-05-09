import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTeams } from '../services/teamService';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Paper
} from '@mui/material';
import '../styles/Teams.css';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getAllTeams();
                setTeams(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch teams. Please try again later.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress style={{ color: '#ff2d55' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    return (
        <div className="teams-page">
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                color: '#666',
                                '&.Mui-selected': {
                                    color: '#ff2d55'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#ff2d55'
                            }
                        }}
                    >
                        <Tab label="ALL TEAMS" />
                        <Tab label="LA LIGA" />
                        <Tab label="COPA DEL REY" />
                        <Tab label="SUPER COPA" />
                    </Tabs>
                </Box>

                <Grid container spacing={3}>
                    {teams.map((team) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={team._id}>
                            <Card 
                                component={Link} 
                                to={`/teams/${team._id}`}
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    textDecoration: 'none',
                                    backgroundColor: '#fff',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{
                                        height: 160,
                                        objectFit: 'contain',
                                        p: 3,
                                        backgroundColor: '#f8f9fa'
                                    }}
                                    image={team.crest}
                                    alt={`${team.name} crest`}
                                />
                                <CardContent sx={{ 
                                    flexGrow: 1,
                                    backgroundColor: '#fff',
                                    borderTop: '1px solid #eee'
                                }}>
                                    <Typography 
                                        gutterBottom 
                                        variant="h6" 
                                        component="h2"
                                        sx={{ 
                                            color: '#333',
                                            fontWeight: 600,
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        {team.name}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: '#666', mb: 1 }}
                                    >
                                        Founded: {team.founded}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: '#666', mb: 1 }}
                                    >
                                        Venue: {team.venue}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: '#666' }}
                                    >
                                        Coach: {team.coach.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    );
};

export default Teams; 