package com.example.board.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler{
	
	private final JwtProvider jwtProvider;
	
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
										Authentication authentication) throws IOException{
		
		CustomPrincipal principal = (CustomPrincipal) authentication.getPrincipal();
		Long memberId = principal.getMemberId();
		String email = principal.getEmail();
		
		String role = principal.getAuthorities().iterator().next().getAuthority();
		
		String jwt = jwtProvider.creatAccessToken(email, role, memberId);
		
		String targetUrl = "http://localhost:5173/oauth2/redirect?token=" + jwt;
        
        response.sendRedirect(targetUrl);
	}
}
