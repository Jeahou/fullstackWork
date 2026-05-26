import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    // 전체 화면 높이(100vh)를 꽉 채우고, Flexbox를 이용해 푸터를 항상 바닥으로 밀어냅니다.
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. 상단 고정 헤더 */}
      <Header />
      
      {/* 2. 본문 (게시판 페이지들이 갈아끼워지는 영역) */}
      <main style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '20px 0' }}>
        <Outlet /> 
      </main>

      {/* 3. 하단 고정 푸터 */}
      <Footer />
    </div>
  );
};

export default Layout;