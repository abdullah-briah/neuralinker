import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // If token exists, verify it and get user data
            api.get('/users/me')
                .then((response) => {
                    setUser(response.data);
                })
                .catch((error) => {
                    console.error('Failed to fetch user:', error);
                    logout(); // Invalid token
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = (newToken, userData = null) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        if (userData) {
            setUser(userData);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
