package com.example.board.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.board.dto.BoardCommentDTO;
import com.example.board.dto.BoardCommentInsertDTO;
import com.example.board.security.CustomPrincipal;
import com.example.board.service.BoardCommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
	
	private final BoardCommentService boardCommentService;
	
	@GetMapping("/v1/{id}")
	public List<BoardCommentDTO> getCommentList(@PathVariable("id") Long id){
		return boardCommentService.getCommentList(id);
	}
	
	
	@PostMapping("/v1/posts")
	public void insertComment(@Valid @RequestBody BoardCommentInsertDTO dto,
							@AuthenticationPrincipal CustomPrincipal principal) {
		Long memberId = principal.getMemberId();
		
		boardCommentService.insertComment(dto, memberId);
	}

}
