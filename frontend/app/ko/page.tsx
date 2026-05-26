"use client";

import React, { useState, useEffect } from "react";
import { 
  PenTool, Cpu, Layers, HardHat, Award, ExternalLink, 
  Mail, Phone, Send, Globe, Sun, Moon, Menu, X
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { AnimatedSection, AnimatedCard } from "../../components/AnimatedSection";
import "../../components/Navbar.css"; // Enforce flawless layout of navbar elements

export default function KoreanHome() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Silent background visitor traffic analytics tracking for Korean segment
    fetch("/api/proxy?endpoint=/api/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/ko" })
    }).catch((err) => console.error("Silent analytics tracking failed:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 1. Sleek Top Contact Strip */}
      <div className="top-contact-bar">
        <div className="top-contact-content">
          <a href="https://wa.me/923440708494?text=Hi%20,%20I%20am%20coming%20from%20your%20website%20,%20Can%20i%20get%20more%20info%20about%20your%20business%20?" target="_blank" rel="noreferrer" className="top-contact-link">
            <Phone size={13} style={{ marginRight: '6px' }} />
            <span>+92 344 0708494</span>
          </a>
          <a href="mailto:thealidevmail@gmail.com" className="top-contact-link">
            <Mail size={13} style={{ marginRight: '6px' }} />
            <span>thealidevmail@gmail.com</span>
          </a>
        </div>
      </div>

      {/* 2. Self-Contained Korean Navigation Bar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <a href="/ko" className="logo">
            <div className="logo-img-wrapper">
              <Image src="/logo_final.png" alt="Ali CNC Logo" width={80} height={44} priority className="logo-img" style={{ width: 'auto', height: '100%' }} />
            </div>
            <span className="logo-text">Ali<span className="gradient-text">CNC</span></span>
          </a>
          
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#services" onClick={() => setMenuOpen(false)}>서비스 분야</a>
            <a href="#why-choose-us" onClick={() => setMenuOpen(false)}>설계 강점</a>
            <a href="#experience" onClick={() => setMenuOpen(false)}>실무 이력</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>자주 묻는 질문</a>
            
            <div className="nav-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {mounted && (
                <button 
                  className="theme-toggle" 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}
              
              {/* Globe Switcher Back to Global English Page */}
              <a href="/" className="lang-link" style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Globe size={16} />
                <span>Global (EN)</span>
              </a>
            </div>

            <a href="#contact" className="btn-primary nav-btn" onClick={() => setMenuOpen(false)}>
              도면 견적 문의
            </a>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* 3. Native Korean Main Content */}
      <main>
        {/* Hero Section */}
        <AnimatedSection className="hero-section" id="home">
          <Image src="/hero_bg.png" alt="High-Precision CNC Woodshop Floor" fill priority className="hero-bg-image" style={{ objectFit: 'cover', opacity: 0.1 }} />
          <div className="hero-content">
            <div style={{ marginBottom: '2rem' }}>
              <Image src="/logo_final.png" alt="Ali CNC Logo" width={220} height={120} priority style={{ margin: '0 auto', objectFit: 'contain', height: 'auto' }} />
            </div>
            <span className="hero-greeting" style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--accent-color)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              우리는 도면을 설계하고, 대표님은 스핀들을 돌립니다.™
            </span>
            <h1 className="hero-title">
              고정밀 CAD/CAM <br />
              <span className="gradient-text">B2B 도면 & G-코드</span> 제작 대행
            </h1>
            <p className="hero-description">
              불완전한 벡터 도면과 비최적화 툴패스로 인해 고가의 목재 합판과 아크릴 자재를 낭비하지 마세요. 
              Veteran operator인 Raja Muhammad Ali Asghar 대표가 다년간 실제 가구 공방 및 조각실 현장에서 스핀들을 조작하고 톱밥을 마시며 쌓은 노하우를 녹여냅니다. 
              기계 멈춤, 가공 면 뜯김, 툴 충돌 걱정 없는 완전무결하고 정밀한 CNC 최적화 가공 도면을 이메일과 카카오톡으로 신속하게 전송해 드립니다.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn-primary">카카오톡 B2B 견적 문의하기</a>
            </div>
          </div>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection className="section" id="services">
          <h2 className="section-title">CNC 특화 <span className="gradient-text">CAD/CAM 서비스</span></h2>
          <div className="grid-3">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <Layers className="service-icon" size={40} />
              <h3>3D CAD 모델링 & 디지털 도면 대행</h3>
              <p>손그림 스케치, 낙서 수준의 스펙 메모, 또는 가공용 PDF 도면을 정밀한 3D 캐드 도면 파일(.STEP, .IGES, .STL, .DWG)로 변환해 드립니다. 가공 및 조립이 즉시 가능한 조립 공차 완벽 설계.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <Cpu className="service-icon" size={40} />
              <h3>고효율 G-코드 툴패스 프로그래밍</h3>
              <p>Vectric Aspire를 활용하여 귀사의 목공 기계, 스핀들 마력, 가공 속도(Feeds & Speeds)에 커스텀 설계된 툴패스 파일(.NC, .TAP)을 출력합니다. 가공 속도 단축 및 고가 비트 발열 파손 예방.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <HardHat className="service-icon" size={40} />
              <h3>DFM 설계 선행 검수 및 시뮬레이션</h3>
              <p>값비싼 하드우드 원목, 자작나무 합판을 베큠 테이블에 올리기 전에 3D 시뮬레이션으로 충돌 오차를 미리 점검합니다. 툴패스 오버랩, 베큠 영역 침범, 조각 깊이를 완벽히 사전 선행 통제합니다.</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Why Choose Us Section */}
        <AnimatedSection className="section" id="why-choose-us">
          <h2 className="section-title">현장 작업자의 <span className="gradient-text">확실한 차이점</span></h2>
          <div className="grid-3">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <PenTool className="service-icon" size={40} />
              <h3>노드 최적화 베지에 벡터 곡선</h3>
              <p>설계에 불필요한 캐드 노드가 가득하면 CNC 갠트리가 뚝뚝 끊기며 구동하여 원목 단면에 미세한 흔들림 절삭 자국(chatter marks)이 남게 됩니다. 당사는 초정밀 곡선 벡터화로 실크처럼 부드러운 가공 마감을 완성합니다.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <h3>합판 자재 손실 최소화 네스팅</h3>
              <p>원목과 수입 합판 단가는 날로 상승하고 있습니다. 고효율 공간 분할 알고리즘을 사용해 대표님의 MDF, 자작나무, 아크릴 판재 공간을 1mm²까지 알뜰하게 활용하도록 집약적인 네스팅 배열을 설계합니다.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <h3>실제 목공소 세팅 경력 대표 설계</h3>
              <p>책상 앞에만 앉아 디지털 그림을 그리는 비실무 디자이너와 다릅니다. 당사 대표는 기계실 제로 원점을 잡고 백래시 조율과 비트를 직접 교체하며 톱밥을 치우던 실무 경력을 보유해, 기계 컨트롤러의 특성을 완전히 꿰뚫고 있습니다.</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* FAQ Section */}
        <AnimatedSection className="section" id="faq">
          <h2 className="section-title">자주 묻는 <span className="gradient-text">질문 (명확한 답변)</span></h2>
          <div className="grid-2">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <h3>Q. 목재나 원판 부품을 실제 가공해서 택배로 배송해 주시나요?</h3>
              <p>아니요. 당사는 100% 디지털 CAD/CAM 가공 도면 및 G코드 설계 대행 가상 팩토리입니다. 실물 자재 배송에 드는 값비싼 화물 물류비, 인천항 통관 지연, 파손 부담 없이, 대표님의 이메일과 카카오톡으로 신속히 정밀 블루프린트를 전송합니다.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <h3>Q. 견적 문의와 작업 의뢰는 어떤 절차로 진행되나요?</h3>
              <p>하단의 카카오톡 오픈채팅 혹은 이메일로 손그림 낙서, 치수 스케치, dimensioned PDF 도면을 보내주시면 즉시 검토하여 회신을 드립니다. 견적 확정 후 3D 시뮬레이션 모델 렌더링 검수를 거쳐 완벽한 최종 파일을 전송해 드립니다.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <h3>Q. 호환되는 소프트웨어 및 가공 파일 형식은 어떻게 되나요?</h3>
              <p>국내외 모든 상업용 CNC 라우터 컨트롤러와 완벽 호환됩니다. 벡터 파일(.DXF, .SVG), 3D 릴리프 모델(.STEP, .IGES, .STL), 기계 구동 G코드(.NC, .TAP)를 지원하며, 주 설계 툴은 AutoCAD, Onshape, Vectric Aspire입니다.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.4}>
              <h3>Q. 도면 출고까지 제작 소요 기간은 얼마나 걸리나요?</h3>
              <p>단순 2D 판재 레이아웃 및 공간 네스팅 배열은 24~48시간 이내에 번개 출고됩니다. 복잡한 3D 조립 가구 기계식 하드웨어 모듈화 모델링 및 G코드 최적화는 3~5일이 소요됩니다. 급한 공장 가동 일정이 있으시면 카카오톡으로 선 배정을 신청하세요.</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Experience Timeline Section */}
        <AnimatedSection className="section" id="experience">
          <h2 className="section-title">알리 대표의 <span className="gradient-text">실전 Workshop 이력</span></h2>
          <div className="experience-container">
            <div className="timeline">
              <AnimatedCard className="timeline-item glass-panel" delay={0.1}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>Virtual CAD/CAM 벡터 최고 설계 감독</h4>
                  <h5>Ali CNC (디지털 프리랜서 제국)</h5>
                  <p className="timeline-date">2026년 5월 – 현재</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    완전 virtuales B2B 프리랜서 캐드캠 오피스 공장 운영. 글로벌 고객사(미국, 유럽, 국내)를 위한 정밀 기계 부품 및 가공 합판 최적화 G코드 제어 설계.
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="timeline-item glass-panel" delay={0.2}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>현장 CNC 스핀들 오퍼레이터 & 기계실 테크니션</h4>
                  <h5>Umer CNC (실제 물리적 톱밥 가공공장)</h5>
                  <p className="timeline-date">2025년 9월 – 2026년 5월</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    실제 대형 원목 가구 공장의 톱밥실에서 근무. 하드우드 옹이 깨짐 방지, 스핀들 모터 정밀 제어, 배큠 압력 조절 등 현장 공구 조작과 정비를 마스터하며 물리적 감각 습득.
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="timeline-item glass-panel" delay={0.3}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>공인 G-Code 제어 설계사 (TITAN-3M & 2M)</h4>
                  <h5>TITANS of CNC: 아카데미</h5>
                  <p className="timeline-date">2026년 4월</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    세계 1위 CNC 마시닝 테크놀로지 칼리지 교육 과정 이수. G코드 좌표계 옵셋 설정 및 좌표 구동 정합성을 기계 코딩에 반영.
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="timeline-item glass-panel" delay={0.4}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>Virtual 우드 카빙 벡터 설계 에이전트</h4>
                  <h5>파키스탄 소프트웨어 수출국 (PSEB)</h5>
                  <p className="timeline-date">2026년 4월 – 현재</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    파키스탄 소프트웨어 수출국(PSEB) 공인 프리랜서 테크니컬 어드바이저 등록. 안전하고 효율적인 설계 납품 도면 보증.
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedSection>

        {/* Contact Section */}
        <AnimatedSection className="section" id="contact">
          <h2 className="section-title">B2B 신속 <span className="gradient-text">견적 & 도면 검수</span></h2>
          <p className="hero-description" style={{ textAlign: "center", marginBottom: "4rem" }}>
            가공하려는 도면 스케치, 규격 치수 메모, 또는 캐드 원본 파일을 전달해 주세요. 오차 없는 정밀 판독을 약속합니다.
          </p>

          <div className="contact-grid">
            {/* Direct Contact Methods */}
            <div className="contact-methods">
              <AnimatedCard className="glass-panel contact-method-card" delay={0.1}>
                {/* Yellow Theme for KakaoTalk in South Korea */}
                <div className="method-icon-wrapper" style={{ background: '#ffcd00', color: '#3c1e1e' }}>
                  <Phone size={24} />
                </div>
                <div className="method-info">
                  <h3>카카오톡 1:1 오픈채팅 견적</h3>
                  <p>공방 사장님들이 가장 편리하게 이용하시는 카카오톡 오픈채팅 실시간 접수 채널입니다.</p>
                  <a href="https://open.kakao.com/" target="_blank" rel="noreferrer" className="btn-primary full-width" style={{ background: '#ffcd00', color: '#3c1e1e', animation: 'none', border: 'none' }}>
                    카카오톡 오픈채팅 문의하기
                  </a>
                  <p className="contact-microcopy" style={{ fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.7, marginTop: '0.75rem', lineHeight: '1.4' }}>
                    ⚡ 실시간 한국어 데스크: 한국 목공소 업무 시간대에 맞춰 긴급 도면 피드백 및 조율을 실시간으로 조력합니다.
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="glass-panel contact-method-card" delay={0.2}>
                <div className="method-icon-wrapper email">
                  <Mail size={24} />
                </div>
                <div className="method-info">
                  <h3>이메일 기술 문서 접수</h3>
                  <p>용량이 큰 캐드 원본 도면 파일(.DWG, .DXF)은 이메일로 첨부해 주시면 신속 판독합니다.</p>
                  <a href="mailto:thealidevmail@gmail.com" className="btn-outline full-width">
                    thealidevmail@gmail.com
                  </a>
                </div>
              </AnimatedCard>

              <AnimatedCard className="glass-panel contact-method-card" delay={0.3}>
                <div className="method-icon-wrapper cadcrowd">
                  <ExternalLink size={24} />
                </div>
                <div className="method-info">
                  <h3>CadCrowd 공인 캐드 포트폴리오</h3>
                  <p>글로벌 전문가 플랫폼을 통해 당사의 공식 인증 기계 설계 포트폴리오를 확인하세요.</p>
                  <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-outline full-width">
                    CadCrowd 프로필 보기
                  </a>
                </div>
              </AnimatedCard>
            </div>

            {/* Localized B2B Intake Form */}
            <div className="contact-form-container">
              <AnimatedCard className="glass-panel form-card" delay={0.3}>
                <h2 className="form-title">가공 도면 접수 및 기술 검토 요청</h2>
                <form action="https://formspree.io/f/mrejorww" method="POST" className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name">의뢰인 또는 업체명</label>
                    <input type="text" id="name" name="name" placeholder="예: 홍길동 (길동목공소)" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">비즈니스 이메일 주소</label>
                    <input type="email" id="email" name="email" placeholder="you@company.com" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">가공 타입 / 사용 소프트웨어</label>
                    <input type="text" id="subject" name="subject" placeholder="예: 싱크대 도면 네스팅, 아스파이어 G코드" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">의뢰 스펙 및 라우터 기계 정보</label>
                    <textarea id="message" name="message" rows={5} placeholder="MDF/원목 두께, 사용 가공 비트 직경, 기계 컨트롤러 스펙, 요구 마감 정도 등 상세 요청사항을 적어주시면 더 오차 없는 설계가 가능합니다..." required></textarea>
                  </div>
                  <button type="submit" className="btn-primary submit-btn">
                    <Send size={18} style={{ marginRight: '8px' }} />
                    견적 및 기술 검수 제출
                  </button>
                </form>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* 4. Native Korean Footer */}
      <footer className="footer">
        <div className="footer-content" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            스핀들이 멈춰있는 시간은 고스란히 손실입니다. <br />
            지금 바로 완벽한 가공 도면을 확보하세요.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            합판 재단 에러, 아스파이어 공구 경로 깨짐, 툴 충돌로 인한 작업 중단을 근절하세요. 
            라우터 베트 위에 누워있는 기계실의 기계 감각을 지닌 B2B 전문 파트너와 함께 가공 능률을 200% 확장하세요.
          </p>

          <a href="#contact" className="btn-primary" style={{ padding: '12px 30px' }}>
            B2B 카카오톡 견적 접수하기
          </a>

          <div className="footer-bottom">
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', justifyContent: 'center', marginBottom: '2rem' }}>
              <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>CadCrowd</a>
              <a href="https://www.crunchbase.com/organization/ali-cnc-pakistan" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>Crunchbase</a>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              © {new Date().getFullYear()} Ali CNC SMC Ptv Ltd. Made in Rawalpindi with love, coffee, and 100% digital, physical-dust-free virtual sawdust. <br />
              본 웹사이트를 빌드하고 구동하는 과정에서 그 어떤 라우터 머신이나 날물도 다치지 않았음을 엄격히 증명합니다.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
