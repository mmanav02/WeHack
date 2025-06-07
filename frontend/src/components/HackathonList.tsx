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
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);
    
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                setLoading(true);
                const response = await hackathonAPI.getAll();
                const hackathonData = limit ? response.data.slice(0, limit) : response.data;
                setHackathons(hackathonData);
            } catch (err) {
                setError('Failed to fetch hackathons');
                console.error('Error fetching hackathons:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHackathons();
    }, [limit]);

    const handleViewDetails = (hackathonId: number) => {
        navigate(`/hackathons/${hackathonId}`);
    };

    const handleRegisterClick = (hackathonId: number) => {
        if (!user) {
            setSelectedHackathonId(hackathonId);
            setShowAuthDialog(true);
        } else {
            navigate(`/hackathons/${hackathonId}/register`);
        }
    };

    const handleLoginRedirect = () => {
        setShowAuthDialog(false);
        navigate('/login', { 
            state: { returnTo: `/hackathons/${selectedHackathonId}/register` } 
        });
    };

    const handleSignUpRedirect = () => {
        setShowAuthDialog(false);
        navigate('/register', { 
            state: { returnTo: `/hackathons/${selectedHackathonId}/register` } 
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'open':
                return 'success';
            case 'upcoming':
                return 'info';
            case 'completed':
                return 'default';
            case 'closed':
                return 'error';
            default:
                return 'primary';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading hackathons...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="error" variant="h6">
                        {error}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => window.location.reload()}
                        sx={{ mt: 2 }}
                    >
                        Try Again
                    </Button>
                </Box>
            </Container>
        );
    }

    if (hackathons.length === 0) {
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

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Hackathons
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {hackathons.map((hackathon) => (
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
                                    {hackathon.title}
                                </Typography>
                                {hackathon.status && (
                                    <Chip 
                                        label={hackathon.status} 
                                        color={getStatusColor(hackathon.status)}
                                        size="small"
                                        sx={{ ml: 2 }}
                                    />
                                )}
                            </Box>
                            
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                {hackathon.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    📅 <strong>Date:</strong> {formatDate(hackathon.date)}
                                </Typography>
                                {hackathon.maxTeamSize && (
                                    <Typography variant="body2" color="textSecondary">
                                        👥 <strong>Max Team Size:</strong> {hackathon.maxTeamSize}
                                    </Typography>
                                )}
                                {hackathon.registrationDeadline && (
                                    <Typography variant="body2" color="textSecondary">
                                        ⏰ <strong>Registration Ends:</strong> {formatDate(hackathon.registrationDeadline)}
                                    </Typography>
                                )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button 
                                    variant="contained" 
                                    onClick={() => handleViewDetails(hackathon.id)}
                                    sx={{ px: 3 }}
                                >
                                    View Details
                                </Button>
                                {showActionsOnly && (
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

            {/* Authentication Dialog */}
            <Dialog 
                open={showAuthDialog} 
                onClose={() => setShowAuthDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        🔐 Authentication Required
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        You need to be logged in to register for hackathons.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Please sign in to your account or create a new one to join this hackathon and start building amazing projects!
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleLoginRedirect}
                        sx={{ px: 3 }}
                    >
                        Login
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleSignUpRedirect}
                        sx={{ px: 3 }}
                    >
                        Create Account
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => setShowAuthDialog(false)}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default HackathonList; 