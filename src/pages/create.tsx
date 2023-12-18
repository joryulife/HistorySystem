// 例えば、pages/index.js

import React, { useState } from 'react';

export default function Home() {
    const [userId, setUserId] = useState('');

    const handleButtonClick = async () => {
        try {
        const response = await fetch('/api/createImg', {
            body: JSON.stringify({ userId }),
            headers: {
                'Content-Type': 'application/json',
                },
            method: 'POST',
        });

        if (response.ok) {
            console.log('Image creation started');
        } else {
            console.error('Failed to start image creation');
        }
        } catch (error) {
        console.error('Error:', error);
        }
    };

    return (
        <div>
        <input 
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
            type="number" 
            value={userId} 
        />
        <button onClick={handleButtonClick}>Create Image</button>
        </div>
    );
}
