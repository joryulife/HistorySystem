// src/lib/withAuth.tsx
import React, { useEffect } from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';

// Next.js APIルートのパス
const apiPath = '/api/auth/check';

export function withAuth<T extends Record<string, unknown>>(WrappedComponent: React.ComponentType<T>) {
    const RequiresAuth: React.FC<T> = (props) => {
        const router = useRouter();

        useEffect(() => {
            const verifyUser = async () => {
                try {
                    const response = await axios.get(apiPath, { withCredentials: true });
                    console.log('Auth check response:', response);  // レスポンスをログに記録
        
                    if (!response.data.isLoggedIn) {
                        // ユーザーがログインしていない場合はログインページにリダイレクト
                        router.push('/login');
                    }
                } catch (error) {
                    console.error('Auth check error:', error);  // エラーをログに記録
                    // ここでも念のためログインページにリダイレクトさせることもできます
                }
            };
        
            verifyUser();
        }, [router]);

        return <WrappedComponent {...props} />;
    };

    return RequiresAuth;
}
