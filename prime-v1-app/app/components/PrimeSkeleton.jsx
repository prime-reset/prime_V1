"use client";

export default function PrimeSkeleton({ type = "cards" }) {
  return (
    <main className="prime-skeleton-page" aria-hidden="true">
      <SkeletonStyles />

      <div className="prime-skeleton-shell">
        {type === "profile" && <ProfileSkeleton />}
        {type === "dashboard" && <DashboardSkeleton />}
        {type === "journal" && <JournalSkeleton />}
        {type === "coach" && <CoachSkeleton />}
        {type === "list" && <ListSkeleton />}
        {type === "cards" && <CardsSkeleton />}
      </div>
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="skeleton-topbar">
        <Skeleton width="82px" height="13px" radius="7px" />
        <Skeleton width="46px" height="46px" radius="16px" />
      </div>

      <section className="skeleton-card skeleton-profile-card">
        <div className="skeleton-profile-head">
          <Skeleton width="82px" height="82px" radius="26px" />

          <div className="skeleton-grow">
            <Skeleton width="58%" height="30px" radius="10px" />
            <Skeleton width="78%" height="13px" radius="7px" />
            <Skeleton width="48%" height="10px" radius="6px" />
          </div>
        </div>

        <div className="skeleton-badges">
          <Skeleton width="116px" height="30px" radius="999px" />
          <Skeleton width="142px" height="30px" radius="999px" />
        </div>
      </section>

      <section className="skeleton-card skeleton-identity-card">
        <Skeleton width="104px" height="10px" radius="6px" />
        <Skeleton width="66%" height="30px" radius="10px" />
        <Skeleton width="100%" height="13px" radius="7px" />
        <Skeleton width="84%" height="13px" radius="7px" />

        <div className="skeleton-score-area">
          <Skeleton width="128px" height="128px" radius="50%" />

          <div className="skeleton-grow skeleton-copy-stack">
            <Skeleton width="78%" height="14px" radius="7px" />
            <Skeleton width="94%" height="14px" radius="7px" />
            <Skeleton width="82%" height="14px" radius="7px" />
          </div>
        </div>
      </section>

      <div className="skeleton-three-grid">
        {[1, 2, 3].map((item) => (
          <section className="skeleton-card skeleton-stat-card" key={item}>
            <Skeleton width="24px" height="24px" radius="8px" />
            <div>
              <Skeleton width="70%" height="9px" radius="5px" />
              <Skeleton width="54%" height="22px" radius="8px" />
            </div>
          </section>
        ))}
      </div>

      <InfoSectionSkeleton rows={5} />
      <InfoSectionSkeleton rows={2} />
      <TimelineSkeleton />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="skeleton-topbar">
        <Skeleton width="98px" height="13px" radius="7px" />
        <Skeleton width="44px" height="44px" radius="15px" />
      </div>

      <Skeleton width="72%" height="42px" radius="12px" />
      <Skeleton width="92%" height="15px" radius="7px" />

      <section className="skeleton-card skeleton-dashboard-hero">
        <div className="skeleton-grow">
          <Skeleton width="116px" height="10px" radius="6px" />
          <Skeleton width="76%" height="29px" radius="10px" />
          <Skeleton width="94%" height="13px" radius="7px" />
        </div>
        <Skeleton width="112px" height="112px" radius="50%" />
      </section>

      <div className="skeleton-two-grid">
        {[1, 2, 3, 4].map((item) => (
          <section className="skeleton-card skeleton-metric-card" key={item}>
            <Skeleton width="24px" height="24px" radius="8px" />
            <Skeleton width="66%" height="10px" radius="6px" />
            <Skeleton width="48%" height="25px" radius="8px" />
            <Skeleton width="82%" height="11px" radius="6px" />
          </section>
        ))}
      </div>

      <section className="skeleton-card skeleton-chart-card">
        <Skeleton width="42%" height="12px" radius="6px" />
        <Skeleton width="100%" height="170px" radius="20px" />
      </section>
    </>
  );
}

function JournalSkeleton() {
  return (
    <>
      <Skeleton width="126px" height="12px" radius="6px" />
      <Skeleton width="76%" height="42px" radius="12px" />
      <Skeleton width="94%" height="15px" radius="7px" />

      <section className="skeleton-card skeleton-chapter-card">
        <div className="skeleton-grow">
          <Skeleton width="106px" height="10px" radius="6px" />
          <Skeleton width="58%" height="28px" radius="9px" />
          <Skeleton width="92%" height="13px" radius="7px" />
        </div>
        <Skeleton width="58px" height="58px" radius="18px" />
      </section>

      <section className="skeleton-card skeleton-summary-card">
        <Skeleton width="48px" height="48px" radius="16px" />
        <div className="skeleton-grow">
          <Skeleton width="96px" height="10px" radius="6px" />
          <Skeleton width="84%" height="21px" radius="8px" />
          <Skeleton width="100%" height="13px" radius="7px" />
          <Skeleton width="76%" height="13px" radius="7px" />
        </div>
      </section>

      <div className="skeleton-two-grid">
        {[1, 2, 3, 4].map((item) => (
          <section className="skeleton-card skeleton-metric-card" key={item}>
            <Skeleton width="70%" height="10px" radius="6px" />
            <Skeleton width="50%" height="26px" radius="8px" />
            <Skeleton width="86%" height="11px" radius="6px" />
          </section>
        ))}
      </div>

      <ListSkeleton />
    </>
  );
}

function CoachSkeleton() {
  return (
    <>
      <Skeleton width="116px" height="12px" radius="6px" />
      <Skeleton width="74%" height="42px" radius="12px" />
      <Skeleton width="96%" height="15px" radius="7px" />

      <section className="skeleton-card skeleton-large-card">
        <Skeleton width="104px" height="10px" radius="6px" />
        <Skeleton width="78%" height="29px" radius="10px" />
        <Skeleton width="100%" height="13px" radius="7px" />
        <Skeleton width="86%" height="13px" radius="7px" />

        <div className="skeleton-two-grid skeleton-inner-grid">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} width="100%" height="74px" radius="18px" />
          ))}
        </div>
      </section>

      <div className="skeleton-two-grid">
        {[1, 2].map((item) => (
          <section className="skeleton-card skeleton-metric-card" key={item}>
            <Skeleton width="24px" height="24px" radius="8px" />
            <Skeleton width="70%" height="10px" radius="6px" />
            <Skeleton width="62%" height="23px" radius="8px" />
          </section>
        ))}
      </div>

      <InfoSectionSkeleton rows={4} />
      <InfoSectionSkeleton rows={3} />
    </>
  );
}

function CardsSkeleton() {
  return (
    <div className="skeleton-two-grid">
      {[1, 2, 3, 4].map((item) => (
        <section className="skeleton-card skeleton-metric-card" key={item}>
          <Skeleton width="28px" height="28px" radius="9px" />
          <Skeleton width="72%" height="10px" radius="6px" />
          <Skeleton width="52%" height="25px" radius="8px" />
          <Skeleton width="88%" height="11px" radius="6px" />
        </section>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <section className="skeleton-list">
      {[1, 2, 3, 4].map((item) => (
        <div className="skeleton-card skeleton-list-item" key={item}>
          <Skeleton width="5px" height="100%" radius="999px" />

          <div className="skeleton-grow">
            <div className="skeleton-row">
              <div className="skeleton-grow">
                <Skeleton width="92px" height="9px" radius="5px" />
                <Skeleton width="136px" height="20px" radius="8px" />
              </div>

              <Skeleton width="54px" height="24px" radius="8px" />
            </div>

            <div className="skeleton-three-grid skeleton-list-grid">
              <Skeleton width="100%" height="58px" radius="15px" />
              <Skeleton width="100%" height="58px" radius="15px" />
              <Skeleton width="100%" height="58px" radius="15px" />
            </div>

            <Skeleton width="84%" height="12px" radius="6px" />
          </div>
        </div>
      ))}
    </section>
  );
}

function InfoSectionSkeleton({ rows = 4 }) {
  return (
    <section className="skeleton-card skeleton-info-section">
      <Skeleton width="126px" height="10px" radius="6px" />
      <Skeleton width="72%" height="23px" radius="8px" />

      <div className="skeleton-info-list">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="skeleton-info-row" key={index}>
            <Skeleton width="42%" height="12px" radius="6px" />
            <Skeleton width="34%" height="12px" radius="6px" />
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineSkeleton() {
  return (
    <section className="skeleton-card skeleton-info-section">
      <Skeleton width="112px" height="10px" radius="6px" />
      <Skeleton width="66%" height="23px" radius="8px" />

      <div className="skeleton-timeline">
        {[1, 2, 3].map((item) => (
          <div className="skeleton-timeline-item" key={item}>
            <Skeleton width="34px" height="34px" radius="13px" />
            <div className="skeleton-grow">
              <Skeleton width="62%" height="14px" radius="7px" />
              <Skeleton width="78%" height="11px" radius="6px" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Skeleton({ width = "100%", height = "14px", radius = "8px" }) {
  return (
    <span
      className="prime-skeleton-block"
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}

function SkeletonStyles() {
  return (
    <style jsx global>{`
      .prime-skeleton-page {
        min-height: 100vh;
        padding: 28px 16px 132px;
        background: #050505;
        font-family: Inter, Arial, sans-serif;
      }

      .prime-skeleton-shell {
        width: 100%;
        max-width: 460px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
      }

      .prime-skeleton-block {
        position: relative;
        display: block;
        max-width: 100%;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.065);
      }

      .prime-skeleton-block::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 22%,
          rgba(255, 255, 255, 0.075) 42%,
          rgba(212, 176, 106, 0.09) 50%,
          rgba(255, 255, 255, 0.075) 58%,
          transparent 78%
        );
        transform: translateX(-115%);
        animation: primeSkeletonShimmer 1.55s ease-in-out infinite;
      }

      .skeleton-card {
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 26px;
        background: #101010;
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.38);
      }

      .skeleton-topbar,
      .skeleton-profile-head,
      .skeleton-score-area,
      .skeleton-dashboard-hero,
      .skeleton-chapter-card,
      .skeleton-summary-card,
      .skeleton-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .skeleton-topbar {
        margin-bottom: 4px;
      }

      .skeleton-profile-head {
        align-items: flex-start;
      }

      .skeleton-grow {
        min-width: 0;
        flex: 1;
        display: grid;
        gap: 11px;
      }

      .skeleton-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
        margin-top: 18px;
      }

      .skeleton-identity-card {
        display: grid;
        gap: 13px;
      }

      .skeleton-score-area {
        margin-top: 8px;
      }

      .skeleton-copy-stack {
        gap: 14px;
      }

      .skeleton-two-grid,
      .skeleton-three-grid {
        display: grid;
        gap: 10px;
      }

      .skeleton-two-grid {
        grid-template-columns: 1fr 1fr;
      }

      .skeleton-three-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .skeleton-stat-card,
      .skeleton-metric-card {
        min-height: 112px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
      }

      .skeleton-info-section {
        display: grid;
        gap: 12px;
      }

      .skeleton-info-list {
        display: grid;
        margin-top: 4px;
      }

      .skeleton-info-row {
        min-height: 45px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.055);
      }

      .skeleton-info-row:last-child {
        border-bottom: none;
      }

      .skeleton-timeline {
        display: grid;
        gap: 14px;
        margin-top: 4px;
      }

      .skeleton-timeline-item {
        display: grid;
        grid-template-columns: 34px 1fr;
        gap: 12px;
        align-items: start;
      }

      .skeleton-dashboard-hero {
        align-items: center;
      }

      .skeleton-large-card,
      .skeleton-chart-card {
        display: grid;
        gap: 14px;
      }

      .skeleton-inner-grid {
        margin-top: 5px;
      }

      .skeleton-list {
        display: grid;
        gap: 10px;
      }

      .skeleton-list-item {
        min-height: 190px;
        display: grid;
        grid-template-columns: 5px 1fr;
        gap: 14px;
      }

      .skeleton-list-grid {
        margin: 5px 0;
      }

      @keyframes primeSkeletonShimmer {
        0% {
          transform: translateX(-115%);
        }

        100% {
          transform: translateX(115%);
        }
      }

      @media (max-width: 390px) {
        .prime-skeleton-page {
          padding-left: 14px;
          padding-right: 14px;
        }

        .skeleton-score-area,
        .skeleton-dashboard-hero {
          align-items: flex-start;
          flex-direction: column;
        }

        .skeleton-profile-head {
          gap: 13px;
        }

        .skeleton-three-grid {
          gap: 8px;
        }

        .skeleton-list-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .prime-skeleton-block::after {
          animation: none;
        }
      }
    `}</style>
  );
}
