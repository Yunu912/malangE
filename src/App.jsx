import { Route, Routes } from './router';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './pages/Home';
import MallangDetail from './pages/MallangDetail';
import Placeholder from './pages/Placeholder';
import TradeList from './pages/TradeList';
import Chat from './pages/Chat';
import TradeDetail from './pages/TradeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import ChatList from './pages/ChatList';

const loggedIn = () => Boolean(localStorage.getItem('userId'));

export default function App() { return <><Header /><Routes><Route path="/" element={loggedIn() ? <Home /> : <Login />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/mallangs/:id" element={loggedIn() ? <MallangDetail /> : <Login />} /><Route path="/trades" element={loggedIn() ? <TradeList /> : <Login />} /><Route path="/trades/:id" element={loggedIn() ? <TradeDetail /> : <Login />} /><Route path="/chats" element={loggedIn() ? <ChatList /> : <Login />} /><Route path="/chat/:id" element={loggedIn() ? <Chat /> : <Login />} /><Route path="/mypage" element={loggedIn() ? <MyPage /> : <Login />} /></Routes><Footer /></>; }
