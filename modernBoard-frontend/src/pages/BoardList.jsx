import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Board.css';
import axios from 'axios';

// const dummyData = [
//   { id: 1, category: '공지사항', title: '첫 번째 게시글입니다.', date: '2026-05-11' },
//   { id: 2, category: 'Q&A', title: '리액트와 스프링부트 연동 질문있습니다.', date: '2026-05-11' },
//   { id: 3, category: '자유게시판', title: '게시판 UI 뼈대 잡는 중입니다!', date: '2026-05-11' },
//   { id: 4, category: '자유게시판', title: '오늘 점심 메뉴 추천받습니다.', date: '2026-05-11' },
// ];

// 작성일 포맷 변환 함수
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const parts = dateString.split(' ');
  if (parts.length !== 2) return dateString; // "yyyy-MM-dd HH:mm" 형식이 아니면 원본 반환

  const [year, month, day] = parts[0].split('-');
  const timePart = parts[1];

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');

  if (year === currentYear && month === currentMonth && day === currentDay) {
    return timePart; // 오늘이면 시간 반환 (HH:mm)
  } else if (year === currentYear) {
    return `${month}-${day}`; // 올해지만 오늘이 아니면 월일 반환 (MM-dd)
  } else {
    return year; // 지난 년도면 년도 반환 (yyyy)
  }
};

const BoardList = () => {
  const { category } = useParams();
  
  // 검색 조건과 검색어 상태 관리
  const [searchType, setSearchType] = useState('title');
  const [appliedSearchType, setAppliedSearchType] = useState('title'); // 백엔드에 실제로 보낼 확정된 검색 조건
  const [searchInput, setSearchInput] = useState(''); // 사용자가 키보드로 입력 중인 임시 글자
  const [searchTerm, setSearchTerm] = useState('');

  const [boardData, setBoardData] = useState([]);
  
  // 페이징 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // 백엔드에서 받아올 총 페이지 수
  const postsPerPage = 10; // 한 페이지당 보여줄 게시글 수

  // 로그인 상태 관리를 위한 state 추가
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

  // 로그인/로그아웃 상태 변경 감지
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };
    
    window.addEventListener('storage', checkAuth); // 다른 탭에서 변경 시 대응
    window.addEventListener('authChange', checkAuth); // 현재 탭 커스텀 이벤트 대응

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/boards`, {
          params: {
            category: category === '전체' ? '' : category,
            searchType: appliedSearchType,
            keyword: searchTerm,
            page: currentPage - 1, // ⚠️ Spring Boot 페이징은 0페이지부터 시작하므로 1을 뺍니다.
            size: postsPerPage // 백엔드에 한 페이지당 보여줄 개수를 명시적으로 요청합니다.
          }
        });
        
        // 백엔드 응답 구조(표준 Page, 커스텀 래퍼, HATEOAS 등)를 모두 고려하여 데이터를 추출합니다.
        const responseData = response.data.data || response.data; // 커스텀 래퍼 객체(ApiResponse 등)로 감싸져 있을 경우 대비
        
        setBoardData(responseData.content || (responseData._embedded && responseData._embedded.boards) || responseData);
        
        // 다양한 형태의 페이징 JSON 키값에서 총 페이지 수를 안전하게 가져옵니다.
        const fetchedTotalPages = responseData.totalPages 
                               || responseData.total_pages 
                               || (responseData.page && responseData.page.totalPages)
                               || (responseData.totalElements ? Math.ceil(responseData.totalElements / postsPerPage) : 1);
                               
        setTotalPages(fetchedTotalPages === 0 ? 1 : fetchedTotalPages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [category, currentPage, searchTerm, appliedSearchType]); // 검색어, 페이지 등이 바뀔 때마다 백엔드에 재요청

  // 카테고리 변경 감지 및 검색 상태 초기화
  const [prevCategory, setPrevCategory] = useState(category);
  if (category !== prevCategory) {
    setPrevCategory(category);
    setCurrentPage(1);
    setSearchInput(''); // 카테고리 변경 시 입력창 비우기
    setSearchTerm('');  // 카테고리 변경 시 검색 필터 해제
    setAppliedSearchType('title'); // 카테고리 변경 시 검색 조건 초기화
  }

  // 총 페이지 수 계산 및 페이지 번호 배열 생성
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleSearch = () => {
    setSearchTerm(searchInput); // '검색' 버튼을 누른 이 순간에만 입력된 글자를 실제 검색어로 확정!
    setAppliedSearchType(searchType); // 사용자가 선택한 검색 조건(title, content 등)도 확정
    setCurrentPage(1);          // 검색 결과가 나오면 1페이지로 이동
  };

  return (
    <div className="board-container">
      
      {/* --- 상단: 제목 영역 (검색창 제거됨) --- */}
      <div style={{ borderBottom: '2px solid #222', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>
          {category} 목록
        </h2>
      </div>

      {/* --- 중단: 게시글 테이블 --- */}
      <table className="board-table">
        <thead>
          <tr>
            <th width="10%">번호</th>
            <th width="15%">분류</th>
              <th width="40%">제목</th>
              <th width="20%">작성자</th>
              <th width="15%">작성일</th>
          </tr>
        </thead>
        <tbody>
          {boardData.length > 0 ? (
            boardData.map((board) => (
              <tr key={board.id}>
                <td>{board.id}</td>
                <td><span style={{ fontSize: '12px', padding: '3px 6px', backgroundColor: '#eee', borderRadius: '4px' }}>{board.category}</span></td>
                <td className="title-cell" style={{ textAlign: 'center' }}>
                  <Link to={`/detail/${board.id}`}>{board.title}</Link>
                </td>
                <td>{board.author}</td>
                <td>{formatDate(board.createdAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>검색된 게시글이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- 하단 1: 페이징 및 글쓰기 버튼 --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '20px' }}>
        <div style={{ width: '80px' }}></div> {/* 좌우 균형을 위한 빈 공간 */}
        
        {/* 페이징 영역 */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {pageNumbers.map(number => (
            <button 
              key={number} 
              onClick={() => setCurrentPage(number)}
              style={{ 
                padding: '5px 10px', 
                border: currentPage === number ? '1px solid #007bff' : '1px solid #ddd', 
                backgroundColor: currentPage === number ? '#007bff' : 'white', 
                color: currentPage === number ? 'white' : '#333', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              {number}
            </button>
          ))}
        </div>

        {/* 글쓰기 버튼 (공간은 항상 유지하여 페이징 중앙 정렬 보장) */}
        <div style={{ width: '80px', textAlign: 'right' }}>
          {isLoggedIn && (
            <Link to="/write">
              <button className="btn btn-primary">글쓰기</button>
            </Link>
          )}
        </div>
      </div>

      {/* --- 하단 2: 중앙 정렬된 검색창 영역 --- */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '20px 0', borderTop: '1px solid #eee' }}>
        
        {/* 검색 조건 드롭다운 */}
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
        >
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
        </select>

        {/* 검색어 입력창 */}
        <input 
          type="text" 
          placeholder="검색어를 입력하세요" 
          value={searchInput}
        onChange={(e) => {
            setSearchInput(e.target.value); // 여기서는 입력창의 글자 상태만 바꿉니다 (검색/페이지 이동 안함)
        }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '250px', fontSize: '14px', outline: 'none' }}
        />
        
        <button className="btn btn-secondary" onClick={handleSearch} style={{ padding: '8px 15px' }}>검색</button>
      </div>
    </div>
  );
};

export default BoardList;