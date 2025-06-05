import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper,
  Grid,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';

const HackathonRegistrationPage = () => {
  const [teamMembers, setTeamMembers] = useState(['']);
  const [formData, setFormData] = useState({
    teamName: '',
    projectName: '',
    projectDescription: '',
    projectCategory: '',
    githubLink: '',
    demoLink: '',
    technologies: [] as string[],
  });
  const [newTechnology, setNewTechnology] = useState('');
  const [errors, setErrors] = useState({
    teamName: '',
    projectName: '',
    projectDescription: '',
    projectCategory: '',
    teamMembers: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (name) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
     setFormData(prev => ({
      ...prev,
      [name]: value
    }));
     if (name) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const handleTeamMemberChange = (index: number, value: string) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index] = value;
    setTeamMembers(newTeamMembers);
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, '']);
  };

  const removeTeamMember = (index: number) => {
    const newTeamMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(newTeamMembers);
  };

  const handleAddTechnology = () => {
    if (newTechnology && !formData.technologies.includes(newTechnology)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology]
      }));
      setNewTechnology('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
      isValid = false;
    }

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
      isValid = false;
    }

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
      isValid = false;
    }

    if (!formData.projectCategory) {
      newErrors.projectCategory = 'Project category is required';
      isValid = false;
    }

    if (teamMembers.some(member => !member.trim())) {
      newErrors.teamMembers = 'All team members must be filled';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Implement submission logic
      console.log('Form submitted:', { ...formData, teamMembers });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          backgroundColor: 'background.paper',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Register for Hackathon
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={4}> {/* Main Grid Container */}

            {/* Team Information */}
            <Grid xs={12}> 
              <Typography variant="h6" gutterBottom>
                Team Information
              </Typography>
              <Grid container spacing={2}> {/* Nested Grid for Team */}
                <Grid xs={12}> 
                  <TextField
                    required
                    fullWidth
                    label="Team Name"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    error={!!errors.teamName}
                    helperText={errors.teamName}
                  />
                </Grid>
                <Grid xs={12}> 
                  <Typography variant="subtitle1" gutterBottom>
                    Team Members
                  </Typography>
                  {teamMembers.map((member, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        required
                        fullWidth
                        label={`Team Member ${index + 1}`}
                        value={member}
                        onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                        error={!!errors.teamMembers}
                        helperText={index === 0 ? errors.teamMembers : ''}
                      />
                      {index > 0 && (
                        <IconButton 
                          onClick={() => removeTeamMember(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addTeamMember}
                    sx={{ mt: 1 }}
                  >
                    Add Team Member
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Project Information */}
            <Grid xs={12}> 
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <Grid container spacing={2}> {/* Nested Grid for Project */}
                <Grid xs={12}> 
                  <TextField
                    required
                    fullWidth
                    label="Project Name"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    error={!!errors.projectName}
                    helperText={errors.projectName}
                  />
                </Grid>
                <Grid xs={12}> 
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Project Description"
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleChange}
                    error={!!errors.projectDescription}
                    helperText={errors.projectDescription}
                  />
                </Grid>
                <Grid xs={12} sm={6}> {/* Split category and links */} 
                  <FormControl fullWidth required error={!!errors.projectCategory}>
                    <InputLabel>Project Category</InputLabel>
                    <Select
                      name="projectCategory"
                      value={formData.projectCategory}
                      onChange={handleSelectChange}
                      label="Project Category"
                    >
                      <MenuItem value="web">Web Development</MenuItem>
                      <MenuItem value="mobile">Mobile Development</MenuItem>
                      <MenuItem value="ai">AI/ML</MenuItem>
                      <MenuItem value="blockchain">Blockchain</MenuItem>
                      <MenuItem value="iot">IoT</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                 <Grid xs={12} sm={6}> {/* GitHub Link */} 
                  <TextField
                    fullWidth
                    label="GitHub Repository Link"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid xs={12}> {/* Demo Link */} 
                  <TextField
                    fullWidth
                    label="Demo Video Link"
                    name="demoLink"
                    value={formData.demoLink}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid xs={12}> 
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Technologies Used
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        label="Add Technology"
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTechnology();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddTechnology}
                        sx={{ minWidth: '100px' }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.technologies.map((tech) => (
                        <Chip
                          key={tech}
                          label={tech}
                          onDelete={() => handleRemoveTechnology(tech)}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid xs={12}> {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  },
                }}
              >
                Submit Registration
              </Button>
            </Grid>
          </Grid> {/* End Main Grid Container */}
        </Box>
      </Paper>
    </Container>
  );
};

export default HackathonRegistrationPage; 