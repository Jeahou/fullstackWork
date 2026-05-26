package com.example.board.dto.member;

import com.example.board.vo.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class BoardMemberLoginDTO {
	private String email;
	private String password;
}
