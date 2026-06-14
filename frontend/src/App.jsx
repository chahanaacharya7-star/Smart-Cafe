import { BrowserRouter, Routes, Route } from "react-router-dom";

import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage";
import TableBookingPage from "./pages/TableBookingPage";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MenuPage />} />

                <Route path="/checkout" element={<CheckoutPage />} />

                <Route path="/book-table" element={<TableBookingPage />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

import { Routes, Route } from "react-router-dom";

import MenuPage from "./pages/MenuPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AddEditMenuItemForm from "./pages/AddEditMenuItemForm";

function App() {

    return (

        <Routes>

            <Route
                path="/"
                element={<MenuPage />}
            />

            <Route
                path="/admin/menu"
                element={<AdminMenuPage />}
            />

            <Route
                path="/admin/menu/add"
                element={<AddEditMenuItemForm />}
            />

        </Routes>
    );
}

export default App;