package com.example.board.vo;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
	
	USER("ROLE_USER", "일반사용자"),
	ADMIN("ROLE_ADMIN", "관리자"),
	MANAGER("ROLE_MANAGER", "게시판 일정권한");
	
	//이게 뭐인지 정리
	private final String key;
	private final String title;
}
