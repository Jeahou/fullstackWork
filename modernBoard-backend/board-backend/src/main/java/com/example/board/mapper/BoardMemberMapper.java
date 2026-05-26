package com.example.board.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.board.vo.BoardMemberVO;

@Mapper
public interface BoardMemberMapper {
	
	BoardMemberVO getbyEmailBoardMember(String email);
	
	BoardMemberVO getbyIdBoardMember(Long id);
	
	void insertMember(BoardMemberVO vo);
}
