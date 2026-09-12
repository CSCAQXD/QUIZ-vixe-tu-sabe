import { Outlet } from "react-router-dom";
import "./MainLayout.css";

function MainLayout() {
    return (
        <main className="main-layout">
        <Outlet />
        </main>
    );
}

export default MainLayout;