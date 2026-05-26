package com.example.board.dto.token;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDTO {
	private String accessToken;
	private String refreshToken;
}
