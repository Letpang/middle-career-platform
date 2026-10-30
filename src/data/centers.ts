// 전국 중장년내일센터 28개소 (2026년 배정 명단, 사장님 제공 2026-10-30)
// 주소·전화는 고용24 센터소개 https://www.work24.go.kr/wk/u/a/1000/seniorCenterInfo.do 에서 가져옴.
// 상담 신청 화면에서 아직 계정이 없는 센터도 고를 수 있게 씁니다. 계정이 있으면 그 계정이 대신 나옵니다.
// sido 는 regions.ts 의 시·도 이름에 맞춥니다 (광주·전남 → 전남광주).

import { SIDO, type Region } from './regions';

export interface NationalCenter {
  sido: string;
  name: string;
  operator: string; // 운영기관 (예: 고양상공회의소)
  address: string;
  phone: string;
}

export const NATIONAL_CENTERS: NationalCenter[] = [
  { sido: '서울', name: '한국경영혁신중소기업협회 중장년내일센터', operator: '한국경영혁신중소기업협회', address: '서울 중구 삼일대로 363, 3층 (장교동, 서울고용복지플러스센터)', phone: '02-2004-7340' },
  { sido: '서울', name: '한국커리어 서울동부 중장년내일센터', operator: '한국커리어 서울동부', address: '서울 송파구 중대로 135(가락동) IT벤처타워 3층', phone: '02-2142-8983' },
  { sido: '서울', name: '한경협 중소기업협력센터 중장년내일센터', operator: '한경협 중소기업협력센터', address: '서울 영등포구 여의대로24 FKI타워 46층', phone: '02-2055-4264' },
  { sido: '경기', name: '경기경영자총협회 중장년내일센터', operator: '경기경영자총협회', address: '경기 용인시 기흥구 강남로 3, 강남앤플러스빌딩 2층(구갈동, 용인고용복지플러스센터)', phone: '031-289-2277' },
  { sido: '경기', name: '경기동부상공회의소 중장년내일센터', operator: '경기동부상공회의소', address: '경기 의정부시 시민로49, 2층(가능동, 의정부고용복지플러스센터)', phone: '031-837-2719' },
  { sido: '경기', name: '고양상공회의소 중장년내일센터', operator: '고양상공회의소', address: '경기 고양시 일산동구 고봉로 32-16, 1층', phone: '031-901-9197' },
  { sido: '경기', name: '파주상공회의소 중장년내일센터', operator: '파주상공회의소', address: '경기 파주시 중앙로 328, 8층 (금촌동, 파주고용복지플러스센터)', phone: '031-8071-4245' },
  { sido: '경기', name: '안산상공회의소 중장년내일센터', operator: '안산상공회의소', address: '경기 안산시 단원구 적금로120, 안산상공회의소 A동 3층(고잔동)', phone: '031-410-3031' },
  { sido: '경기', name: '평택상공회의소 중장년내일센터', operator: '평택상공회의소', address: '경기 평택시 경기대로 1194, 2층 (이충동, 평택고용복지플러스센터)', phone: '031-646-1046' },
  { sido: '인천', name: '인천경영자총협회 중장년내일센터', operator: '인천경영자총협회', address: '인천 계양구 장제로 804 영산빌딩 4층(계산동, 인천고용복지플러스센터)', phone: '032-540-5760' },
  { sido: '경기', name: '부천지역노사발전협의회 중장년내일센터', operator: '부천지역노사발전협의회', address: '경기도 부천시 원미구 길주로 351, 4층(중동, 부천고용복지플러스센터)', phone: '032-310-8891' },
  { sido: '강원', name: '사회적협동조합희망리본 중장년내일센터', operator: '사회적협동조합희망리본', address: '강원 강릉시 강릉대로 176(강릉고용복지플러스센터)', phone: '033-735-0971' },
  { sido: '부산', name: '부산경영자총협회 중장년내일센터', operator: '부산경영자총협회', address: '부산 부산진구 중앙대로 900, 12층 (양정동, 양정타임스퀘어)', phone: '051-647-0453' },
  { sido: '경남', name: '경남경영자총협회 중장년내일센터', operator: '경남경영자총협회', address: '경남 창원시 성산구 중앙대로 228번길 6, 센트랄빌딩 5층', phone: '055-266-8317' },
  { sido: '울산', name: '울산양산경영자총협회 중장년내일센터', operator: '울산양산경영자총협회', address: '울산 남구 대학로 60, 3층 (무거동)', phone: '052-277-9491' },
  { sido: '경남', name: '한국커리어 거제 중장년내일센터', operator: '한국커리어 거제', address: '경남 거제시 거제중앙로 31길 6-1, 보배빌딩 2층', phone: '055-632-2254' },
  { sido: '대구', name: '달구벌여성인력개발센터 중장년내일센터', operator: '달구벌여성인력개발센터', address: '대구 서구 서대구로9(대구서부고용복지+센터)', phone: '053-605-6489' },
  { sido: '경북', name: '경북경영자총협회 경북동부 중장년내일센터', operator: '경북경영자총협회 경북동부', address: '경북 포항시 남구 희망대로 711(상도동), 대운개발빌딩 3층', phone: '054-727-2020' },
  { sido: '경북', name: '경북경영자총협회 중장년내일센터', operator: '경북경영자총협회', address: '경북 구미시 백산로118, 3층(송정동, 구미고용복지플러스센터)', phone: '054-461-5519' },
  { sido: '경북', name: '경북경영자총협회 경북북부 중장년내일센터', operator: '경북경영자총협회 경북북부', address: '경북 안동시 경동로 400, 2층(안동고용복지플러스센터)', phone: '054-852-5910' },
  { sido: '전남광주', name: '광주경영자총협회 중장년내일센터', operator: '광주경영자총협회', address: '광주 북구 금남로 121, 1층 (북동, 광주고용복지플러스센터)', phone: '062-609-8964' },
  { sido: '전남광주', name: '목포상공회의소 중장년내일센터', operator: '목포상공회의소', address: '전남 목포시 평화로 5, 2층 (상동, 목포고용복지플러스센터)', phone: '061-280-0556' },
  { sido: '전남광주', name: '전남경영자총협회 중장년내일센터', operator: '전남경영자총협회', address: '전남 순천시 우석로 7, 2층 (덕월동, 청암대학교 건강복지관)', phone: '061-741-0096' },
  { sido: '전북', name: '전북경영자총협회 중장년내일센터', operator: '전북경영자총협회', address: '전북 익산시 익산대로 52길 11, 2층(익산고용센터)', phone: '063-840-6577' },
  { sido: '대전', name: '대전충남경영자총협회 중장년내일센터', operator: '대전충남경영자총협회', address: '대전 중구 계백로 1712, 6층 (문화동, 기독교연합봉사회관)', phone: '042-253-7051' },
  { sido: '충북', name: '충북경영자총협회 중장년내일센터', operator: '충북경영자총협회', address: '충북 청주시 흥덕구 직지대로 436번길 76, 직지스마트타워 908호', phone: '043-270-7500' },
  { sido: '충남', name: '충남북부상공회의소 중장년내일센터', operator: '충남북부상공회의소', address: '충남 아산시 배방읍 배방로 22, 삼영빌딩 5층', phone: '041-559-5766' },
  { sido: '충남', name: '충남경제진흥원 중장년내일센터', operator: '충남경제진흥원', address: '충남 예산군 삽교읍 의향로 359, 서산고용센터', phone: '041-661-5657' },
];

// 센터 주소에서 지역 값('경기 고양시')을 찾습니다. 기관 계정 신청 때 지역 칸을 미리 채웁니다.
export function centerRegion(c: NationalCenter): string {
  const sido = SIDO.find((x) => x.name === c.sido);
  const area = sido?.areas.filter(([, name]) => c.address.includes(` ${name}`)).sort((a, b) => b[1].length - a[1].length)[0];
  return sido && area ? `${sido.name} ${area[1]}` : '';
}

// 계정 이름(예: '고양상공회의소')이 전국 목록의 어느 센터인지. 운영기관 이름이 겹치면
// ('경북경영자총협회' · '경북경영자총협회 경북북부') 가장 길게 맞는 쪽으로 정합니다.
export const matchCenter = (orgName: string) =>
  NATIONAL_CENTERS.filter((n) => orgName.includes(n.operator)).sort((a, b) => b.operator.length - a.operator.length)[0];

// 센터 홈페이지 기본 주소(/center/<운영기관>). 센터가 홈페이지를 만들기 전에도 이 주소로 주소·전화가 나옵니다.
export const centerSlug = (c: NationalCenter) => c.operator.replace(/\s+/g, '');
export const centerBySlug = (slug: string) => NATIONAL_CENTERS.find((c) => centerSlug(c) === slug);

// 전국 중장년내일센터 공통 서비스 (고용24 안내 기준). 홈페이지를 처음 만들 때 채워 두고, 만들기 전 기본 페이지에도 보여 줍니다.
export const CENTER_SERVICES = [
  { title: '생애경력설계', target: '재직 중인 40세 이상', desc: '자가진단으로 그동안 쌓은 경력자산을 확인하고 앞으로의 진로를 함께 설계합니다.' },
  { title: '전직스쿨', target: '퇴직 예정자', desc: '퇴직을 앞두고 변화에 대비하는 마음가짐과 전직에 필요한 기술을 익힙니다.' },
  { title: '재도약 프로그램', target: '퇴직 후 구직 중인 40세 이상', desc: '이력서·자기소개서 작성, 면접 실습으로 구직 역량을 높이고 동아리 활동으로 함께 준비합니다.' },
  { title: '1:1 전직지원 상담', target: '40세 이상 구직자', desc: '전담 컨설턴트가 6개월 동안 상담과 취업 알선을 도와드립니다. 모든 서비스는 무료입니다.' },
  { title: '기업 인재 추천', target: '중장년을 채용하려는 기업', desc: '구인 신청을 받아 경력과 조건에 맞는 중장년 인재를 추천해 드립니다.' },
];

// 우리 지역 센터: 같은 시·군·구의 센터, 없으면 같은 시·도의 센터. 홈과 상단 지역 버튼이 함께 씁니다.
export function regionCenters(region: Region): NationalCenter[] {
  const sameArea = NATIONAL_CENTERS.filter((c) => centerRegion(c) === region.key);
  return sameArea.length ? sameArea : NATIONAL_CENTERS.filter((c) => c.sido === region.sido.name);
}
