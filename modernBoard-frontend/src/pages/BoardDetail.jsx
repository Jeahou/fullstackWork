import { useParams, Link, useNavigate } from 'react-router-dom';
import './Board.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LoginModal from '../components/LoginModal'; // 로그인 모달 불러오기
import DOMPurify from 'dompurify';

const BoardDetail = () => {
  // 주소창에서 /detail/1 할 때의 '1'을 가져옵니다. (기본적으로 문자열입니다) app.jsx확인
  const { id } = useParams();
  const navigate = useNavigate();

  // 더미 데이터에서 주소창의 id와 일치하는 게시글 하나를 찾습니다.
  // URL 파라미터는 문자열이므로 parseInt()를 써서 숫자로 바꿔 비교합니다.

  const [boardById,setBoardById] = useState(null);
  const [files, setFiles] = useState([]); // 첨부파일 목록을 별도로 관리하기 위한 상태
  
  // --- 댓글 관련 상태 ---
  // 임시 더미 데이터로 댓글 구조를 잡아둡니다. (나중엔 백엔드에서 받아옵니다)
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(''); // 새 댓글 입력 상태
  const [replyingTo, setReplyingTo] = useState(null); // 답글을 달고 있는 댓글의 ID
  const [replyContent, setReplyContent] = useState(''); // 대댓글 입력 상태

  // --- 권한 및 모달 관련 상태 ---
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 사용자 정보
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try{
        // 게시글, 댓글, 그리고 파일 정보를 각각의 API를 통해 병렬로 가져옵니다.
        const [boardResponse, commentsResponse, filesResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/boards/${id}`),
          axios.get(`http://localhost:8000/api/comments/v1/${id}`),
          axios.get(`http://localhost:8000/api/boards/files/${id}`) // 게시글 ID로 파일 목록을 조회하는 API (댓글 API와 형식을 맞춤)
        ]);
        
        setBoardById(boardResponse.data);
        setComments(commentsResponse.data);
        setFiles(filesResponse.data); // 받아온 파일 목록을 상태에 저장합니다.
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData();
  }, [id]);

  // 현재 로그인한 사용자 정보 가져오기 (수정/삭제 권한 확인용)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/api/member/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
          setCurrentUser(null); // 에러 발생 시 초기화
        }
      } else {
        setCurrentUser(null); // 토큰이 없으면(로그아웃 상태면) null로 초기화
      }
    };

    fetchCurrentUser();

    // 로그인/로그아웃 상태 변경 감지
    window.addEventListener('authChange', fetchCurrentUser);
    window.addEventListener('storage', fetchCurrentUser);

    return () => {
      window.removeEventListener('authChange', fetchCurrentUser);
      window.removeEventListener('storage', fetchCurrentUser);
    };
  }, []);
  
  // 일반 댓글 등록 처리
  const handleCommentSubmit = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return setIsLoginModalOpen(true); // 로그인 안 했으면 모달 띄우기
    }

    if (!newComment.trim()) return alert('댓글 내용을 입력해주세요.');
    
    try {
      
      // 계층형 댓글 저장을 위해 boardId와 parentId(null)를 함께 전송합니다.
      // (URL 주소는 백엔드 엔드포인트 설계에 맞게 조정하세요)
      await axios.post(`http://localhost:8000/api/comments/v1/posts`, 
        { 
          boardId: id, // JS의 숫자 한계를 피하기 위해 문자열 그대로 전송 (Spring이 알아서 Long으로 받아줌)
          parentId: null, // 일반 댓글은 부모가 없음
          content: newComment 
        },
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      
      setNewComment(''); // 입력창 초기화
      
      // 성공적으로 등록되면 최신 댓글 목록을 백엔드에서 다시 불러옵니다.
      const commentsResponse = await axios.get(`http://localhost:8000/api/comments/v1/${id}`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('댓글 등록 중 오류:', error);
      alert('댓글 등록에 실패했습니다.');
    }
  };

  // 대댓글 등록 처리
  const handleReplySubmit = async (commentId) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return setIsLoginModalOpen(true); // 로그인 안 했으면 모달 띄우기
    }

    if (!replyContent.trim()) return alert('대댓글 내용을 입력해주세요.');
    
    try {
      
      // 대댓글 저장을 위해 부모의 ID(commentId)를 parentId로 함께 전송합니다.
      await axios.post(`http://localhost:8000/api/comments/v1/posts`, 
        { 
          boardId: id, // JS의 숫자 한계를 피하기 위해 문자열 그대로 전송
          parentId: commentId, // 대댓글이 달릴 부모 댓글의 ID
          content: replyContent 
        },
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      
      setReplyingTo(null); // 대댓글 입력창 닫기
      setReplyContent(''); // 입력창 초기화
      
      // 성공적으로 등록되면 최신 댓글 목록을 다시 불러와 화면을 갱신합니다.
      const commentsResponse = await axios.get(`http://localhost:8000/api/comments/v1/${id}`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('대댓글 등록 중 오류:', error);
      alert('대댓글 등록에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    // 사용자에게 다시 한번 확인
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('로그인이 필요합니다.');
          return;
        }

        // 백엔드로 DELETE 요청 전송
        await axios.delete(`http://localhost:8000/api/boards/v1/delete/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        alert('게시글이 삭제되었습니다.');
        navigate('/board/전체'); // 삭제 완료 시 목록으로 돌아가기
      } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`); // 수정 페이지로 이동
  };

  // 작성자 권한 체크 (현재 로그인한 회원과 게시글의 작성자 비교)
  // TODO: 추후 백엔드에서 author(닉네임) 대신 memberId로 식별하도록 수정하면
  // String(boardById.memberId) === String(currentUser.memberId) 로 변경하세요.
  const isAuthor = currentUser && boardById && (
    boardById.author === currentUser.nickName || 
    boardById.author === currentUser.nickname ||
    String(boardById.memberId) === String(currentUser.memberId)
  );

  // 만약 존재하지 않는 번호로 접근했을 때의 방어 로직 (에러 방지)
  if (!boardById) {
    return (
      <div className="board-container">
        <h2>게시글을 찾을 수 없습니다.</h2>
        <Link to="/"><button className="btn btn-secondary">목록으로 돌아가기</button></Link>
      </div>
    );
  }

  return (
    <div className="board-container">
      
      {/* 찾은 board 데이터로 화면 그리기 */}
      <div className="detail-header">
        <span style={{ fontSize: '13px', padding: '4px 10px', backgroundColor: '#f1f3f5', color: '#495057', borderRadius: '20px', fontWeight: 'bold' }}>
          {boardById.category}
        </span>
        <h2 className="detail-title">{boardById.title}</h2>
        
        <div className="detail-info">
          <span><strong>{boardById.author}</strong></span>
          <span>{boardById.createdAt}</span>
        </div>
      </div>

      <div className="detail-content">
        {/* 에디터 내부 이미지 크기 제한 스타일 추가 */}
        <style>
          {`
            .detail-content img {
              max-width: 100%;
              max-height: 500px; /* 원하는 최대 세로 크기로 조절하세요 (예: 400px) */
              object-fit: contain; /* 가로세로 비율이 깨지지 않게 유지 */
            }
          `}
        </style>
        {/* 에디터로 작성된 HTML 내용 렌더링 */}
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(boardById.content) }} />
      </div>

      {/* 첨부파일 영역 */}
      {files && files.length > 0 && (
        <div className="detail-files" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#495057' }}>첨부파일</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.map(file => (
              <li key={file.id} style={{ 
                marginBottom: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: '#fff', 
                padding: '10px 15px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}>
                <span style={{ fontSize: '14px', color: '#333' }}>
                  💾 {file.originalName} <span style={{ color: '#888', fontSize: '12px' }}>{file.fileSize ? `(${(file.fileSize / 1024).toFixed(1)} KB)` : ''}</span>
                </span>
                <a 
                  href={`http://localhost:8000/api/boards/files/download/${file.id}`} 
                  download={file.originalName}
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '12px' }}
                >
                  다운로드
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-buttons">
        <Link to="/">
          <button className="btn btn-secondary">목록으로</button>
        </Link>
        {isAuthor && (
          <>
            <button className="btn btn-primary" onClick={handleEdit}>수정</button>
            <button className="btn" style={{ backgroundColor: '#dc3545', color: 'white' }} onClick={handleDelete}>삭제</button>
          </>
        )}
      </div>

      {/* --- 댓글 영역 시작 --- */}
      <div className="comments-section" style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>댓글 {comments.length}</h3>
        
        {/* 새 댓글 작성 창 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 남겨보세요"
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none', height: '70px', outline: 'none' }}
          />
          <button className="btn btn-primary" onClick={handleCommentSubmit} style={{ height: '70px', width: '80px' }}>등록</button>
        </div>

        {/* 댓글 목록 */}
        <div className="comments-list">
          {comments.map(comment => {
            // 백엔드에서 넘어오는 필드명('lvl')과 시작값(루트:1, 대댓글:2)에 맞춰 수정합니다.
            // parentId가 존재하거나 lvl이 1보다 크면 대댓글로 판단합니다.
            const isReply = comment.parentId != null || comment.lvl > 1;
            const depthLevel = comment.lvl > 1 ? comment.lvl - 1 : 0; // 들여쓰기 칸 수 계산 (lvl 2면 1칸, 3이면 2칸)
            
            return (
              <div key={comment.id} style={{ 
                  borderBottom: isReply ? 'none' : '1px solid #eee', 
                  padding: isReply ? '15px' : '20px 0', 
                  backgroundColor: isReply ? '#f8f9fa' : 'transparent',
                  marginLeft: isReply ? `${depthLevel * 40}px` : '0', // 깊이(lvl)에 따라 들여쓰기를 자동 조절합니다!
                  borderRadius: isReply ? '8px' : '0',
                  marginBottom: isReply ? '10px' : '0',
                  border: isReply ? '1px solid #f1f3f5' : 'none'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: isReply ? '14px' : '15px' }}>{comment.author}</strong>
                  <span style={{ fontSize: isReply ? '12px' : '13px', color: '#999' }}>{comment.createdAt}</span>
                </div>
                <p style={{ margin: '0 0 15px 0', whiteSpace: 'pre-wrap', color: isReply ? '#444' : '#333', lineHeight: '1.5', fontSize: isReply ? '14px' : '15px' }}>
                  {comment.content}
                </p>
                
                {!isReply && (
                  <button 
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    style={{ background: 'none', border: 'none', color: '#868e96', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 'bold' }}
                  >
                    {replyingTo === comment.id ? '답글 취소' : '답글 달기'}
                  </button>
                )}

                {/* 대댓글 작성 폼 (토글) */}
                {!isReply && replyingTo === comment.id && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <textarea 
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="대댓글을 남겨보세요"
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none', height: '55px', outline: 'none' }}
                    />
                    <button className="btn btn-secondary" onClick={() => handleReplySubmit(comment.id)} style={{ height: '55px', width: '70px' }}>등록</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* --- 댓글 영역 끝 --- */}

      {/* 로그인 모달 */}
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          setNickname={() => {}} // authChange 이벤트가 처리하므로 새로고침 불필요
        />
      )}

    </div>
  );
};

export default BoardDetail;