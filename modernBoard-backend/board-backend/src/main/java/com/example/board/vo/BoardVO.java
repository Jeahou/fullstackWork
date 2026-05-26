package com.example.board.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BoardVO {
	private Long id;
	private String category;
	private String title;
	private String content;
	private Long memberId;
	private LocalDateTime createdAt;
	
	@Builder
	public BoardVO(String category, String title, String content, Long memberId) {
		this.category = category;
		this.title = title;
		this.content = content;
		this.memberId = memberId;
	}
	
	@Builder
	public BoardVO(Long id, String category, String title, String content) {
		this.id = id;
		this.category = category;
		this.title = title;
		this.content = content;
	}
}
