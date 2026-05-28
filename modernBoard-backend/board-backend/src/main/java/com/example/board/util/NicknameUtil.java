package com.example.board.util;

import java.util.Random;

public class NicknameUtil {
	
	private static final String[] ADJECTIVES = {
	        "행복한", "즐거운", "용감한", "신비로운", "빛나는", 
	        "멋진", "뛰어난", "활기찬", "지혜로운", "신나는"
	    };

	    // 2. 랜덤하게 조합될 명사 리스트
	    private static final String[] NOUNS = {
	        "오리", "고양이", "강아지", "하마", "호랑이", 
	        "금붕어", "고래", "사자", "다람쥐", "원숭이"
	    };

	    private static final Random RANDOM = new Random();

	    /**
	     * 랜덤 닉네임을 생성하여 반환합니다.
	     * 예: "행복한_개발자_8231"
	     */
	    public static String generateRandomNickname() {
	        // 형용사와 명사 배열에서 각각 랜덤하게 하나씩 뽑기
	        String adjective = ADJECTIVES[RANDOM.nextInt(ADJECTIVES.length)];
	        String noun = NOUNS[RANDOM.nextInt(NOUNS.length)];
	        
	        // 1000 ~ 9999 사이의 4자리 난수 생성
	        int number = 1000 + RANDOM.nextInt(9000); 

	        // 언더바(_)로 연결하여 최종 닉네임 완성
	        return adjective + "_" + noun + "_" + number;
	    }
}
