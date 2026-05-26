package com.example.board.service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.board.dto.BoardCommentDTO;
import com.example.board.dto.BoardCommentInsertDTO;
import com.example.board.mapper.BoardCommentMapper;
import com.example.board.vo.BoardCommentVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardCommentService {
	
	private final BoardCommentMapper boardCommentMapper;
	
	public void insertComment(BoardCommentInsertDTO dto, Long memberId) {
		BoardCommentVO vo = new BoardCommentVO(dto.getBoardId(), dto.getParentId(), dto.getContent(), memberId);
		boardCommentMapper.insertComment(vo);
	}
	
	public List<BoardCommentDTO> getCommentList(Long id){
		return boardCommentMapper.getCommentList(id);
	}
}
