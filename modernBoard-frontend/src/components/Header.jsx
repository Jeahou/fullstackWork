import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import LoginModal from './LoginModal';
import axios from 'axios';

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [nickname, setNickname] = useState(''); // 닉네임 상태 정의

  useEffect(() => {
    const fetchUserInfo = (e) => {
      // 이벤트(authChange)에 닉네임 정보가 담겨왔다면 API 호출 없이 즉시 적용합니다.
      if (e && e.detail && e.detail.nickname) {
        setNickname(e.detail.nickname);
        return;
      }

      // 토큰이 있다면 백엔드에서 내 정보를 조회해옵니다.
      const token = localStorage.getItem('accessToken');
      if (token) {
        axios.get('http://localhost:8000/api/member/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
          const finalNickname = response.data.nickName || response.data.nickname;
          if (finalNickname) setNickname(finalNickname);
        })
        .catch(error => {
          console.error('사용자 정보 조회 실패:', error);
          // 토큰이 만료되었거나 유효하지 않으면 삭제하여 로그아웃 처리
          localStorage.removeItem('accessToken');
          setNickname(''); // 에러 시 닉네임 초기화
        });
      } else {
        setNickname(''); // 토큰이 없으면 닉네임 비우기
      }
    };

    fetchUserInfo(); // 최초 화면 렌더링 시 실행

    // 앱 내에서 발생하는 'authChange' (로그인/로그아웃) 방송 듣기
    window.addEventListener('authChange', fetchUserInfo);
    // 다른 브라우저 탭에서 로그인/로그아웃 상태가 바뀌어도 즉각 반응하도록 추가
    window.addEventListener('storage', fetchUserInfo);

    return () => {
      window.removeEventListener('authChange', fetchUserInfo);
      window.removeEventListener('storage', fetchUserInfo);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setNickname(''); // 로그아웃 시 닉네임 상태 초기화
    window.dispatchEvent(new Event('authChange')); // 로그아웃 상태 변경 이벤트 발생
    alert('로그아웃 되었습니다.');
  };

  // NavLink가 현재 주소(URL)와 일치할 때 적용할 스타일 함수
  const navStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? '#007bff' : '#495057', // 선택되면 파란색, 아니면 짙은 회색
    padding: '15px 5px',
    fontWeight: isActive ? 'bold' : 'normal',
    borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent', // 선택되면 파란 밑줄
    display: 'block'
  });

  return (
    <>
      {/* 1층: 최상단 다크 헤더 (로고 & 로그인) */}
      <header style={{ backgroundColor: '#282c34', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>
          <Link to="/board/전체" style={{ color: 'white', textDecoration: 'none' }}>🚀 My Modern System</Link>
        </h1>
        <div>
          {nickname ? (
            <span style={{ color: '#aaa', fontSize: '14px' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>{nickname}</span>님 환영합니다!
              <span 
                style={{ marginLeft: '15px', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={handleLogout}
              >
                로그아웃
              </span>
            </span>
          ) : (
            <span 
              style={{ color: '#aaa', fontSize: '14px', cursor: 'pointer' }}
              onClick={() => setIsLoginModalOpen(true)}
            >
              로그인
            </span>
          )}
        </div>
      </header>

      {/* 2층: 하단 화이트 가로바 (카테고리 메뉴) */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '0 30px', display: 'flex', justifyContent: 'center', gap: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <NavLink to="/board/전체" style={navStyle}>전체글</NavLink>
        <NavLink to="/board/공지사항" style={navStyle}>공지사항</NavLink>
        <NavLink to="/board/자유게시판" style={navStyle}>자유게시판</NavLink>
        <NavLink to="/board/Q&A" style={navStyle}>Q&A</NavLink>
        <NavLink to="/board/개발" style={navStyle}>개발</NavLink>
        <NavLink to="/board/금융" style={navStyle}>금융</NavLink>
      </nav>

      {/* 여기서 자식 컴포넌트인 LoginModal로 setNickname 함수를 전달합니다 */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} setNickname={setNickname} />
      )}
    </>
  );
};

export default Header;