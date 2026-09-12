import { Outlet } from "react-router-dom";
import "./MainLayout.css";

function MainLayout() {
    return (
        <div className="main-layout">
        <div
            aria-hidden="true"
            className="main-layout__sun"
        />

        <div
            aria-hidden="true"
            className="main-layout__ground"
        />

        <main className="main-layout__content">
            <Outlet />
        </main>

        <footer className="main-layout__footer">
            Casa de Saberes Cego Aderaldo
        </footer>
        </div>
    );
}

export default MainLayout;