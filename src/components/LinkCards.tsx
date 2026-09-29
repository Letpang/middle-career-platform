import { keepPhones } from '../lib/text';
import { ExternalLink, Info } from 'lucide-react';
import type { LinkGroup, LinkSite } from '../data/links';

export const AccessBadge = ({ access }: { access?: LinkSite['access'] }) => {
  if (access === 'open') return <span className="chip chip-good">가입 없이 열람</span>;
  if (access === 'login') return <span className="chip chip-warn">회원가입 필요</span>;
  return null;
};

export const LinkCard = ({ site }: { site: LinkSite }) => (
  <a
    href={site.url}
    target="_blank"
    rel="noopener noreferrer"
    className="card"
    style={{ flex: '1 1 240px', padding: '16px 18px', textDecoration: 'none', gap: '6px', height: 'auto' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem' }}>{site.name}</span>
      <ExternalLink size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </div>
    <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{keepPhones(site.desc)}</span>
    <div>
      <AccessBadge access={site.access} />
    </div>
  </a>
);

export const LinkGroups = ({ groups }: { groups: LinkGroup[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
    {groups.map((g) => (
      <div key={g.category}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)' }}>{g.category}</h3>
        {g.note && (
          <div className="notice notice-warn" style={{ marginBottom: '12px' }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{g.note}</span>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {g.sites.map((s) => (
            <LinkCard key={s.name} site={s} />
          ))}
        </div>
      </div>
    ))}
  </div>
);
