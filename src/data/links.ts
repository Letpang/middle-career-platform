// 센터 · 외부 사이트 · 교육기관 링크 모음
// 내용을 바꿀 때는 이 파일만 고치면 됩니다.

export interface Center {
  region: '고양' | '파주';
  centerName: string;
  address: string;
  phone: string;
  hours: string;
}

export const CENTERS: Center[] = [
  {
    region: '고양',
    centerName: '고양상공회의소 중장년내일센터',
    address: '경기도 고양시 일산동구 고봉로 32-16, 고양고용복지+센터 1층',
    phone: '031-901-9197',
    hours: '평일 09:00 ~ 18:00',
  },
  {
    region: '파주',
    centerName: '파주상공회의소 중장년내일센터',
    address: '파주시 중앙로328 MH타워8층(파주고용복지플러스센터 내)',
    phone: '031-8071-4245',
    hours: '평일 09:00 ~ 17:30',
  },
];

// access: open = 회원가입 없이 공고 열람 / login = 회원가입·로그인 후 열람 / undefined = 확인 전
export interface LinkSite {
  name: string;
  url: string;
  desc: string;
  access?: 'open' | 'login';
}

export interface LinkGroup {
  category: string;
  note?: string;
  sites: LinkSite[];
}

export const JOB_SITES: LinkGroup[] = [
  {
    category: '종합 중장년·시니어 채용',
    sites: [
      { name: '원더풀시니어', url: 'https://senior.saramin.co.kr/', desc: '사람인 중장년 전용 채용관', access: 'open' },
      { name: '서울시 50+포털', url: 'https://50plus.or.kr/', desc: '서울시 시니어일자리지원센터 채용정보', access: 'open' },
      { name: '알바몬 중장년관', url: 'https://www.albamon.com/jobs/senior', desc: '40~60대 우대 일자리', access: 'open' },
    ],
  },
  {
    category: '공공·사회활동형 시니어 일자리',
    sites: [
      { name: '노인일자리여기', url: 'https://www.seniorro.or.kr/', desc: '한국노인인력개발원 운영, 60세 이상 공공형·사회서비스형·시장형 일자리 통합검색' },
      { name: '경기도 노인일자리지원센터', url: 'https://www.ggseniorjob.or.kr/', desc: '경기도(고양·파주·김포 포함) 노인일자리 사업 안내' },
    ],
  },
  {
    category: '요양보호사·간병·간호',
    note: '이 분야 사이트는 대부분 회원가입 후에 상세 공고를 볼 수 있어요. 가입이 부담되시면 위의 고용24 공고(요양보호사·간병·간호 직종)를 먼저 확인해 보세요.',
    sites: [
      { name: '너스잡', url: 'https://www.nursejob.co.kr/', desc: '간호사·간호조무사·요양보호사 전문' },
      { name: '케어파트너', url: 'https://www.carepartner.kr/jobs', desc: '방문·입주·시설요양 채용' },
      { name: '엔젤시터', url: 'https://angelsitter.co.kr/', desc: '요양보호사·사회복지사 구인구직' },
      { name: '요양나라', url: 'https://www.yoyangnara.com/', desc: '요양보호사 구인구직' },
      { name: '한국요양보호협회', url: 'http://www.silvercare.org/job/recruit.asp', desc: '협회 자체 구인 게시판' },
      { name: '복지넷', url: 'https://www.bokji.net/job/off/01.bokji', desc: '한국사회복지협의회 운영' },
    ],
  },
  {
    category: '주택관리(관리소장)',
    note: '주택관리 협회 사이트는 회원가입을 해야 구인 정보를 볼 수 있어요.',
    sites: [
      { name: '대한주택관리사협회', url: 'https://www.khma.org/', desc: '전국 공동주택 관리소장 구인', access: 'login' },
      { name: '한국주택관리협회', url: 'https://www.kabma.or.kr/', desc: '주택관리 분야 구인 게시판' },
    ],
  },
  {
    category: '경비·시설관리',
    note: '일부 협회 사이트는 회원가입 후에 구인 정보를 볼 수 있어요. 경비·시설관리 공고는 고용24에도 많이 올라와 있습니다.',
    sites: [
      { name: '한국경비협회', url: 'https://www.ksan.or.kr/comm/job.do', desc: '경비업 구인정보' },
      { name: '대한민국경비협회', url: 'https://www.roksa.or.kr/', desc: '경비업 구인·구직 정보' },
      { name: '시설잡', url: 'https://sisuljob.kr/', desc: '시설관리 전문 구인구직' },
    ],
  },
];

// 관내 고용센터 채용행사 달력 (기관이 등록한 행사는 사이트 달력에 따로 표시됩니다)
export const EVENT_SITES: LinkSite[] = [
  {
    name: '고양고용센터 채용행사',
    url: 'https://www.work.go.kr/goyang/newsPlace/ctrEvent/empEventCal.do?subNaviMenuCd=20100',
    desc: '고양시 관할 채용박람회·구인구직 만남의 날·동행면접 (031-920-3937)',
    access: 'open',
  },
  {
    name: '파주고용센터 채용행사',
    url: 'https://www.work.go.kr/paju/newsPlace/ctrEvent/empEventCal.do?subNaviMenuCd=20100',
    desc: '파주시 관할 채용박람회·구인구직 만남의 날·동행면접 (031-860-0401)',
    access: 'open',
  },
  {
    name: '김포고용복지+센터 채용행사',
    url: 'https://www.work.go.kr/gimpo/newsPlace/ctrEvent/empEventCal.do?subNaviMenuCd=20100',
    desc: '김포시 관할 일자리 수요데이·구인구직 만남의 날 등',
    access: 'open',
  },
  {
    name: '고용24 전국 채용행사',
    url: 'https://www.work24.go.kr/wk/a/f/1100/retrieveEmpEventList.do',
    desc: '전국 채용박람회·중장년 일자리박람회 목록 (지역 선택 가능)',
    access: 'open',
  },
];

export const EDUCATION_SITES: LinkGroup[] = [
  {
    category: '고양시',
    sites: [
      { name: '고양시 평생학습포털', url: 'https://www.goyang.go.kr/edu/index.do', desc: '평생학습 강좌 안내 및 신청' },
      { name: '고양시 신중년대학', url: 'https://www.goyang.go.kr/edu/M000050/S001/conts.do', desc: '50~65세 대상, 관내 대학 연계 특화과정' },
      { name: '국제대학교 평생교육원', url: 'https://dept.kookje.ac.kr/lifelong/', desc: '고양시 소재 대학 평생교육원' },
      { name: '동국대학교 바이오메디캠퍼스', url: 'https://bmc.dongguk.edu/main', desc: '고양시 일산동구 소재 관내 대학 (의생명 특화 캠퍼스, 평생교육원 운영)' },
      { name: '고양여성인력개발센터(새일센터)', url: 'https://www.kycenter.or.kr/', desc: '경력단절 여성 재취업 상담·훈련·인턴십' },
      { name: '경기도기술학교 북부캠퍼스', url: 'https://www.gjftech.or.kr/', desc: '고양시 덕양구 창조혁신캠퍼스, 경기북부 직업훈련 거점 (전기설비·시스템냉난방·공조냉동 등 취업연계 훈련)' },
    ],
  },
  {
    category: '파주시',
    sites: [
      { name: '파주시 평생교육포털', url: 'https://lll.paju.go.kr/', desc: '평생학습관 강좌 일정 및 신청' },
      { name: '두원공과대학교 평생교육원', url: 'http://lifeedu.doowon.ac.kr/', desc: '파주캠퍼스 평생교육원 (031-935-7209)' },
      { name: '서영대학교 미래평생교육원', url: 'https://www.seoyeong.ac.kr/pjlife/main.do', desc: '파주시 월롱면 파주캠퍼스, 50·60 인생설계 과정 등' },
      { name: '파주새일센터', url: 'https://saeil.mogef.go.kr/', desc: '여성새로일하기센터, 재취업 상담·훈련 (031-942-0281)' },
      { name: '경기인력개발원', url: 'https://kg.korchamhrd.net/', desc: '파주시 운정신도시, 대한상공회의소 운영 국비지원 직업훈련 (전기·기계·정보통신 등, 031-940-6800)' },
    ],
  },
  {
    category: '김포시',
    sites: [
      { name: '김포시 평생교육 통합 플랫폼', url: 'https://gimpo.gseek.kr/', desc: '취업·창업 자격증 등 정규강좌' },
      { name: '김포대학교 평생교육원', url: 'https://cec.ukp.ac.kr/', desc: '대학 연계 평생교육 프로그램' },
      { name: '김포새일센터', url: 'https://gimpo.go.kr/portal/contents.do?key=1274', desc: '여성새로일하기센터, 재취업 상담·훈련 (031-996-7607)' },
    ],
  },
  {
    category: '서울 강서구',
    sites: [
      {
        name: '한국폴리텍대학 서울강서캠퍼스 중장년특화과정',
        url: 'https://www.kopo.ac.kr/kangseo/content.do?menu=8847',
        desc: '만 40세 이상 구직희망자 대상 전액 국비 직업훈련 (시니어헬스케어·한식조리·건축목공 등, 1588-2282)',
      },
    ],
  },
];
