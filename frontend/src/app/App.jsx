import { Route, Routes } from 'react-router-dom';
import ProductsPage from '../pages/ProductsPage/index.js';
import WishlistsPage from '../pages/WishlistsPage/index.js';
import FriendsPage from '../pages/FriendsPage/index.js';
import CalendarPage from '../pages/CalendarPage/index.js';
import SettingsPage from '../pages/SettingsPage/index.js';
import Header from '../widgets/Header/index.js';
import Footer from '../widgets/Footer/index.js';
import './styles/index.js';

const App = () => {
	return (
		<div className="app">
			<Header/>
			<main className="main">
				<Routes>
					<Route path="/" element={<ProductsPage/>}/>
					<Route path="/wishlists" element={<WishlistsPage/>}/>
					<Route path="/friends" element={<FriendsPage/>}/>
					<Route path="/calendar" element={<CalendarPage/>}/>
					<Route path="/settings" element={<SettingsPage/>}/>
				</Routes>
			</main>
			<Footer/>
		</div>
	);
};

export default App;
