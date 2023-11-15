import React from 'react';

import axios from 'axios';

const LogoutButton = () => {
    const handleLogout = async () => {
        try {
            // ログアウトAPIを呼び出し
            const response = await axios.post('/api/auth/logout');
            console.log(response.data.message);

            // ログアウト後のリダイレクト（オプショナル）
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};

export default LogoutButton;