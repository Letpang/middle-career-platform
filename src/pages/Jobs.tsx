import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Filter } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  posted: string;
  description: string;
  requirements: string;
}

const Jobs: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const jobTypes = ['전체', '정규직/전문직', '파트타임/알바', '시니어 인턴', '공공/공익형'];

  const jobs: Job[] = [
    {
      id: 1,
      title: '시니어 은퇴 경영인 경영 자문 컨설턴트 모집',
      company: '㈜위드컨설팅그룹',
      location: '서울 강남구 (재택병행)',
      salary: '월 350만원 ~ (경력별 협의)',
      type: '정규직/전문직',
      tags: ['경력 15년 이상', '주 3일 가능', '은퇴자 우대'],
      posted: '오늘 등록',
      description: '중소기업 및 스타트업 경영 관리, 마케팅, 재무 자문을 제공하실 대기업/공공기관 퇴직 간부 및 임원 출신 전문가를 모십니다.',
      requirements: '기업 경영 관리 또는 자문 분야 경력 15년 이상 소지자'
    },
    {
      id: 2,
      title: '지역 도서관 시니어 도서 문화 매니저',
      company: '행복교육문화재단',
      location: '경기 성남시',
      salary: '시급 11,500원',
      type: '파트타임/알바',
      tags: ['주 5일', '일 4시간', '초보 가능'],
      posted: '2일 전',
      description: '지역 구립 도서관에서 아동 도서 정리, 독서 프로그램 보조 및 도서 대출/반납 서비스를 조율하고 관리하는 업무입니다.',
      requirements: '친절한 고객 서비스 마인드 소유자, 성실하고 책임감 강하신 분'
    },
    {
      id: 3,
      title: '스마트스토어 운영 및 CS 고객관리 시니어 파트너',
      company: '디지털커머스랩',
      location: '서울 마포구',
      salary: '월 180만원 (주 30시간)',
      type: '시니어 인턴',
      tags: ['디지털 교육 이수자 우대', '컴퓨터 활용 가능'],
      posted: '3일 전',
      description: '쇼핑몰 고객 문의 응대(게시판, 톡톡), 송장 출력 및 주문 접수 관리 업무를 담당할 시니어 디지털 인재를 채용합니다.',
      requirements: '스마트폰 및 PC를 통한 인터넷 쇼핑몰 어드민 사용 가능자'
    },
    {
      id: 4,
      title: '지역 아동 안심 등하교 지도 요원',
      company: '우리동네 안전지킴이',
      location: '인천 연수구',
      salary: '월 90만원',
      type: '공공/공익형',
      tags: ['주 5일', '일 3시간', '신체 건강한 분'],
      posted: '1주 전',
      description: '초등학교 주변 횡단보도 및 어린이 보호구역에서 아침 등교 및 오후 하교 시간 교통 안전을 지도하고 예방 순찰을 돕습니다.',
      requirements: '신체 건강하며 아이들을 사랑하고 책임감 있는 60세 이상 누구나'
    },
    {
      id: 5,
      title: '시니어 아파트 관리 및 시설 보안 대원',
      company: '㈜제일종합관리',
      location: '경기 용인시',
      salary: '월 240만원 (격일 교대)',
      type: '정규직/전문직',
      tags: ['경비지도사 소지자 우대', '신체 건강'],
      posted: '5일 전',
      description: '신축 단지 내 차량 관리, 시설 안전 순찰 및 방문객 안내를 처리하는 경비/보안직 직무입니다.',
      requirements: '경비 신임 교육 이수자 필수 (미이수 시 교육 지원 가능)'
    },
    {
      id: 6,
      title: '디지털 배움터 정보화 보조 강사',
      company: '서울시 디지털 교육 추진단',
      location: '서울 전역',
      salary: '시간당 15,000원',
      type: '공공/공익형',
      tags: ['IT 자격증 소지자', '디지털 강사 경험자'],
      posted: '1일 전',
      description: '복지관 및 주민센터 디지털 배움터에서 키오스크 교육, 스마트폰 활용 교육 등 주강사를 도와 보조 및 실습 지도를 담당합니다.',
      requirements: '컴퓨터/스마트폰 활용 중급 이상 및 관련 자격 소지자 우대'
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesType = selectedType === '전체' || job.type === selectedType;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">중장년 맞춤 일자리</h1>
          <p className="page-subtitle">
            단순 업무부터 과거의 커리어 역량을 발휘할 수 있는 전문적인 일자리까지, 오랜 노하우를 발휘할 최적의 직무를 찾아드립니다.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {/* Search and Filter Section */}
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
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                placeholder="직무명, 기업명, 키워드를 검색하세요..." 
                style={{ width: '100%', paddingLeft: '40px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Filter size={18} style={{ color: 'var(--text-secondary)', marginRight: '4px' }} />
              {jobTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    backgroundColor: selectedType === type ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: selectedType === type ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredJobs.map(job => (
              <div 
                className="card" 
                key={job.id} 
                style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  gap: '24px', 
                  alignItems: 'flex-start',
                  padding: '24px 30px'
                }}
              >
                {/* Job Core Details */}
                <div style={{ flex: '2 1 500px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span className="badge badge-secondary">{job.type}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.posted}</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '6px', color: 'var(--text-primary)' }}>{job.title}</h3>
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '12px' }}>{job.company}</p>
                  
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{job.description}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="badge" 
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements and Compensation */}
                <div style={{ 
                  flex: '1 1 250px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px', 
                  borderLeft: '1px solid var(--border-color)',
                  paddingLeft: '24px',
                  minHeight: '130px',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{job.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{job.salary}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>지원 자격:</strong> {job.requirements}
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => alert(`"${job.title}" 공고에 지원 절차를 안내해 드립니다. 프로필(이력서)을 최신화해 주세요!`)}
                  >
                    지원하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>해당 조건에 맞는 일자리 공고가 존재하지 않습니다. 다른 검색어로 시도해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
