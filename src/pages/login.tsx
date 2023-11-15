// pages/login.tsx
import React, { useState } from 'react';

import { TextField, Button, Container, Grid, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');

        const result = await signIn('credentials', {
            password,
            redirect: false,
            username,
        });

        if (result?.error) {
            setErrorMessage(result.error);
        } else {
            router.push('/TreePage');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <form onSubmit={handleLogin}>
                <TextField
                    autoComplete="username"
                    autoFocus
                    fullWidth
                    label="Username"
                    margin="normal"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    value={username}
                    variant="outlined"
                />
                <TextField
                    autoComplete="current-password"
                    fullWidth
                    label="Password"
                    margin="normal"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    value={password}
                    variant="outlined"
                />
                <Button
                    color="primary"
                    fullWidth
                    type="submit"
                    variant="contained"
                >
                Sign In
                </Button>
                {errorMessage && <div>{errorMessage}</div>}
                {<Grid container>
                    <Grid item>
                        <Link href="/signup" legacyBehavior passHref>
                            <Typography component="a" href="/signup" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Typography>
                        </Link>
                    </Grid>
                </Grid>}
            </form>
        </Container>
    );
};

export default LoginPage;
