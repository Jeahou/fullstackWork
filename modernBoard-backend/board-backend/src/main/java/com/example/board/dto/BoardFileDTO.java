package com.example.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class BoardFileDTO {
	private Long id;
	private Long boardId;
	private String originalName;
	private String savedName;
	private String filePath;
	private Long fileSize;
}
