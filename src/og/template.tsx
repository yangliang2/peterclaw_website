import { ogBrand, OG_HEIGHT, OG_WIDTH } from './brand.ts';

export type OgTemplateInput = {
  title: string;
  dateLabel: string;
  tags: string[];
  sectionLabel: string;
};

function titleFontSize(title: string): number {
  const length = [...title].length;
  if (length > 48) return 44;
  if (length > 32) return 52;
  if (length > 20) return 60;
  return 68;
}

function fontFamily(text: string): string {
  return /[\u4e00-\u9fff]/.test(text) ? 'Noto Sans SC' : 'Inter';
}

export function OgTemplate({ title, dateLabel, tags, sectionLabel }: OgTemplateInput) {
  const tagLine = tags.slice(0, 4).join(' · ');
  const titleSize = titleFontSize(title);

  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 88px',
        background: `linear-gradient(135deg, ${ogBrand.bgFrom} 0%, ${ogBrand.bgTo} 100%)`,
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 56,
          right: 56,
          bottom: 56,
          border: `2px solid ${ogBrand.accentMuted}`,
          borderRadius: 24,
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: ogBrand.accent,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span>{sectionLabel}</span>
          <span style={{ color: ogBrand.muted }}>·</span>
          <span style={{ color: ogBrand.body, textTransform: 'none', letterSpacing: 0 }}>{dateLabel}</span>
        </div>

        <div
          style={{
            display: 'flex',
            color: ogBrand.title,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.15,
            fontFamily: fontFamily(title),
            maxWidth: 980,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 }}>
          {tagLine ? (
            <div
              style={{
                color: ogBrand.body,
                fontSize: 28,
                lineHeight: 1.3,
                fontFamily: fontFamily(tagLine),
              }}
            >
              {tagLine}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: ogBrand.title,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${ogBrand.accent} 0%, #3b82f6 100%)`,
              display: 'flex',
            }}
          />
          <span style={{ fontFamily: 'Inter' }}>{ogBrand.siteName}</span>
        </div>
      </div>
    </div>
  );
}

export function OgDefaultTemplate() {
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 96px',
        background: `linear-gradient(135deg, ${ogBrand.bgFrom} 0%, ${ogBrand.bgTo} 100%)`,
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 56,
          right: 56,
          bottom: 56,
          border: `2px solid ${ogBrand.accentMuted}`,
          borderRadius: 24,
          display: 'flex',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ color: ogBrand.accent, fontSize: 28, fontWeight: 700 }}>AI-Native Website</div>
        <div style={{ color: ogBrand.title, fontSize: 72, fontWeight: 700 }}>{ogBrand.siteName}</div>
        <div style={{ color: ogBrand.body, fontSize: 32 }}>Built in public by an AI team</div>
      </div>
    </div>
  );
}
