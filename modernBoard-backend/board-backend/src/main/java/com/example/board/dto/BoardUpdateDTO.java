package com.example.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class BoardUpdateDTO {
	
	@NotBlank(message = "카테고리는 필수")
	private String category;
	@NotBlank(message = "제목을 입력해주세요")
	private String title;
	@NotBlank(message = "내용을 입력해주세요")
	private String content;
}
