import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Hackathons', path: '/hackathons' },
    { label: 'About', path: '/about' },
  ];

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            component={RouterLink} 
            to={item.path} 
            key={item.label}
            onClick={handleDrawerToggle}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
              },
            }}
          >
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                fontWeight: 600,
                color: 'text.primary',
              }}
            />
          </ListItem>
        ))}
        <ListItem sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            component={RouterLink}
            to="/login"
            sx={{ mr: 1 }}
          >
            Login
          </Button>
        </ListItem>
        <ListItem>
          <Button
            fullWidth
            variant="contained"
            component={RouterLink}
            to="/register"
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              },
            }}
          >
            Sign Up
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ 
        maxWidth: 'lg', 
        width: '100%', 
        margin: '0 auto',
        py: 1,
      }}>
        <Typography 
          variant="h5" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            '&:hover': {
              color: 'primary.dark',
            },
          }}
        >
          WeHack
        </Typography>

        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                component={RouterLink}
                to={item.path}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{ ml: 2 }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              component={RouterLink}
              to="/register"
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 