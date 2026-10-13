import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ConditionPage from './pages/ConditionPage.jsx'
import RecommendPage from './pages/RecommendPage.jsx'
import ResultPage from './pages/ResultPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ConditionPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/recommend" element={<RecommendPage />} />
      </Route>
    </Routes>
  )
}
