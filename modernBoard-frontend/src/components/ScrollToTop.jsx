import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 화면 렌더링 후 요소를 찾기 위해 0.1초 대기 (빠른 페이지 전환 시 타이머 정리 포함)
    const timer = setTimeout(() => {
      const container = document.querySelector('.board-container');
      
      if (container) {
        // 글쓰기 페이지(/write)일 때만 화면 중앙에 부드럽게 포커스
        if (pathname === '/write') {
          container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // 내용이 길면 상단이 잘리지 않도록 부드럽게 맨 위로 스크롤
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollToTop;