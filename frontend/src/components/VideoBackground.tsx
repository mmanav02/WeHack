import React from 'react';
import { Box } from '@mui/material';

const VideoBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const videoSource = '/Background.mp4';

  return (
    <>
      {/* Fixed full-screen video background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -2,
          }}
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>

      {/* Optional dark overlay for text readability */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* Content wrapper (scrollable) */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </>
  );
};

export default VideoBackground;
