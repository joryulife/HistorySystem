import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import db from '../../../lib/ds';

import type { RowDataPacket } from 'mysql2';
import type { NextAuthOptions } from 'next-auth'


// Userインターフェースを拡張
declare module "next-auth" {
  interface User {
    id: number;
  }

  interface Session {
    user: User & { id: number };
  }
}

// JWTインターフェースを拡張
declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
  }
}

const options: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user }) {
      // ユーザーがログインしている場合、トークンにユーザーIDを追加
      if (user) {
        token.id = Number(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      // sessionとtokenが存在する場合にのみ処理を行う
      if (session && token && typeof token.id === 'number') {
        // tokenにユーザーIDが含まれている場合、sessionにも追加
        session.user = session.user || {}; // session.userが未定義の場合に空のオブジェクトを割り当て
        session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials) return null;
        const { username, password } = credentials;

        try {
          const query = 'SELECT * FROM users WHERE username = ?';
          const [results] = await db.query<RowDataPacket[]>(query, [username]);

          if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
            const user = { id: results[0].id, name: results[0].username };
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.error(error);
          return null;
        }
      },
      credentials: {
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
      },
      name: 'Credentials',
    }),
  ],
  secret: 'your-secret', // 安全なシークレットキーを設定してください
};

export default NextAuth(options);
