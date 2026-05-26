package com.example.board.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.board.security.JwtFilter;
import com.example.board.security.JwtProvider;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	
	private final JwtProvider jwtProvider;
	
	@Bean
	public BCryptPasswordEncoder bCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
		http
			.csrf(csrf -> csrf.disable()) //리액트 sts연동을 위해 열어둠 
			
			.formLogin(form -> form.disable())
			.httpBasic(basic -> basic.disable())
			
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			
			.authorizeHttpRequests(auth -> auth
					//누구나 접근 가능한 완전히 개방된 API (로그인, 회원가입, 비밀번호 찾기 등)
				    .requestMatchers("/api/member/login", "/api/member/register").permitAll()
				    
				    // 로그인 안 해도 '조회(GET)'는 가능하지만, '쓰기/수정/삭제(POST/PUT/DELETE)'는 막아야 하는 게시판 API
				    // GET 요청 중에서 목록(/api/board)과 상세조회(/api/board/*)는 모두에게 열어줍니다.
				    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/boards", "/api/boards/**","/api/comments/**").permitAll()
				    
				    //그 외의 모든 요청(글쓰기, 댓글달기, 내 정보 조회 등)은 "무조건 토큰이 있어야만" 통과!
				    .anyRequest().authenticated()
					)
			
			.addFilterBefore(new JwtFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}
}
