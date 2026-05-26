package com.example.board.dto.member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class BoardMemberInfoDTO {
	private Long memberId;
	private String email;
	private String nickName;
	private String name;
	private String role;
}
