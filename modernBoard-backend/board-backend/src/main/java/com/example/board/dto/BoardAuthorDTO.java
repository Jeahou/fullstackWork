package com.example.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class BoardAuthorDTO {
	private Long id;
	private String category;
	private String title;
	private String content;
	private String author;
	private String createdAt;
}
