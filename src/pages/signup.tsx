// pages/signup.tsx
import React, { useState } from 'react';

import { TextField, Button, Container } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        try {
            await axios.post('/api/signup', {
                password,
                username,
            });
            // サインアップが成功したら、ログインページにリダイレクトします
            router.push('/login');
        } catch (error: any) {
            // エラーメッセージを設定します
            setErrorMessage(error.response?.data.message || 'Sign up failed');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
        <form onSubmit={handleSignUp}>
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
                autoComplete="new-password"
                fullWidth
                label="Password"
                margin="normal"
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                value={password}
                variant="outlined"
            />
            <TextField
                autoComplete="new-password"
                fullWidth
                label="Confirm Password"
                margin="normal"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                type="password"
                value={confirmPassword}
                variant="outlined"
            />
            <Button
                color="primary"
                fullWidth
                type="submit"
                variant="contained"
            >
            Sign Up
            </Button>
            {errorMessage && <div>{errorMessage}</div>}
        </form>
        </Container>
    );
};

export default SignUpPage;
