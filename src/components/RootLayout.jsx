import { Outlet } from 'react-router';
import Navbar from './Navbar.jsx';

export default function RootLayout() {
    return (
        <div>
            <Navbar />
            <div>
                <Outlet />
            </div>
        </div>
    )
}