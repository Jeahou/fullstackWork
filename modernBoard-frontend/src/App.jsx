import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BoardList from './pages/BoardList';
import BoardWrite from './pages/BoardWrite';
import BoardDetail from './pages/BoardDetail';
import ScrollToTop from './components/ScrollToTop';
import BoardEdit from './pages/BoardEdit';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* 처음 사이트에 들어오면 기본적으로 '전체' 카테고리로 강제 이동시킵니다 */}
          <Route path="/" element={<Navigate to="/board/전체" replace />} />
          
          {/* :category 라는 URL 파라미터를 통해 어떤 게시판인지 판단합니다 */}
          <Route path="/board/:category" element={<BoardList />} />
          
          <Route path="/write" element={<BoardWrite />} />
          <Route path="/detail/:id" element={<BoardDetail />} />// App.jsx (또는 라우터 설정 파일)
          import BoardEdit from './pages/BoardEdit'; // 만든 파일 import
          
          // ... Routes 내부 어딘가에 추가
          <Route path="/edit/:id" element={<BoardEdit />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;