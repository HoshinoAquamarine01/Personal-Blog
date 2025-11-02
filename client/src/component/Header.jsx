import React from 'react';

import { Link } from 'react-router-dom';

import { useAuth } from '../context/Authcontext';

const Header = () => {

const { isAuthenticated, logout } = useAuth();
return (
    <header>
        <nav>
            <Link to="/">Home</Link>
            {isAuthenticated && <Link to="/admin">Dashboard</Link>}
            {isAuthenticated && <button onClick={logout}>Logout</button>}
            {!isAuthenticated && <Link to="/admin/login">Login</Link>}
        </nav>
    </header>
);
};

export default Header;