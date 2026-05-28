import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL에서 쿼리 파라미터 추출 (예: ?token=eyJhbGciOi...)
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token') || queryParams.get('accessToken');

    if (token) {
      // 1. 로컬 스토리지에 토큰 저장
      localStorage.setItem('accessToken', token);
      
      // 2. 로그인 상태 변경 이벤트 발생 (Header 컴포넌트 등에서 즉시 감지하여 닉네임을 표시함)
      window.dispatchEvent(new Event('authChange'));
      
      // 3. 메인 페이지로 이동 (replace: true 옵션으로 뒤로가기 시 콜백 페이지로 안 오게 처리)
      navigate('/', { replace: true });
    } else {
      alert('소셜 로그인에 실패했거나 토큰이 없습니다.');
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>소셜 로그인 처리 중입니다... 🔄</h2>
    </div>
  );
};

export default OAuth2Callback;
