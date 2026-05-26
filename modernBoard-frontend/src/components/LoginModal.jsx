import { useState } from 'react';
import SignUpModal from './SignUpModal';
import './Modal.css';
import axios from 'axios';

const LoginModal = ({ onClose, setNickname }) => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('로그인 시도:', formData);
    try{
        const response = await axios.post('http://localhost:8000/api/member/login', formData);
        console.log('로그인 응답:', response.data);
        
        // 백엔드에서 넘겨준 LoginResponseDTO의 토큰을 localStorage에 저장합니다.
        const token = response.data.accessToken;

        if (token) {
            localStorage.setItem('accessToken', token);

            // 저장된 토큰을 사용하여 백엔드에서 회원 정보를 다시 가져옵니다.
            // 주소('http://localhost:8000/api/member/me')는 실제 백엔드 API 경로로 변경해주세요.
            const userResponse = await axios.get('http://localhost:8000/api/member/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // 백엔드 DTO(BoardMemberInfoDTO)의 필드명에 맞춰 데이터를 가져옵니다.
            const { nickName, nickname } = userResponse.data;
            
            // JSON 변환 시 소문자/카멜케이스를 모두 커버하도록 처리합니다.
            const finalNickname = nickName || nickname;
            if (finalNickname) {
                if (setNickname) setNickname(finalNickname); // Header의 상태를 즉시 업데이트
            }
            
            // 내 정보 조회가 끝난 후, 닉네임 데이터를 담아서 앱 전체에 로그인 완료 방송을 합니다.
            window.dispatchEvent(new CustomEvent('authChange', { detail: { nickname: finalNickname } }));
        }
        
        alert('로그인에 성공했습니다.');
        onClose(); // 성공 시 모달 닫기
    }catch(error){
        console.error('로그인 오류:', error);
        alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }   
  };

  const handleSignUpClick = () => {
    setIsSignUpOpen(true);
  };

  const handleCloseSignUp = () => {
    setIsSignUpOpen(false);
  };

  return (
    <>
      {/* 회원가입 모달이 열려있지 않을 때만 로그인 모달 표시 */}
      {!isSignUpOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-button" onClick={onClose}>&times;</button>
            <h2 className="modal-title">로그인</h2>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                type="text"
                name="email"
                placeholder="아이디 (이메일)"
                value={formData.email}
                onChange={handleChange}
                className="modal-input"
              />
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                className="modal-input"
              />
              <button type="submit" className="modal-btn modal-btn-primary">로그인</button>
            </form>

            <div className="social-login-container">
              <button type="button" className="modal-btn social-btn google-btn">구글 로그인</button>
              <button type="button" className="modal-btn social-btn naver-btn">네이버 로그인</button>
              <button type="button" className="modal-btn social-btn kakao-btn">카카오 로그인</button>
            </div>

            <div className="modal-links">
              <button type="button" onClick={handleSignUpClick} className="link-btn">회원가입</button>
              <span className="divider">|</span>
              <button type="button" className="link-btn">아이디 찾기</button>
              <span className="divider">|</span>
              <button type="button" className="link-btn">비밀번호 찾기</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 회원가입 모달 */}
      {isSignUpOpen && (
        <SignUpModal onClose={handleCloseSignUp} />
      )}
    </>
  );
};

export default LoginModal;