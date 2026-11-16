import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ConditionPage from './pages/ConditionPage.jsx'
import MainPage from './pages/MainPage.jsx'
import RecommendPage from './pages/RecommendPage.jsx'
import ResultPage from './pages/ResultPage.jsx'

export default function App() {
  return (
    <Routes>
      {/* 메인은 자체 화면(브랜드 헤더 없음). 나머지는 공통 Layout 안에서 보여준다 */}
      <Route path="/" element={<MainPage />} />
      <Route element={<Layout />}>
        <Route path="/condition" element={<ConditionPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/recommend" element={<RecommendPage />} />
        {/* 없는 주소는 메인으로 보낸다 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
