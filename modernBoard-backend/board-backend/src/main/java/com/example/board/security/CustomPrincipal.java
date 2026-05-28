package com.example.board.security;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class CustomPrincipal implements OAuth2User {
	private final Long memberId;
	private final String email;
	private final Map<String, Object> attributes;
	
	public CustomPrincipal(Long memberId, String email) {
		this.memberId = memberId;
		this.email = email;
		this.attributes = null;
	}
	
	public CustomPrincipal(Long memberId, String email, Map<String, Object> attributes) {
		this.memberId = memberId;
		this.email = email;
		this.attributes = attributes;
	}
	
	@Override
    public Map<String, Object> getAttributes() {
        return this.attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return this.email; 
    }
}
