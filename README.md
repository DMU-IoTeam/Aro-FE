# Aro (아로) - 낙상 감지 AI 로봇 보호자 전용 앱

![Logo](https://img.shields.io/badge/Aro-FE-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-0.79.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?style=for-the-badge&logo=typescript)

**Aro(아로)**는 홀로 계신 어르신이나 거동이 불편한 피보호자를 위한 **낙상 감지 AI 로봇의 보호자 전용 애플리케이션**입니다. 로봇과 연동되어 피보호자의 안전을 실시간으로 확인하고, 일상 생활(복약, 일정, 건강 상태)을 체계적으로 관리할 수 있도록 돕습니다.

---

## 🚀 주요 기능 (Key Features)

### 🚨 실시간 낙상 감지 및 응급 알림
- AI 로봇이 낙상을 감지하면 즉시 보호자의 스마트폰으로 푸시 알림을 발송합니다.
- 긴급 상황 시 즉각적인 대응이 가능하도록 낙상 발생 화면 및 로봇의 상태 정보를 제공합니다.

### 💊 체계적인 복약 관리
- 복용해야 하는 약의 종류와 시간을 설정할 수 있습니다.
- 피보호자가 실제 복용했는지 여부를 실시간으로 확인하고, 미복용 시 알림을 통해 체크할 수 있습니다.

### 📋 데일리 건강 체크 (문진)
- 피보호자에게 매일 건강 관련 질문을 던지고, 그 답변을 보호자가 앱에서 확인할 수 있습니다.
- 건강 변화 추이를 확인하여 질병 예방 및 조기 대응을 지원합니다.

### 🗓 외부 일정 관리
- 병원 내원, 정기 모임 등 피보호자의 주요 외부 일정을 등록하고 관리합니다.
- 일정이 겹치거나 잊지 않도록 도와주는 스케줄러 기능을 제공합니다.

### 🖼 활동 지원 (사진 업로드)
- 로봇의 대화나 게임 등에 활용될 가족 사진 및 추억이 담긴 이미지를 업로드할 수 있습니다.
- 피보호자의 정서적 안정을 돕는 개인화된 콘텐츠를 로봇으로 전달합니다.

### 🤖 로봇 상태 모니터링
- 로봇의 네트워크 상태, 배터리 잔량 등 하드웨어 상태를 실시간으로 확인합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React Native (0.79.2)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Styled-components, StyleSheet
- **Navigation**: React Navigation (Native Stack)
- **HTTP Client**: Axios

### Operations & Infrastructure
- **Push Notification**: Firebase Cloud Messaging (FCM), Notifee
- **Social Login**: Kakao SDK
- **Environment**: react-native-dotenv

---

## 📂 프로젝트 구조 (Project Structure)

```text
arofe/
├── __tests__/          # 단위 테스트 파일
├── android/            # 안드로이드 네이티브 코드
├── ios/                # iOS 네이티브 코드
├── api/                # API 통신 모듈 (Axios 인스턴스)
├── assets/             # 이미지, 폰트 등 정적 리소스
├── components/         # 재사용 가능한 UI 컴포넌트
├── configs/            # 앱 설정 코드 (환경변수 등)
├── constants/          # 공통 상수 (컬러, 텍스트 등)
├── hooks/              # 커스텀 훅
├── layouts/            # 화면 공통 레이아웃
├── screen/             # 주요 화면 컴포넌트
├── store/              # Zustand 상태 저장소
├── types/              # TypeScript 타입 정의
├── App.tsx             # 앱 엔트리 포인트 및 네비게이션 설정
└── index.js            # React Native 시작점
```

---

## ⚙️ 시작하기 (Getting Started)

### 환경 요구 사항 (Prerequisites)
- [Node.js](https://nodejs.org/) (>= 18)
- [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment)

### 환경 변수 설정 (Environment Variables)
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 변수를 설정합니다. (`.env.example` 참고)
```bash
REACT_APP_API_BASE_URL=여기에_배포된_API_주소를_입력하세요
```

### 설치 (Installation)
```bash
# 의존성 설치
yarn install

# iOS 의존성 설치 (macOS)
cd ios && pod install && cd ..
```

### 실행 (Running)
```bash
# Metro 서버 시작
yarn start

# Android 실행
yarn android

# iOS 실행
yarn ios
```

---

## 📄 라이선스 (License)

이 프로젝트의 소유권은 **Aro Team**에 있습니다.
