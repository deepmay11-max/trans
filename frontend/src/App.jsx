import AppRouter from './router/AppRouter'
import './App.css'

import { useIOSInputScroll } from './hooks/useIOSInputScroll'

export default function App() {
  useIOSInputScroll();
  return <AppRouter />
}
