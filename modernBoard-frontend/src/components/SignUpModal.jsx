import { useState } from 'react';
import './Modal.css';
import axios from 'axios';

const SignUpModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    emailId: '',
    emailDomain: 'gmail.com', // 입력창에 보여질 도메인
    password: '',
    confirmPassword: '',
    nickname: '',
    name: ''
  });
  const [domainOption, setDomainOption] = useState('gmail.com');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 이메일 도메인 선택 변경 핸들러
  const handleDomainChange = (e) => {
    const value = e.target.value;
    setDomainOption(value);
    if (value === 'custom') {
      setFormData({ ...formData, emailDomain: '' });
    } else {
      setFormData({ ...formData, emailDomain: value });
    }
  };

  // 완성된 이메일 조합 함수
  const getFullEmail = () => {
    return `${formData.emailId}@${formData.emailDomain}`;
  };

  // 아이디 중복체크 임시 핸들러
  const handleCheckEmail = () => {
    if (!formData.emailId || !formData.emailDomain) {
      return alert('아이디(이메일)를 모두 입력해주세요.');
    }
    // TODO: 백엔드 이메일 중복 체크 API 호출
    alert(`'${getFullEmail()}'은(는) 사용 가능한 아이디입니다. (임시)`);
  };

  // 닉네임 중복체크 임시 핸들러
  const handleCheckNickname = () => {
    if (!formData.nickname.trim()) {
      return alert('닉네임을 입력해주세요.');
    }
    // TODO: 백엔드 닉네임 중복 체크 API 호출
    alert(`'${formData.nickname}'은(는) 사용 가능한 닉네임입니다. (임시)`);
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=(.*[A-Za-z]))(?=(.*\d))(?=(.*[!@#$%^&*()_+~`|}{[\]:;?><,./-]){2,}).{8,20}$/;

    const fullEmail = getFullEmail();
    if (!emailRegex.test(fullEmail)) {
      newErrors.email = '유효한 아이디(이메일) 형식이 아닙니다.';
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자(2개 이상)를 포함하여 8~20자여야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // 백엔드(Spring Boot)에서 실제로 필요한 데이터만 골라서 조립합니다.
      const submitData = {
        email: getFullEmail(),
        password: formData.password,
        nickName: formData.nickname,
        name: formData.name
      };
      // TODO: 백엔드 회원가입 API 통신 연결
        try{
            await axios.post('http://localhost:8000/api/member/register', submitData);
            console.log('회원가입 정보:', submitData);
            alert('회원가입 요청 성공! (임시 알림)');
            onClose(); // 성공 시 모달 닫기
        }catch(error){
            console.error('회원가입 오류:', error);
            alert('회원가입에 실패했습니다.');
        }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container signup-modal-container">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">회원가입</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="modal-label">아이디 (이메일)</label>
            <div className="input-with-btn">
              <div className="email-input-group">
                <input
                  type="text"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  className="modal-input"
                />
                <span>@</span>
                <input
                  type="text"
                  name="emailDomain"
                  value={formData.emailDomain}
                  onChange={handleChange}
                  className="modal-input"
                  disabled={domainOption !== 'custom'}
                />
                <select
                  value={domainOption}
                  onChange={handleDomainChange}
                  className="modal-input"
                  style={{ flex: 0.8 }}
                >
                  <option value="gmail.com">gmail.com</option>
                  <option value="naver.com">naver.com</option>
                  <option value="kakao.com">kakao.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="nate.com">nate.com</option>
                  <option value="hanmail.net">hanmail.net</option>
                  <option value="hotmail.com">hotmail.com</option>
                  <option value="outlook.com">outlook.com</option>
                  <option value="yahoo.com">yahoo.com</option>
                  <option value="icloud.com">icloud.com</option>
                  <option value="custom">직접 입력</option>
                </select>
              </div>
              <button type="button" className="btn-check" onClick={handleCheckEmail}>중복확인</button>
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label className="modal-label">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="modal-input"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label className="modal-label">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="modal-input"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
          
          <div className="form-group">
            <label className="modal-label">닉네임</label>
            <div className="input-with-btn">
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="modal-input"
              />
              <button type="button" className="btn-check" onClick={handleCheckNickname}>중복확인</button>
            </div>
            {errors.nickname && <span className="error-text">{errors.nickname}</span>}
          </div>
          
          <div className="form-group">
            <label className="modal-label">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="modal-input"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <button type="submit" className="modal-btn modal-btn-primary">가입하기</button>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;