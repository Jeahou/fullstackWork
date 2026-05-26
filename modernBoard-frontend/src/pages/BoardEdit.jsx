import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Quill 에디터 기본 스타일
import './Board.css';
import DOMPurify from 'dompurify';

const BoardEdit = () => {
  const { id } = useParams(); // URL에서 게시글 번호를 가져옴
  const navigate = useNavigate();
  
  const [board, setBoard] = useState({
    category: '자유게시판', 
    title: '',
    content: ''
  });
  const [files, setFiles] = useState([]); // 새로 추가할 파일 상태
  const [existingFiles, setExistingFiles] = useState([]); // 기존 업로드된 파일 상태
  const [deletedFiles, setDeletedFiles] = useState([]); // 삭제할 기존 파일 ID (살생부)
  const quillRef = useRef(null);

  // 컴포넌트 마운트 시 기존 데이터를 불러옵니다.
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const [boardResponse, filesResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/boards/${id}`),
          axios.get(`http://localhost:8000/api/boards/files/${id}`)
        ]);

        // 불러온 기존 데이터를 상태에 채워 넣습니다.
        setBoard(boardResponse.data);
        setExistingFiles(filesResponse.data);
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error);
        alert('게시글 정보를 불러올 수 없습니다.');
        navigate(-1); // 이전 페이지로 돌려보냄
      }
    };
    fetchBoard();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard({ ...board, [name]: value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // 기존 파일 삭제 버튼 클릭 핸들러
  const handleRemoveExistingFile = (fileId) => {
    // 화면에서 안 보이게 existingFiles에서 제거
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
    // 백엔드에 삭제 요청을 보내기 위해 deletedFiles(살생부)에 ID 추가
    setDeletedFiles((prev) => [...prev, fileId]);
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

        // 백엔드에서 반환된 URL(예: /api/boards/images/uuid-...)에 호스트를 붙여줍니다.
        const imageUrl = `http://localhost:8000${res.data}`;

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
        image: imageHandler
      }
    }
  }), []);

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem('accessToken') || 'dummy-token-for-test';

    if (!board.title.trim() || !board.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('category', board.category);
    formData.append('title', DOMPurify.sanitize(board.title)); // 제목도 악성 스크립트 필터링 적용
    // 서버로 보내기 전에 악성 스크립트 제거
    formData.append('content', DOMPurify.sanitize(board.content));
    
    // 새 파일 추가
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // 삭제할 기존 파일 ID 목록 추가 (백엔드에서 List<Long> deletedFiles 등으로 받음)
    deletedFiles.forEach(id => {
      formData.append('deletedFiles', id);
    });

    try {
      // PUT 요청으로 수정된 데이터와 추가된 파일 전송
      await axios.put(`http://localhost:8000/api/boards/v1/update/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('게시글이 성공적으로 수정되었습니다.');
      navigate(`/detail/${id}`); // 수정 완료 시 해당 게시글 상세 페이지로 다시 이동
    } catch (error) {
      console.error('게시글 수정 중 오류 발생:', error);
      alert('게시글 수정에 실패했습니다.');
    }
  };

  return (
    <div className="board-container">
      <h2 className="write-header">게시글 수정</h2>
      
      <div className="form-box">
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
        <div className="form-row">
          <div className="form-label-box">제목</div>
          <div className="form-input-box">
            <input type="text" name="title" value={board.title || ''} onChange={handleChange} className="form-input" placeholder="제목을 입력하세요" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-label-box" style={{ alignItems: 'flex-start', paddingTop: '20px' }}>내용</div>
          <div className="form-input-box" style={{ paddingBottom: '40px' }}>
            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={board.content || ''}
              modules={modules}
              onChange={(value) => setBoard({ ...board, content: value })}
              style={{ height: '300px' }}
            />
          </div>
        </div>
        
        {/* 기존 첨부파일 목록 보여주기 */}
        {existingFiles.length > 0 && (
          <div className="form-row">
            <div className="form-label-box" style={{ alignItems: 'flex-start', paddingTop: '10px' }}>기존 파일</div>
            <div className="form-input-box" style={{ paddingTop: '10px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {existingFiles.map(file => (
                  <li key={file.id} style={{ 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}>
                    <span>💾 {file.originalName}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveExistingFile(file.id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                      title="파일 삭제"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 새 파일 첨부 행 */}
        <div className="form-row">
          <div className="form-label-box">새 파일 추가</div>
          <div className="form-input-box">
            <input type="file" multiple onChange={handleFileChange} className="form-input" style={{ border: 'none', padding: '5px 0' }} />
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>취소</button>
        <button className="btn btn-primary" onClick={handleSubmit}>수정 완료</button>
      </div>
    </div>
  );
};

export default BoardEdit;