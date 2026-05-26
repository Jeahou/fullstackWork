## 🏃‍♂️ 실행 방법 (How to Run)

### 1. Database Setup

- `backend/src/main/resources/schema.sql` 스크립트를 로컬 오라클 DB에서 실행합니다.

### 2. Backend Setup

- `backend/src/main/resources/application-template.properties` 파일을 복사하여 `application.properties` 파일을 생성합니다.
- 생성한 파일에 본인의 로컬 DB 계정 및 비밀번호를 입력합니다.
- STS 또는 인텔리제이에서 프로젝트를 로드한 뒤 빌드 및 실행합니다. (Port: 8000)

### 3. Frontend Setup

- `frontend` 폴더로 이동합니다.
- 터미널에 `yarn install`을 입력하여 의존성 라이브러리를 설치합니다.
- `yarn dev` 명령어로 리액트 서버를 실행합니다. (Port: 3000) -`yarn` 추가 프로그램 설치 axio, dompurity, react-quill
