import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Quill 에디터 기본 스타일
import './Board.css';
import DOMPurify from 'dompurify';

const BoardWrite = () => {
  const navigate = useNavigate();
  
  // 작성자(author) 제거
  const [board, setBoard] = useState({
    category: '자유게시판', 
    title: '',
    content: ''
  });
  const [files, setFiles] = useState([]);
  const quillRef = useRef(null); // 에디터 객체에 접근하기 위한 ref

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard({ ...board, [name]: value });
  };

  const handleFileChange = (e) => {
    // FileList 객체를 배열로 변환하여 상태에 저장
    setFiles(Array.from(e.target.files));
  };

  // 이미지 업로드 핸들러
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file); // 백엔드의 @RequestParam("image")에 맞춤

      const accessToken = localStorage.getItem('accessToken');

      try {
        // 백엔드 이미지 업로드 API 호출
        const res = await axios.post('http://localhost:8000/api/boards/image', formData, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data' 
          }
        });

        // 응답으로 받은 이미지 ID(또는 URL)를 조합하여 이미지 주소 생성
        // 백엔드에서 반환된 URL(예: /api/boards/images/uuid-...)에 호스트를 붙여줍니다.
        const imageUrl = `http://localhost:8000${res.data}`;

        // 에디터의 현재 커서 위치를 가져와 이미지를 삽입
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, 'image', imageUrl);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      }
    };
  }, []);

  // Quill 에디터 툴바 설정 (이미지 버튼 포함)
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler // 커스텀 이미지 핸들러 연결
      }
    }
  }), []);

  const handleSubmit = async () => {
    // 1. 로컬 스토리지 등에서 JWT 토큰을 가져옵니다. (로그인 시 저장했다고 가정)
    // [임시] 로그인 구현 전 서버 전송 테스트를 위해 임시 더미 토큰을 할당합니다.
    const accessToken = localStorage.getItem('accessToken') || 'dummy-token-for-test';

    // 2. 입력값 유효성 검사
    if (!board.title.trim() || !board.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 파일 업로드를 위해 FormData 객체를 생성합니다.
    const formData = new FormData();
    
    formData.append('category', board.category);
    formData.append('title', DOMPurify.sanitize(board.title)); // 제목도 악성 스크립트 필터링 적용
    // 서버로 보내기 전에 악성 스크립트 제거
    formData.append('content', DOMPurify.sanitize(board.content));
    
    // 파일 데이터 추가 (백엔드에서 받을 파라미터명 'files'에 맞춤)
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      // 3. 백엔드 API로 POST 요청 (axios 사용)
      await axios.post('http://localhost:8000/api/boards/v1/posts',
        formData, // JSON 데이터 대신 FormData 전송
        {
          headers: {
            // 인증을 위해 Authorization 헤더에 JWT 토큰을 담아 보냅니다.
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data' // 파일 업로드용 헤더 명시
          }
        }
      );

      alert('게시글이 성공적으로 등록되었습니다.');
      navigate('/board/전체'); // 등록 성공 시 전체 목록 페이지로 이동
    } catch (error) {
      console.error('게시글 등록 중 오류 발생:', error);
      alert('게시글 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="board-container">
      <h2 className="write-header">게시글 작성</h2>
      
      {/* 깔끔한 표 형태의 박스로 감싸기 */}
      <div className="form-box">
        
        {/* 카테고리 행 */}
        <div className="form-row">
          <div className="form-label-box">카테고리</div>
          <div className="form-input-box">
            <select name="category" value={board.category} onChange={handleChange} className="form-select" style={{ width: '200px' }}>
              <option value="공지사항">공지사항</option>
              <option value="자유게시판">자유게시판</option>
              <option value="Q&A">Q&A</option>
              <option value="금융">금융</option>
              <option value="개발">개발</option>
            </select>
          </div>
        </div>

        {/* 제목 행 */}
        <div className="form-row">
          <div className="form-label-box">제목</div>
          <div className="form-input-box">
            <input type="text" name="title" onChange={handleChange} className="form-input" placeholder="제목을 입력하세요" />
          </div>
        </div>
        
        {/* 내용 행 */}
        <div className="form-row">
          <div className="form-label-box" style={{ alignItems: 'flex-start', paddingTop: '20px' }}>내용</div>
          <div className="form-input-box" style={{ paddingBottom: '40px' }}>
            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={board.content}
              modules={modules}
              onChange={(value) => setBoard({ ...board, content: value })}
              style={{ height: '300px' }}
            />
          </div>
        </div>

        {/* 파일 첨부 행 */}
        <div className="form-row">
          <div className="form-label-box">첨부파일</div>
          <div className="form-input-box">
            <input type="file" multiple onChange={handleFileChange} className="form-input" style={{ border: 'none', padding: '5px 0' }} />
          </div>
        </div>

      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>취소</button>
        <button className="btn btn-primary" onClick={handleSubmit}>등록</button>
      </div>
    </div>
  );
};

export default BoardWrite;