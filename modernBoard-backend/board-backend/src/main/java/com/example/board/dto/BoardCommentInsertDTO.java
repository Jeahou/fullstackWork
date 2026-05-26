package com.example.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class BoardCommentInsertDTO {
	private Long boardId;
	private Long parentId;
	private String content;
}
