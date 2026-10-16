import { Navigate, Route, Routes } from 'react-router-dom'
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
        {/* 없는 주소는 조건 입력으로 보낸다 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
