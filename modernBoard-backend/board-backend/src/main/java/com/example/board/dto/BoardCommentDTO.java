package com.example.board.dto;

import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardCommentDTO {
	
	private Long id;
	private Long boardId;
	private Long parentId;
	private Integer lvl;
	private String content;
	private String author;
	private String createdAt;
}
