import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Award, MapPin, Briefcase, FileText, Save } from 'lucide-react';

interface ProfileData {
  name: string;
  birthYear: string;
  phone: string;
  email: string;
  jobCategory: string;
  location: string;
  experience: string;
  skills: string;
  bio: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: '홍길동',
    birthYear: '1972',
    phone: '010-1234-5678',
    email: 'gildong.hong@gmail.com',
    jobCategory: '정규직/전문직',
    location: '서울 강남구',
    experience: '경영 관리 및 총무 업무 20년 근무\n대기업 기획실 총괄 팀장 역임\n스타트업 자문위원 활동',
    skills: '비즈니스 기획, 자금 조달 컨설팅, 엑셀/PPT 실무, 멘토링',
    bio: '안녕하세요. 20년 이상 대기업 및 중소기업에서 인사/기획 업무를 전담했던 홍길동입니다. 은퇴 후 저의 소중한 비즈니스 지식과 문제 해결 노하우를 살려 중소기업의 든든한 멘토이자 파트너로서 기여하고 싶습니다.'
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('career_bridge_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse profile data', e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('career_bridge_profile', JSON.stringify(profile));
    setSaveStatus('성공적으로 저장되었습니다!');
    setIsEditing(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Calculate profile completion score
  const calculateScore = () => {
    let score = 0;
    const fields = Object.keys(profile) as Array<keyof ProfileData>;
    fields.forEach(field => {
      if (profile[field].trim() !== '') {
        score += 11.1; // 9 fields
      }
    });
    return Math.min(Math.round(score), 100);
  };

  const completionScore = calculateScore();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">내 커리어 프로필</h1>
          <p className="page-subtitle">
            이력서와 경력 정보를 상세히 입력하시면, 본인의 전문 분야에 알맞은 일자리 정보와 맞춤 교육 과정을 실시간으로 추천해 드립니다.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* Profile Overview (Left Panel) */}
          <div style={{ 
            flex: '1 1 350px', 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '30px', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Avatar Circle */}
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '4px solid var(--border-color)'
            }}>
              <User size={48} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>{profile.name}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{profile.birthYear}년생 ({new Date().getFullYear() - parseInt(profile.birthYear) + 1}세)</p>

            {/* Profile Completion Score */}
            <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-secondary)' }}>프로필 완성도</span>
                <span style={{ color: 'var(--primary)' }}>{completionScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completionScore}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'left' }}>
                {completionScore < 100 ? '💡 경력 및 자기소개를 채우면 완성도 100%가 됩니다.' : '🎉 프로필이 완벽합니다! 맞춤형 제안을 받아보세요.'}
              </p>
            </div>

            {/* Quick Contacts */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Phone size={16} style={{ color: 'var(--primary)' }} />
                <span>{profile.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span>{profile.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>{profile.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Briefcase size={16} style={{ color: 'var(--primary)' }} />
                <span>희망 형태: {profile.jobCategory}</span>
              </div>
            </div>
          </div>

          {/* Profile Edit/View Form (Right Panel) */}
          <div style={{ 
            flex: '2 1 500px', 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '40px 30px', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>경력 및 상세 정보</h2>
              <div>
                {saveStatus && <span style={{ color: 'var(--success)', fontSize: '0.9rem', marginRight: '12px', fontWeight: '600' }}>{saveStatus}</span>}
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? '취소' : '정보 수정'}
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>이름</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>출생년도</label>
                    <input type="number" name="birthYear" value={profile.birthYear} onChange={handleChange} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>연락처</label>
                    <input type="text" name="phone" value={profile.phone} onChange={handleChange} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>이메일</label>
                    <input type="email" name="email" value={profile.email} onChange={handleChange} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>희망 근무 형태</label>
                    <select name="jobCategory" value={profile.jobCategory} onChange={handleChange}>
                      <option value="정규직/전문직">정규직/전문직</option>
                      <option value="파트타임/알바">파트타임/알바</option>
                      <option value="시니어 인턴">시니어 인턴</option>
                      <option value="공공/공익형">공공/공익형</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>희망 근무지</label>
                    <input type="text" name="location" value={profile.location} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>주요 경력 사항</label>
                  <textarea name="experience" rows={4} value={profile.experience} onChange={handleChange} placeholder="근무했던 직장, 직무 및 기간을 입력하세요."></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>보유 기술 및 자격증</label>
                  <textarea name="skills" rows={2} value={profile.skills} onChange={handleChange} placeholder="보유 기술, 자격증 등을 입력하세요 (예: 엑셀, 지게차운전기능사, 경리 등)."></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>자기소개 및 포부</label>
                  <textarea name="bio" rows={4} value={profile.bio} onChange={handleChange} placeholder="자유롭게 본인의 강점을 포함해 소개글을 남겨주세요."></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', marginTop: '10px' }}>
                  <Save size={18} />
                  저장하기
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <FileText size={18} />
                    자기 소개
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', lineHeight: '1.7' }}>
                    {profile.bio || '등록된 내용이 없습니다.'}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Briefcase size={18} />
                    주요 경력 사항
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', lineHeight: '1.7' }}>
                    {profile.experience || '등록된 내용이 없습니다.'}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Award size={18} />
                    보유 기술 및 강점
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {profile.skills ? profile.skills.split(',').map((skill, index) => (
                      <span key={index} className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                        {skill.trim()}
                      </span>
                    )) : <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>등록된 내용이 없습니다.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
