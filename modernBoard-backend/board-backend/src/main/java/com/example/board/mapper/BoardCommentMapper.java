package com.example.board.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.board.dto.BoardCommentDTO;
import com.example.board.vo.BoardCommentVO;

@Mapper
public interface BoardCommentMapper {
	
	List<BoardCommentDTO> getCommentList(Long id);
	
	void insertComment(BoardCommentVO vo);
}
