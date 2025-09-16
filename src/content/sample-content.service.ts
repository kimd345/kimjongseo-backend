// src/content/sample-content.service.ts - Add this service to seed sample content
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Content,
  ContentType,
  PublishStatus,
} from '../entities/content.entity';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class SampleContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async seedSampleContent(): Promise<void> {
    const existingContent = await this.contentRepository.count();
    if (existingContent > 0) {
      console.log('Sample content already exists, skipping seed');
      return;
    }

    const menus = await this.menuRepository.find();
    if (menus.length === 0) {
      console.log('No menus found, cannot seed content');
      return;
    }

    const sampleContents = [
      // 절재 김종서 장군 - 생애 및 업적
      {
        title: '김종서 장군의 어린 시절과 성장 배경',
        content: `# 김종서 장군의 어린 시절

절재(節齋) 김종서(金宗瑞, 1383~1453)는 조선 전기의 문신이자 무신으로, 고구려 유민의 후손입니다.

## 출생과 가문

김종서는 1383년(우왕 9년) 강원도 회양에서 태어났습니다. 그의 아버지는 김진으로, 고려 말의 문신이었습니다.

## 청년기의 학문 정진

어려서부터 총명하였던 김종서는 성리학을 깊이 연구하였으며, 특히 군사학에 뛰어난 재능을 보였습니다.

> "어려서부터 학문에 힘써 문무를 겸비한 인재로 성장하였다" - 조선왕조실록

## 과거 급제와 관직 진출

1405년(태종 5년) 문과에 급제하여 관직에 나아갔으며, 이후 다양한 관직을 역임하며 경험을 쌓았습니다.`,
        type: ContentType.ARTICLE,
        status: PublishStatus.PUBLISHED,
        category: '생애사',
        menuUrl: 'life',
        authorName: '김종서장군기념사업회',
        sortOrder: 1,
      },
      {
        title: '6진 개척의 위대한 업적',
        content: `# 6진 개척 - 김종서의 최대 업적

김종서 장군의 가장 큰 업적 중 하나는 함경도 6진을 개척하여 조선의 영토를 확장한 것입니다.

## 배경

15세기 초 조선은 북방 여진족의 침입에 시달리고 있었으며, 국경 지역의 안정이 시급한 상황이었습니다.

## 6진 개척 과정

1433년(세종 15년)부터 1449년(세종 31년)까지 약 16년간에 걸쳐 다음 6개 진을 설치했습니다:

1. **종성진**(鍾城鎭)
2. **온성진**(穩城鎭)  
3. **회령진**(會寧鎭)
4. **부령진**(富寧鎭)
5. **경원진**(慶源鎭)
6. **경흥진**(慶興鎭)

## 역사적 의의

이 개척 사업을 통해:
- 조선의 영토가 두만강까지 확장
- 여진족의 침입 차단
- 변경 지역의 안정화 달성
- 조선의 국방력 강화

![6진 위치도](https://example.com/6jin-map.jpg)

이러한 업적으로 김종서는 조선 최고의 변경 개척자로 평가받고 있습니다.`,
        type: ContentType.ARTICLE,
        status: PublishStatus.PUBLISHED,
        category: '주요업적',
        menuUrl: 'life',
        sortOrder: 2,
      },

      // 기념사업회 - 공지사항
      {
        title: '2024년 김종서 장군 추모제 개최 안내',
        content: `# 2024년 김종서 장군 추모제 개최

김종서장군기념사업회에서는 절재 김종서 장군의 571주기를 맞아 추모제를 개최합니다.

## 행사 개요

- **일시**: 2024년 10월 10일(목) 오전 10시
- **장소**: 서울특별시 종로구 김종서 기념관
- **주최**: 김종서장군기념사업회
- **후원**: 문화체육관광부, 서울특별시

## 행사 프로그램

### 1부: 추모 의식 (10:00~11:00)
- 개식사
- 헌화 및 분향
- 추도사
- 묵념

### 2부: 기념 행사 (11:00~12:00)
- 학술 발표: "김종서의 6진 개척과 현대적 의의"
- 전시회: 김종서 관련 유물 및 사료
- 체험 프로그램: 전통 활쟁이 시연

## 참가 신청

- **신청 기간**: 2024년 9월 15일 ~ 10월 5일
- **신청 방법**: 홈페이지 온라인 신청 또는 전화 접수
- **문의 전화**: 02-1234-5678

많은 관심과 참여 부탁드립니다.`,
        type: ContentType.ANNOUNCEMENT,
        status: PublishStatus.PUBLISHED,
        category: '행사안내',
        menuUrl: 'announcements',
        sortOrder: 1,
      },

      // 자료실 - 보도자료
      {
        title: '김종서 장군 서거 571주기 추모식 성료',
        content: `# 김종서 장군 서거 571주기 추모식 성황리에 마무리

김종서장군기념사업회(회장 김○○)는 지난 10월 10일 서울 종로구 김종서 기념관에서 절재 김종서 장군의 서거 571주기 추모식을 성황리에 개최했다고 밝혔다.

## 추모식 개요

이날 추모식에는 유족, 학계 인사, 시민 등 200여 명이 참석하여 조선 전기 명재상이자 6진 개척의 영웅인 김종서 장군의 업적을 기리고 그의 정신을 계승하겠다는 의지를 다졌다.

## 주요 내용

김○○ 회장은 추도사에서 "김종서 장군의 나라사랑 정신과 개척 정신은 오늘날에도 우리가 본받아야 할 소중한 가치"라며 "기념사업회는 장군의 정신을 후세에 전하는 일에 최선을 다하겠다"고 말했다.

이어진 학술 발표에서는 ○○대학교 사학과 ○○○ 교수가 "6진 개척이 현대 국경 정책에 주는 시사점"을 주제로 발표하여 참석자들의 큰 호응을 얻었다.

## 향후 계획

기념사업회는 내년에 김종서 장군 탄신 642주기를 맞아 더욱 뜻깊은 기념행사를 준비할 예정이라고 밝혔다.

**문의**: 김종서장군기념사업회 02-1234-5678`,
        type: ContentType.PRESS_RELEASE,
        status: PublishStatus.PUBLISHED,
        category: '행사소식',
        menuUrl: 'press',
        sortOrder: 1,
      },

      // 영상 콘텐츠
      {
        title: '김종서 장군의 6진 개척 다큐멘터리',
        content: `# 김종서 장군의 6진 개척 - 역사 다큐멘터리

조선 세종대왕 시대의 위대한 업적 중 하나인 6진 개척의 전 과정을 상세히 다룬 다큐멘터리입니다.

## 영상 소개

이 다큐멘터리는 KBS와 김종서장군기념사업회가 공동 제작한 것으로, 15세기 조선의 북방 개척 과정을 생생하게 재현했습니다.

### 주요 내용
- 6진 개척의 역사적 배경
- 김종서의 리더십과 전략
- 현지 촬영을 통한 6진 위치 확인
- 전문가 인터뷰 및 해설

### 제작진
- **기획**: 김종서장군기념사업회
- **제작**: KBS 역사스페셜팀
- **연출**: ○○○ PD
- **해설**: ○○○ 아나운서

이 영상을 통해 김종서 장군의 위대한 업적을 새롭게 조명해보시기 바랍니다.`,
        type: ContentType.VIDEO,
        status: PublishStatus.PUBLISHED,
        category: '역사영상',
        youtubeId: 'dQw4w9WgXcQ', // 예시 YouTube ID
        menuUrl: 'archive',
        sortOrder: 1,
      },

      // 학술자료
      {
        title: '김종서의 정치사상과 경세관에 관한 연구',
        content: `# 김종서의 정치사상과 경세관에 관한 연구

## 초록

본 연구는 조선 전기 문신인 김종서(1383-1453)의 정치사상과 경세관을 체계적으로 분석한 것이다. 김종서는 6진 개척으로 유명하지만, 그의 정치 철학과 경세관 역시 조선 전기 정치사상사에 중요한 위치를 차지한다.

## 연구 방법

본 연구는 다음과 같은 방법론을 사용하였다:
- 『조선왕조실록』의 김종서 관련 기록 분석
- 김종서의 상소문 및 건의서 검토
- 동시대 인물들의 평가 종합

## 주요 연구 결과

### 1. 실용주의적 정치관
김종서는 이론보다는 실무를 중시하는 실용주의적 정치관을 보였다. 이는 6진 개척 과정에서 나타난 현실적 판단력에서 확인할 수 있다.

### 2. 민본주의 사상
김종서는 백성을 나라의 근본으로 보는 민본주의 사상을 견지했다. 특히 변경 지역 주민들의 생활 안정을 중시했다.

### 3. 국방 중시 사상
외침에 대비한 국방력 강화를 지속적으로 주장했으며, 이는 6진 개척으로 구현되었다.

## 결론

김종서의 정치사상은 조선 전기의 현실주의적 정치 철학을 대표하며, 오늘날에도 시사하는 바가 크다.

**참고문헌**
- 『조선왕조실록』
- 이○○, 『조선전기 정치사상사』, ○○출판사, 2020
- 김○○, 「김종서의 경세관 연구」, 『한국사연구』 180호, 2018`,
        type: ContentType.ACADEMIC_MATERIAL,
        status: PublishStatus.PUBLISHED,
        category: '정치사상',
        metadata: {
          author: '○○○',
          journal: '한국사학보',
          year: '2024',
          pages: '45-78',
        },
        menuUrl: 'academic',
        sortOrder: 1,
      },
    ];

    for (const contentData of sampleContents) {
      // Find the menu by URL
      const menu = menus.find((m) => m.url === contentData.menuUrl);
      if (!menu) continue;

      const content = this.contentRepository.create({
        title: contentData.title,
        content: contentData.content,
        type: contentData.type,
        status: contentData.status,
        category: contentData.category,
        authorName: contentData.authorName,
        sortOrder: contentData.sortOrder,
        menuId: menu.id,
        youtubeId: contentData.youtubeId,
        metadata: contentData.metadata,
        publishedAt: new Date(),
      });

      await this.contentRepository.save(content);
    }

    console.log('Sample content created successfully');
  }
}
