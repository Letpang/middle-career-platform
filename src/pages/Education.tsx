import React, { useState } from 'react';
import { Search, Clock, BookOpen, Filter, CheckCircle } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  category: string;
  provider: string;
  duration: string;
  cost: string;
  status: '모집중' | '개강예정' | '마감';
  description: string;
  features: string[];
}

const Education: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['전체', '디지털/IT', '행정/경영', '생활/돌봄', '창업/부업'];

  const courses: Course[] = [
    {
      id: 1,
      title: '시니어 디지털 리터러시 & 스마트워크 지도사',
      category: '디지털/IT',
      provider: '한국디지털시니어협회',
      duration: '4주 (총 24시간)',
      cost: '무료 (전액 정부지원)',
      status: '모집중',
      description: '스마트폰, 키오스크, 협업 툴(Zoom, Notion 등) 활용법을 마스터하여 디지털 강사 및 보조강사로 활동할 수 있는 과정입니다.',
      features: ['실습 중심 강의', '자격증 발급 연계', '강사 인턴십 지원']
    },
    {
      id: 2,
      title: '스마트 스토어 및 오픈마켓 창업 기초 과정',
      category: '창업/부업',
      provider: '중장년일자리희망센터',
      duration: '6주 (총 36시간)',
      cost: '10만원 (80% 환급가능)',
      status: '모집중',
      description: '자신만의 상품을 온라인 스토어에 등록하고 판매, 마케팅하는 기초 실무를 배워 무자본/소자본 창업에 도전합니다.',
      features: ['1:1 상품 소싱 피드백', '상세페이지 디자인 팁', '마케팅 비용 지원 안내']
    },
    {
      id: 3,
      title: '행정 실무사 및 오피스 마스터 교육',
      category: '행정/경영',
      provider: '메가커리어 교육원',
      duration: '3주 (총 18시간)',
      cost: '무료 (내일배움카드 지원)',
      status: '개강예정',
      description: '한글, 엑셀, 파워포인트 문서 작성 능력을 업그레이드하여 일반 기업체나 단체의 사무직 재취업을 준비합니다.',
      features: ['엑셀 실무 템플릿 제공', '이력서용 포트폴리오 제작', '자격시험 대비']
    },
    {
      id: 4,
      title: '전문 요양원 관리자 & 시니어 케어 전문가 양성',
      category: '생활/돌봄',
      provider: '돌봄나눔사회적협동조합',
      duration: '8주 (총 64시간)',
      cost: '무료 (전액 국비지원)',
      status: '모집중',
      description: '요양보호사 소지자 또는 관심 있는 분들을 대상으로 돌봄 시설 관리자나 맞춤형 케어 서비스 리더로 육성하는 교육입니다.',
      features: ['현장 실습 포함', '취업 100% 매칭', '전문 심폐소생술 교육']
    },
    {
      id: 5,
      title: '생성형 AI (Gemini, ChatGPT) 업무 비서 활용 과정',
      category: '디지털/IT',
      provider: '미래융합교육진흥원',
      duration: '2주 (총 12시간)',
      cost: '5만원',
      status: '개강예정',
      description: '인공지능 비서를 활용하여 기획서 작성, 이메일 초안 작성, 자료 요약 등 실무 효율을 10배 높이는 초단기 실무 과정입니다.',
      features: ['실용 프롬프트 북 제공', '개인 맞춤 템플릿 실습', 'AI 자격 시험 할인']
    },
    {
      id: 6,
      title: '시니어 맞춤형 정리수납 전문가 2급',
      category: '생활/돌봄',
      provider: '한국정리수납협회',
      duration: '4주 (총 16시간)',
      cost: '무료 (재취업 바우처)',
      status: '마감',
      description: '정리수납의 이론과 실무를 습득하여 전문 정리수납 컨설턴트로 활동하거나 공간 대행업체로 재취업합니다.',
      features: ['고객 응대 기법 교육', '현장 실무 가이드 북 제공', '동문 네트워크 형성']
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === '전체' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">재취업 & 역량 교육</h1>
          <p className="page-subtitle">
            빠르게 변화하는 일자리 트렌드에 맞춰, 중장년층을 위해 설계된 실무 중심의 고품질 교육 프로그램을 제공합니다.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {/* Search and Filters */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          marginBottom: '40px',
          backgroundColor: 'var(--bg-secondary)', 
          padding: '24px', 
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                placeholder="관심 있는 교육명, 교육기관을 입력하세요..." 
                style={{ width: '100%', paddingLeft: '40px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Category Select for Mobile / Category List for Desktop */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Filter size={18} style={{ color: 'var(--text-secondary)', marginRight: '4px' }} />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Listing */}
        {filteredCourses.length > 0 ? (
          <div className="grid">
            {filteredCourses.map(course => (
              <div className="card" key={course.id} style={{ position: 'relative' }}>
                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-primary">{course.category}</span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '700', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    backgroundColor: 
                      course.status === '모집중' ? 'rgba(16, 185, 129, 0.1)' : 
                      course.status === '개강예정' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: 
                      course.status === '모집중' ? 'var(--success)' : 
                      course.status === '개강예정' ? 'var(--accent)' : 'var(--danger)'
                  }}>
                    {course.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', lineHeight: '1.4' }}>{course.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '12px' }}>{course.provider}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>{course.description}</p>
                
                {/* Key specs */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  padding: '12px', 
                  backgroundColor: 'var(--bg-primary)', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}><strong>기간:</strong> {course.duration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}><strong>비용:</strong> {course.cost}</span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div style={{ marginBottom: '20px', flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>과정 혜택</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {course.features.map((feature, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={`btn ${course.status === '마감' ? 'btn-secondary' : 'btn-primary'}`} 
                  style={{ width: '100%' }}
                  disabled={course.status === '마감'}
                  onClick={() => alert(`"${course.title}" 교육 신청 및 세부 안내 페이지로 이동합니다.`)}
                >
                  {course.status === '마감' ? '접수 마감' : '신청하기'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>조건에 맞는 교육 과정이 없습니다. 다른 키워드로 검색해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
