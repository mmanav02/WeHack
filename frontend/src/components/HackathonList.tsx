import React, { useEffect, useState } from 'react';
import { hackathonAPI } from '../services/api';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createHackathonCollection } from '../utils/UICollectionFactory';
import type { HackathonCollection, HackathonUIItem } from '../utils/UICollectionFactory';

interface Hackathon {
    id: number;
    title: string;
    description: string;
    date: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    maxTeamSize?: number;
    registrationDeadline?: string;
}

interface HackathonListProps {
    limit?: number;
    showActionsOnly?: boolean;
}

const HackathonList: React.FC<HackathonListProps> = ({ limit, showActionsOnly = true }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Using Factory pattern for collection management
    const [hackathonCollection, setHackathonCollection] = useState<HackathonCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);

    useEffect(() => {
        fetchHackathons();
    }, [user]);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            const response = await hackathonAPI.getAll();
            
            // Use Factory pattern to create UI-ready collection
            const collection = createHackathonCollection(response.data, user?.id);
            
            // Apply limit if specified, but prioritize hackathons with proper titles
            if (limit && collection.count > limit) {
                // Check original data to separate real titles from those needing fallbacks
                const realTitles = response.data.filter((hackathon: any) => 
                    hackathon.title && 
                    hackathon.title.trim() !== '' && 
                    !hackathon.title.match(/^Hackathon \d+$/)
                );
                const needsFallback = response.data.filter((hackathon: any) => 
                    !hackathon.title || 
                    hackathon.title.trim() === '' || 
                    hackathon.title.match(/^Hackathon \d+$/)
                );
                
                // Prioritize real titles, then fallback titles if needed
                const prioritizedData = [
                    ...realTitles.slice(0, limit),
                    ...needsFallback.slice(0, Math.max(0, limit - realTitles.length))
                ].slice(0, limit);
                
                console.log(`🏠 Home page prioritizing: ${realTitles.length} real titles, ${needsFallback.length} fallbacks`);
                console.log(`🏠 Showing: ${prioritizedData.map((h: any) => h.title || 'undefined').join(', ')}`);
                
                // Create collection from prioritized data
                const prioritizedCollection = createHackathonCollection(prioritizedData, user?.id);
                setHackathonCollection(prioritizedCollection);
            } else {
                setHackathonCollection(collection);
            }
            
            console.log(`📊 Loaded ${collection.count} hackathons using Factory pattern`);
        } catch (err: any) {
            console.error('Failed to fetch hackathons:', err);
            setError('Failed to load hackathons. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (hackathonId: number) => {
        navigate(`/hackathons/${hackathonId}`);
    };

    const handleRegisterClick = (hackathonId: number) => {
        if (user) {
            navigate(`/hackathons/${hackathonId}/register`);
        } else {
            setSelectedHackathonId(hackathonId);
            setShowAuthDialog(true);
        }
    };

    const handleAuthDialogClose = () => {
        setShowAuthDialog(false);
        setSelectedHackathonId(null);
    };

    const handleLoginRedirect = () => {
        navigate('/login');
        handleAuthDialogClose();
    };

    // Factory pattern method for status color - moved to UICollectionFactory
    const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' => {
        switch (status) {
            case 'Published':
                return 'success';
            case 'Judging':
                return 'warning';
            case 'Completed':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Loading hackathons...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={fetchHackathons} 
                        sx={{ mt: 2 }}
                    >
                        Retry
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!hackathonCollection || hackathonCollection.count === 0) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                        No hackathons available at the moment.
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        Check back later for upcoming events!
                    </Typography>
                </Box>
            </Container>
        );
    }

    // Use iterator pattern from collection factory
    const iterator = hackathonCollection.createIterator();
    const hackathonItems: HackathonUIItem[] = [];
    while (iterator.hasNext()) {
        const item = iterator.next();
        if (item) hackathonItems.push(item);
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Hackathons
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {hackathonItems.map((hackathon) => (
                    <Card 
                        key={hackathon.id}
                        sx={{ 
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', flex: 1 }}>
                                    {hackathon.displayName}
                                </Typography>
                                <Chip 
                                    label={hackathon.status} 
                                    color={hackathon.metadata?.statusColor as any || 'default'}
                                    size="small"
                                    sx={{ ml: 2 }}
                                />
                            </Box>
                            
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                {hackathon.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                {hackathon.startDate && (
                                    <Typography variant="body2" color="textSecondary">
                                        📅 <strong>Start:</strong> {formatDate(hackathon.startDate)}
                                    </Typography>
                                )}
                                {hackathon.endDate && (
                                    <Typography variant="body2" color="textSecondary">
                                        🏁 <strong>End:</strong> {formatDate(hackathon.endDate)}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="textSecondary">
                                    👥 <strong>Participants:</strong> {hackathon.participantsCount || 0}
                                </Typography>
                            </Box>
                            
                            {/* Factory pattern metadata usage */}
                            {hackathon.metadata?.isOrganizer && (
                                <Chip 
                                    label="You are the organizer" 
                                    size="small" 
                                    color="success" 
                                    sx={{ mb: 2 }}
                                />
                            )}
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button 
                                    variant="contained" 
                                    onClick={() => handleViewDetails(hackathon.id)}
                                    sx={{ px: 3 }}
                                >
                                    View Details
                                </Button>
                                {showActionsOnly && hackathon.metadata?.canJoin && (
                                    <>
                                        <Button 
                                            variant="outlined" 
                                            onClick={() => handleRegisterClick(hackathon.id)}
                                        >
                                            {user ? 'Register' : 'Register (Login Required)'}
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            color="secondary"
                                            onClick={() => {
                                                if (user) {
                                                    navigate(`/hackathons/${hackathon.id}/apply-judge`);
                                                } else {
                                                    setSelectedHackathonId(hackathon.id);
                                                    setShowAuthDialog(true);
                                                }
                                            }}
                                            sx={{ px: 2 }}
                                        >
                                            Apply as Judge
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Authentication Required Dialog */}
            <Dialog open={showAuthDialog} onClose={handleAuthDialogClose}>
                <DialogTitle>Authentication Required</DialogTitle>
                <DialogContent>
                    <Typography>
                        You need to be logged in to register for hackathons or apply as a judge.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAuthDialogClose}>Cancel</Button>
                    <Button onClick={handleLoginRedirect} variant="contained">
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default HackathonList; 