import { createTheme } from '@mui/material';

export const theme = createTheme({
    components: {
        MuiSlider: {
            styleOverrides: {
                rail: {
                    color: 'gray',
                },
                thumb: {
                    color: 'red',
                },
                track: {
                    color: 'red',
                },
            },
        },
    },
});
