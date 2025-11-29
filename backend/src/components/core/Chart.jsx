import React, { lazy, Suspense } from 'react';
import { styled } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';

// 惰性載入 ApexChart
const LazyChart = lazy(() => import('react-apexcharts'));

// 簡單的 Chart Wrapper
export function Chart({ type, series, options, sx }) {
  return (
    <ChartRoot sx={sx}>
      <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={30} />
          </Box>
      }>
        <LazyChart type={type} series={series} options={options} width="100%" height="100%" />
      </Suspense>
    </ChartRoot>
  );
}

const ChartRoot = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%', 
  flexShrink: 0,
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 1.5,
}));