import React, { useEffect, useState } from 'react';
import { hackathonAPI } from '../services/api';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';

interface Hackathon {
    id: number;
    title: string;
    description: string;
    date: string;
}

interface HackathonListProps {
    limit?: number; // Optional limit prop
}

const HackathonList: React.FC<HackathonListProps> = ({ limit }) => {
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const response = await hackathonAPI.getAll();
                // Apply limit if provided
                setHackathons(limit ? response.data.slice(0, limit) : response.data);
            } catch (err) {
                setError('Failed to fetch hackathons');
                console.error('Error fetching hackathons:', err);
            }
        };

        fetchHackathons();
    }, [limit]); // Depend on limit so it refetches if limit changes

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (hackathons.length === 0) {
        return <Typography>No hackathons available.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Hackathons
            </Typography>
            <Grid container spacing={3}>
                {hackathons.map((hackathon) => (
                    <Grid xs={12} sm={6} md={4} key={hackathon.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    {hackathon.title}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    {new Date(hackathon.date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">
                                    {hackathon.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default HackathonList; 