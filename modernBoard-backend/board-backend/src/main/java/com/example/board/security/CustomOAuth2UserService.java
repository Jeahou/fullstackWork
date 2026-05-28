package com.example.board.security;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.example.board.mapper.BoardMemberMapper;
import com.example.board.util.NicknameUtil;
import com.example.board.vo.BoardMemberVO;
import com.example.board.vo.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
	
	private final BoardMemberMapper memberMapper;
	
	private final BCryptPasswordEncoder bCryptPasswordEncoder;
	
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException{
		OAuth2User oAuth2User = super.loadUser(userRequest);
		Map<String, Object> attributes = oAuth2User.getAttributes();
		
		String email = (String) attributes.get("email");
		String name = (String) attributes.get("name");
		String snsId = (String) attributes.get("sub");
		BoardMemberVO memberVo = memberMapper.getbyEmailBoardMember(email);
		
		if(memberVo == null) {
			
			String dummyPassword = bCryptPasswordEncoder.encode(UUID.randomUUID().toString());
			
			BoardMemberVO newVo = BoardMemberVO.builder()
									.email(email)
									.name(name)
									.nickName(NicknameUtil.generateRandomNickname())
									.password(dummyPassword)
									.snsId(snsId)
									.snsType("GOOGLE")
									.role(Role.USER)
									.build();
			
			memberMapper.insertMember(newVo);
			
			memberVo = memberMapper.getbyEmailBoardMember(email);
		}
		
	
		return new CustomPrincipal(memberVo.getId(), memberVo.getEmail(), attributes);
	}
}
