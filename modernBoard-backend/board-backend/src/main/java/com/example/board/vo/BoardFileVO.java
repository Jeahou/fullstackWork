package com.example.board.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardFileVO {
	private Long id;
	private Long boardId;
	private String originalName;
	private String savedName;
	private String filePath;
	private Long fileSize;
}
